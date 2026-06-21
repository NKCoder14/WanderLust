from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from config import DEFAULT_USER_PROFILE, DEFAULT_CITIES, DEFAULT_SEARCH_QUERIES
from db import get_async_db
from models import Event, Run, Config
from auth import require_api_key
from main import run_pipeline

router = APIRouter()

RATE_LIMIT_HOURS = 6

class UserProfileModel(BaseModel):
    interests: List[str]
    cities: List[str]
    type: str
    level: str

class ConfigUpdate(BaseModel):
    USER_PROFILE: Optional[UserProfileModel] = None
    CITIES: Optional[List[str]] = None
    SEARCH_QUERIES: Optional[List[str]] = None

@router.get("/events")
async def Get_Events(db: AsyncSession = Depends(get_async_db)):
    latest_run = await db.execute(
        select(Run)
        .where(Run.status == "complete")
        .order_by(desc(Run.completed_at))
        .limit(1)
    )
    run = latest_run.scalar_one_or_none()
    if run is None:
        return {"events": []}
    result = await db.execute(
        select(Event)
        .where(Event.run_id == run.id)
        .order_by(desc(Event.relevance_score))
    )
    events = result.scalars().all()
    return {"events": [e.to_dict() for e in events]}

@router.post("/run", dependencies=[Depends(require_api_key)])
async def Trigger_Run(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_async_db)):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=RATE_LIMIT_HOURS)
    recent = await db.execute(
        select(Run)
        .where(Run.started_at > cutoff)
        .order_by(desc(Run.started_at))
        .limit(1)
    )
    recent_run = recent.scalar_one_or_none()
    if recent_run is not None:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limited. Last run started at {recent_run.started_at.isoformat()}. "
                   f"Try again after {RATE_LIMIT_HOURS} hours.")
    new_run = Run(status="pending", started_at=datetime.now(timezone.utc))
    db.add(new_run)
    await db.commit()
    await db.refresh(new_run)
    background_tasks.add_task(run_pipeline, new_run.id)
    return {"status": "started", "run_id": new_run.id}

@router.get("/run/status")
async def Get_Run_Status(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(
        select(Run).order_by(desc(Run.started_at)).limit(1)
    )
    run = result.scalar_one_or_none()
    if run is None:
        return {"status": "no_runs", "message": "No pipeline runs yet."}

    return {
        "status": run.status,
        "run_id": run.id,
        "event_count": run.event_count,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "error_message": run.error_message,
    }

@router.get("/config")
async def Get_Config(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Config).where(Config.id == 1))
    get_config = result.scalar_one_or_none()

    if get_config is None:
        return {
            "USER_PROFILE": DEFAULT_USER_PROFILE,
            "CITIES": DEFAULT_CITIES,
            "SEARCH_QUERIES": DEFAULT_SEARCH_QUERIES,
        }
    return {
        "USER_PROFILE": get_config.user_profile or DEFAULT_USER_PROFILE,
        "CITIES": get_config.cities or DEFAULT_CITIES,
        "SEARCH_QUERIES": get_config.search_queries or DEFAULT_SEARCH_QUERIES,
    }

@router.put("/config", dependencies=[Depends(require_api_key)])
async def Update_Config(config_update: ConfigUpdate, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Config).where(Config.id == 1))
    config = result.scalar_one_or_none()
    if config is None:
        config = Config(
            id=1,
            user_profile=DEFAULT_USER_PROFILE,
            cities=DEFAULT_CITIES,
            search_queries=DEFAULT_SEARCH_QUERIES,
        )
        db.add(config)
    if config_update.CITIES is not None:
        config.cities = config_update.CITIES
    if config_update.USER_PROFILE is not None:
        config.user_profile = config_update.USER_PROFILE.model_dump()
    if config_update.SEARCH_QUERIES is not None:
        config.search_queries = config_update.SEARCH_QUERIES
    config.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {
        "status": "success",
        "message": "Configuration updated successfully.",
    }

@router.get("/stats")
async def Get_Stats(db: AsyncSession = Depends(get_async_db)):
    latest_run_result = await db.execute(
        select(Run)
        .where(Run.status == "complete")
        .order_by(desc(Run.completed_at))
        .limit(1)
    )
    run = latest_run_result.scalar_one_or_none()
    if run is None:
        return {"total_events": 0, "by_source": {}, "by_city": {}, "avg_score": 0}
    events_result = await db.execute(
        select(Event).where(Event.run_id == run.id))
    events = events_result.scalars().all()
    if not events:
        return {"total_events": 0, "by_source": {}, "by_city": {}, "avg_score": 0}
    total_events = len(events)
    by_source = {}
    by_city = {}
    total_score = 0
    for event in events:
        source = event.source or "unknown"
        by_source[source] = by_source.get(source, 0) + 1
        location = event.location or "Online"
        by_city[location] = by_city.get(location, 0) + 1
        score = event.relevance_score or 0
        total_score += score
    avg_score = round(total_score / total_events, 2) if total_events > 0 else 0
    return {
        "total_events": total_events,
        "by_source": by_source,
        "by_city": by_city,
        "avg_score": avg_score,
    }