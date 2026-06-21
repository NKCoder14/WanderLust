import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from models import Base

raw_url = os.getenv("DATABASE_URL", "")
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql://", 1)

def Make_async_URL(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url
    return url.replace("postgresql://", "postgresql+asyncpg://", 1)

def Make_sync_URL(url: str) -> str:
    if url.startswith("postgresql+psycopg2://"):
        return url
    base = url.split("://", 1)
    return f"postgresql+psycopg2://{base[1]}" if len(base) == 2 else url

async_url = Make_async_URL(raw_url) if raw_url else ""
async_engine = create_async_engine(async_url, echo=False) if async_url else None
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
) if async_engine else None

sync_url = Make_sync_URL(raw_url) if raw_url else ""
sync_engine = create_engine(sync_url, echo=False, pool_pre_ping=True) if sync_url else None
SyncSessionLocal = sessionmaker(bind=sync_engine) if sync_engine else None

async def Get_async_db():
    if AsyncSessionLocal is None:
        raise RuntimeError("DATABASE_URL not configured")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

@contextmanager
def Get_sync_session() -> Session:
    if SyncSessionLocal is None:
        raise RuntimeError("DATABASE_URL not configured")
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()

async def init_db():
    if async_engine is None:
        print("⚠️  DATABASE_URL not set — skipping DB init")
        return
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables initialized")