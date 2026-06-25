import asyncio
from datetime import datetime, timezone
from scrapers.serpapi_scraper import Scrape_from_SerpAPI
from scrapers.mlh_scraper import Scrape_from_MLH
from scrapers.devfolio_scraper import Scrape_from_Devfolio
from scrapers.luma_scraper import Scrape_from_Luma
from pipeline.filter import Filter_Events
from pipeline.formatter import Format_Digest
from notifier.telegram import Send_Message_To_Telegram
from db import Get_sync_session
from models import Run, Event
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def Scrape_Sources() -> list[dict]:
    print("📡 Scraping sources...")
    serpapi_events = Scrape_from_SerpAPI()
    print(f"  ✅ SerpAPI: {len(serpapi_events)} raw results")
    mlh_events = Scrape_from_MLH()
    print(f"  ✅ MLH: {len(mlh_events)} events")
    devfolio_events = Scrape_from_Devfolio()
    print(f"  ✅ Devfolio: {len(devfolio_events)} events")
    luma_events = Scrape_from_Luma()
    print(f"  ✅ Luma: {len(luma_events)} events")
    all_events = serpapi_events + mlh_events + devfolio_events + luma_events
    print(f"\n📦 Total raw events collected: {len(all_events)}")
    return all_events

def Wrtie_Events_to_Database(session, run_id: int, filtered_events: list[dict]):
    for evt in filtered_events:
        link = evt.get("link", "")
        if link and not (link.startswith("http://") or link.startswith("https://")):
            link = ""  
        event_row = Event(
            title=evt.get("title", ""),
            date=evt.get("date", ""),
            location=evt.get("location", ""),
            link=link,
            source=evt.get("source", ""),
            type=evt.get("type", ""),
            relevance_score=evt.get("relevance_score", 0),
            why_relevant=evt.get("why_relevant", ""),
            is_free_or_student=evt.get("is_free_or_student", False),
            run_id=run_id)
        session.add(event_row)
    session.commit()

def Update_Run_Status(session, run_id: int, status: str,event_count: int = None, error_message: str = None):
    run = session.get(Run, run_id)
    if run is None:
        return
    run.status = status
    if event_count is not None:
        run.event_count = event_count
    if error_message is not None:
        run.error_message = error_message
    if status in ("complete", "failed"):
        run.completed_at = datetime.now(timezone.utc)
    session.commit()

def Run_Pipeline(run_id: int):
    print("🔍 Starting WanderLust pipeline...\n")
    with Get_sync_session() as session:
        try:
            Update_Run_Status(session, run_id, "running")
            all_events = Scrape_Sources()
            if not all_events:
                print("❌ No events found. Check your API keys and internet connection.")
                Update_Run_Status(session, run_id, "complete", event_count=0)
                return
            print("\n🤖 Running Groq relevance filter...")
            filtered_events = asyncio.run(Filter_Events(all_events))
            print(f"  ✅ Relevant events after filtering: {len(filtered_events)}")
            if not filtered_events:
                print("❌ No relevant events after filtering.")
                Update_Run_Status(session, run_id, "complete", event_count=0)
                return
            print("\n📝 Formatting digest...")
            digest = Format_Digest(filtered_events)
            print("\n📬 Sending to Telegram...")
            asyncio.run(Send_Message_To_Telegram(digest))
            print("  ✅ Digest sent successfully!")
            Wrtie_Events_to_Database(session, run_id, filtered_events)
            print(f"\n💾 Saved {len(filtered_events)} events to database")
            Update_Run_Status(session, run_id, "complete", event_count=len(filtered_events))
            print("✅ Pipeline completed successfully!")
        except Exception as e:
            logger.error(f"Pipeline failed: {e}", exc_info=True)
            print(f"❌ Pipeline failed. Check server logs.")
            try:
                Update_Run_Status(session, run_id, "failed", error_message="Pipeline failed due to internal error. Check server logs.")
            except Exception:
                pass
            raise

def Create_run_Row() -> int:
    with Get_sync_session() as session:
        run = Run(status="pending")
        session.add(run)
        session.commit()
        session.refresh(run)
        return run.id

if __name__ == "__main__":
    rid = Create_run_Row()
    print(f"Created run #{rid}")
    Run_Pipeline(rid)