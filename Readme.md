# WanderLust 🎯

A personal automation that scrapes tech events and hackathons across India every Saturday and sends a curated digest to Telegram — filtered by relevance using Groq AI (Llama 3.3).

## What it does

- Scrapes **SerpAPI** (Google Search), **MLH**, **Devfolio**, and **Luma**.
- Uses an efficient Python pre-filter to drop junk domains and slim down data payloads.
- Uses **Groq (Llama 3.3 70B)** to score relevance (1-10), deduplicate, and extract structured event data.
- Automatically adjusts search dates to target upcoming 1-2 month windows.
- Sends a clean weekly digest to **Telegram** every Saturday at 8 AM IST.
- Runs automatically via **GitHub Actions** — no server needed.

## Stack

- Python 3.11+
- Groq API (relevance filtering via Llama 3.3 70B)
- SerpAPI (Google Search queries)
- BeautifulSoup4 (HTML scraping)
- Telegram Bot API (notifications via requests)
- GitHub Actions (weekly cron)

## Setup

### 1. Clone and create venv
```bash
git clone https://github.com/yourusername/WanderLust.git
cd event-radar
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Get API keys
- **Groq**: [console.groq.com](https://console.groq.com) — generous free tier (14,400 requests/day).
- **SerpAPI**: [serpapi.com](https://serpapi.com) — free tier (100 searches/month).
- **Telegram Bot**: Message `@BotFather` on Telegram → `/newbot`
- **Telegram Chat ID**: Message `@userinfobot` on Telegram

### 3. Configure environment
Create a `.env` file in the root directory:
```
SERPAPI_KEY=your_serpapi_key
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 4. Run locally
```bash
python main.py
```

### 5. Deploy to GitHub Actions
1. Push the repo to GitHub.
2. Go to repository **Settings** → **Secrets and variables** → **Actions**.
3. Add all 4 repository secrets: `SERPAPI_KEY`, `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. GitHub Actions will run every Saturday at 8 AM IST automatically.
5. You can also trigger it manually from the Actions tab.

## Customization

Edit `config.py` to change:
- `SEARCH_QUERIES` — what topics to search for.
- `CITIES` — which cities to focus on.
- `USER_PROFILE` — your interests, level, and type (used by Groq for personalized relevance scoring).

## Project structure

```text
event-radar/
├── scrapers/
│   ├── serpapi_scraper.py   # Google Search via SerpAPI
│   ├── mlh_scraper.py       # MLH hackathon calendar
│   ├── devfolio_scraper.py  # Devfolio hackathons
│   └── luma_scraper.py      # Luma tech events
├── pipeline/
│   ├── filter.py            # Pre-filtering & Groq AI relevance scoring
│   └── formatter.py         # Telegram message formatter
├── notifier/
│   └── telegram.py          # Telegram delivery
├── main.py                  # Entry point
├── config.py                # Config, user profile, and dynamic queries
├── requirements.txt         # Dependencies
└── .github/workflows/
    └── weekly.yml           # GitHub Actions cron config
```