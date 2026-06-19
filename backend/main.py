import asyncio
from scrapers.serpapi_scraper import Scrape_from_SerpAPI
from scrapers.mlh_scraper import Scrape_from_MLH
from scrapers.devfolio_scraper import Scrape_from_Devfolio
from scrapers.luma_scraper import Scrape_from_Luma
from pipeline.filter import Filter_Events
from pipeline.formatter import Format_Digest
from notifier.telegram import Send_Message_To_Telegram
import json

async def run_pipeline():
    print("🔍 Starting Event Radar pipeline...\n")
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
    if not all_events:
        print("❌ No events found. Check your API keys and internet connection.")
        return
    print("\n🤖 Running Groq relevance filter...")
    filtered_events = await Filter_Events(all_events)
    print(f"  ✅ Relevant events after filtering: {len(filtered_events)}")
    if not filtered_events:
        print("❌ No relevant events after filtering.")
        return
    print("\n📝 Formatting digest...")
    digest = Format_Digest(filtered_events)
    print("\n📬 Sending to Telegram...")
    await Send_Message_To_Telegram(digest)
    print("  ✅ Digest sent successfully!")
    with open("last_run.json", "w") as f:
        json.dump(filtered_events, f, indent=2)
    print("\n💾 Saved results to last_run.json")
if __name__ == "__main__":
    asyncio.run(run_pipeline())