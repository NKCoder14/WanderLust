<div align="center">
  <img src="frontend/public/favicon.png" alt="WanderLust Logo" width="120" />
  <h1>WanderLust - Event Explorer</h1>
  <p>A full-stack AI-powered automation that scrapes tech events and hackathons across India, filters them by relevance using Groq (Llama 3.3), and presents them in a beautiful React dashboard.</p>
</div>

## ✨ Features

- **Multi-Source Scraping**: Scrapes **SerpAPI** (Google Search), **MLH**, **Devfolio**, and **Luma**.
- **AI Relevance Filtering**: Uses **Groq (Llama 3.3 70B)** to score relevance (1-10), deduplicate, and extract structured event data tailored to your personal developer profile.
- **Modern Dashboard**: A sleek, responsive React (Vite) frontend with Tailwind CSS and a custom glassmorphism design system.
- **PostgreSQL Database**: Stores historical events, tracks pipeline run statistics, and manages your dynamic configuration.
- **Telegram Notifications**: Sends a curated weekly digest to Telegram.
- **Automated Cron**: Runs automatically every Saturday via GitHub Actions.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (Custom Clay/Glassmorphism UI)
- **React Router v6**
- **Lucide Icons**

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy & asyncpg** (PostgreSQL)
- **Groq API** (Llama 3.3 70B)
- **SerpAPI** & **BeautifulSoup4** (Scraping)

---

## 🚀 Setup & Local Development

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
SERPAPI_KEY=your_serpapi_key
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
DATABASE_URL=postgresql://user:password@localhost:5432/wanderlust
FRONTEND_URL=http://localhost:5173
ENV=development
```

Run the FastAPI server:
```bash
python api/main.py
```
*(The backend runs on port 8000. On the first run, the database tables will be automatically initialized).*

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the dashboard!

---

## ☁️ Deployment

### 1. Database (PostgreSQL)
Provision a Postgres database (e.g., Supabase, Neon, or Render). Add the connection string to `DATABASE_URL`.

### 2. Backend API
Deploy the `backend/` directory as a Web Service (e.g., on Render).
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**: Add all variables from your `.env` file.

### 3. Frontend Static Site
Deploy the `frontend/` directory (e.g., on Vercel, Netlify, or Render Static Site).
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: `VITE_API_BASE_URL=https://your-backend-url.com`

### 4. GitHub Actions (Automated Runs)
To keep the weekly automated scraping alive:
1. Add `API_URL` (your deployed backend URL) to your GitHub Repository Secrets.
2. The workflow (`.github/workflows/weekly.yml`) will automatically hit `POST /api/run` every Saturday.

---

## ⚙️ Configuration

You can dynamically update the scraper's focus directly from the **Configuration** tab in the web dashboard:
- **Search Queries**: Topics to search for.
- **Cities**: Locations to focus on.
- **User Profile**: Your interests and experience level (used by Groq AI to score event relevance).

---

## 📂 Project Structure

```text
event-radar/
├── backend/
│   ├── api/
│   │   ├── main.py              # FastAPI application entry
│   │   └── routes.py            # API Endpoints
│   ├── scrapers/                # Luma, Devfolio, MLH, SerpAPI scrapers
│   ├── pipeline/                # Groq AI filtering & pipeline logic
│   ├── notifier/                # Telegram integration
│   ├── models.py                # SQLAlchemy DB models
│   ├── config.py                # Initial Default Configurations
│   └── requirements.txt         
├── frontend/
│   ├── public/                  # Assets and Favicon
│   ├── src/
│   │   ├── components/          # Reusable UI components (Clay design)
│   │   ├── pages/               # Dashboard, Events, Stats, Config pages
│   │   ├── services/            # API client (api.js)
│   │   ├── App.jsx              # React Router
│   │   └── RunContext.jsx       # Global Pipeline State & Polling
│   ├── tailwind.config.js       # Custom Design System
│   └── package.json             
└── .github/workflows/
    └── weekly.yml               # Automated pipeline trigger
```