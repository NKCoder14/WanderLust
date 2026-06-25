import jwt
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import Request, Header, HTTPException
from config import JWT_SECRET, CRON_SECRET

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def Create_Access_Token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

async def Require_Authentication(request: Request):
    token = request.cookies.get("wanderlust_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def Require_Cron_Or_Auth(request: Request, x_cron_secret: str = Header(None, alias="X-Cron-Secret")):
    if CRON_SECRET and x_cron_secret:
        if secrets.compare_digest(x_cron_secret, CRON_SECRET):
            return
    await Require_Authentication(request)