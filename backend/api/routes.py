import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from config import USER_PROFILE, CITIES, SEARCH_QUERIES
from main import run_pipeline

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
LAST_RUN_FILE = os.path.join(BASE_DIR, "last_run.json")
SETTINGS_FILE = os.path.join(BASE_DIR, "settings.json")

class UserProfile(BaseModel):
    interests: List[str]
    cities: List[str]
    type: str
    level: str

class ConfigUpdate(BaseModel):
    USER_PROFILE: Optional[UserProfile] = None
    CITIES: Optional[List[str]] = None
    SEARCH_QUERIES: Optional[List[str]] = None

@router.get("/events")
async def Get_Events():
    if not os.path.exists(LAST_RUN_FILE):
        return {"events": []}
    try:
        with open(LAST_RUN_FILE, "r") as f:
            events = json.load(f)
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read events: {str(e)}")

@router.post("/run")
async def Trigger_Run():
    try:
        await run_pipeline()
        return {"status": "success", "message": "Pipeline completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

@router.get("/config")
async def Get_Config():
    return {
        "USER_PROFILE": USER_PROFILE,
        "CITIES": CITIES,
        "SEARCH_QUERIES": SEARCH_QUERIES
    }

@router.put("/config")
async def Update_Config(config_update: ConfigUpdate):
    custom_settings = {}
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            custom_settings = json.load(f)
    if config_update.CITIES is not None:
        custom_settings["CITIES"] = config_update.CITIES
    if config_update.USER_PROFILE is not None:
        custom_settings["USER_PROFILE"] = config_update.USER_PROFILE.dict()
    if config_update.SEARCH_QUERIES is not None:
        custom_settings["SEARCH_QUERIES"] = config_update.SEARCH_QUERIES
    try:
        with open(SETTINGS_FILE, "w") as f:
            json.dump(custom_settings, f, indent=4)
        return {"status": "success", "message": "Configuration updated successfully. Note: Backend might need a restart to reflect changes in background tasks, though API will use new settings."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")

@router.get("/stats")
async def Get_Stats():
    if not os.path.exists(LAST_RUN_FILE):
        return {"total_events": 0, "by_source": {}, "by_city": {}, "avg_score": 0}
    try:
        with open(LAST_RUN_FILE, "r") as f:
            events = json.load(f)
        if not events:
            return {"total_events": 0, "by_source": {}, "by_city": {}, "avg_score": 0}
        total_events = len(events)
        by_source = {}
        by_city = {}
        total_score = 0
        for event in events:
            source = event.get("source", "unknown")
            by_source[source] = by_source.get(source, 0) + 1
            location = event.get("location", "Online")
            by_city[location] = by_city.get(location, 0) + 1
            score = event.get("relevance_score", 0)
            total_score += score
        avg_score = round(total_score / total_events, 2) if total_events > 0 else 0
        return {
            "total_events": total_events,
            "by_source": by_source,
            "by_city": by_city,
            "avg_score": avg_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate stats: {str(e)}")