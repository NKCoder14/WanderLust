from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
_now = datetime.now()
_this_month = _now.strftime("%B %Y")                             
_next_month = (_now + timedelta(days=30)).strftime("%B %Y")     
_month_after = (_now + timedelta(days=60)).strftime("%B %Y")

import json

# Try to load user overrides from settings.json
_settings_file = os.path.join(os.path.dirname(__file__), "settings.json")
_custom_settings = {}
if os.path.exists(_settings_file):
    try:
        with open(_settings_file, "r") as f:
            _custom_settings = json.load(f)
    except Exception:
        pass

CITIES = _custom_settings.get("CITIES", ["Bengaluru", "Belagavi", "Pune", "Hyderabad", "Mumbai"])

SEARCH_QUERIES = _custom_settings.get("SEARCH_QUERIES", [
    # Cloud platforms
    f"AWS summit India {_this_month}",
    f"Google Cloud Next India {_this_month}",
    f"Microsoft Build India {_next_month}",
    f"Azure developer event India {_month_after}",

    # Generic tech events
    f"tech conference Bengaluru {_this_month}",
    f"developer summit India {_next_month}",
    f"DevFest Bengaluru {_next_month}",

    # Hackathons
    f"hackathon Bengaluru {_this_month}",
    f"hackathon Bengaluru {_next_month}",
    f"hackathon Karnataka students {_next_month}",
    f"online hackathon India {_this_month}",
    f"online hackathon India {_month_after}",
    f"MLH hackathon India {_next_month}",

    # Broader upcoming catches
    f"tech event Bengaluru upcoming {_next_month}",
    f"student developer event India {_month_after}",
])

USER_PROFILE = _custom_settings.get("USER_PROFILE", {
    "interests": ["web development", "cloud computing", "AI", "machine learning", "hackathons", "startups"],
    "cities": CITIES,
    "type": "student",
    "level": "beginner to intermediate",
})