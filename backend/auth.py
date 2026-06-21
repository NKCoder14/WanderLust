import os
from fastapi import Header, HTTPException

API_SECRET = os.getenv("API_SECRET_KEY", "")

async def Requires_API_Key(x_api_key: str = Header(None, alias="X-API-Key")):
    if not API_SECRET:
        return

    if not x_api_key or x_api_key != API_SECRET:
        raise HTTPException(status_code=401,detail="Invalid or missing API key")