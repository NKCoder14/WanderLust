from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
DATABASE_URL = os.getenv("DATABASE_URL", "")
API_SECRET_KEY = os.getenv("API_SECRET_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
_now = datetime.now()
_this_month = _now.strftime("%B %Y")
_next_month = (_now + timedelta(days=30)).strftime("%B %Y")
_month_after = (_now + timedelta(days=60)).strftime("%B %Y")

DEFAULT_CITIES = ["Bengaluru", "Belagavi", "Pune", "Hyderabad", "Mumbai"]

DEFAULT_SEARCH_QUERIES = [
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
]

DEFAULT_USER_PROFILE = {
    "interests": ["web development", "cloud computing", "AI", "machine learning", "hackathons", "startups"],
    "cities": DEFAULT_CITIES,
    "type": "student",
    "level": "beginner to intermediate",
}

CITIES = DEFAULT_CITIES
SEARCH_QUERIES = DEFAULT_SEARCH_QUERIES
USER_PROFILE = DEFAULT_USER_PROFILE