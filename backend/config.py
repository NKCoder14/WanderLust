from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
DATABASE_URL = os.getenv("DATABASE_URL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is missing. It is required for security.")
CRON_SECRET = os.getenv("CRON_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
now = datetime.now()
this_month = now.strftime("%B %Y")
next_month = (now + timedelta(days=30)).strftime("%B %Y")
month_after = (now + timedelta(days=60)).strftime("%B %Y")

DEFAULT_CITIES = ["Bengaluru", "Belagavi", "Pune", "Hyderabad", "Mumbai"]

DEFAULT_SEARCH_QUERIES = [
    # Cloud platforms
    f"AWS summit India {this_month}",
    f"Google Cloud Next India {this_month}",
    f"Microsoft Build India {next_month}",
    f"Azure developer event India {month_after}",

    # Generic tech events
    f"tech conference Bengaluru {this_month}",
    f"developer summit India {next_month}",
    f"DevFest Bengaluru {next_month}",

    # Hackathons
    f"hackathon Bengaluru {this_month}",
    f"hackathon Bengaluru {next_month}",
    f"hackathon Karnataka students {next_month}",
    f"online hackathon India {this_month}",
    f"online hackathon India {month_after}",
    f"MLH hackathon India {next_month}",

    # Broader upcoming catches
    f"tech event Bengaluru upcoming {next_month}",
    f"student developer event India {month_after}",
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