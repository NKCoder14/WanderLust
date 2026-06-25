import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import FRONTEND_URL
from db import init_db
from api.routes import router

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="WanderLust API",
    description="API for WanderLust Scraper and Filter",
    version="2.0.0",
    lifespan=lifespan,
)
allowed_origins = [FRONTEND_URL]
if FRONTEND_URL != "http://localhost:5173": allowed_origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins= allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-API-Key"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    is_dev = os.getenv("ENV") == "development"
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=is_dev)