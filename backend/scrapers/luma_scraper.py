import requests
from config import CITIES

LUMA_DISCOVER_API = "https://api.lu.ma/public/v1/discover/events"
LUMA_CALENDAR_API = "https://api.lu.ma/public/v1/calendar/list-events"

def Scrape_from_Luma() -> list[dict]:
    events = []
    viewed_ids = set()
    keywords = ["tech", "developer", "cloud", "AI", "hackathon"]

    for city in CITIES:
        for keyword in keywords:
            result = Luma_Query(LUMA_DISCOVER_API, keyword, city, viewed_ids)
            if result is None:
                result = Luma_Query(LUMA_CALENDAR_API, keyword, city, viewed_ids)
            if result:
                events.extend(result)
    return events

def Luma_Query(api_url: str, keyword: str, city: str, viewed_ids: set) -> list[dict] | None:
    try:
        params = {
            "query": f"{keyword} {city}",
            "pagination_limit": 10,
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; EventRadar/1.0)",
            "Accept": "application/json",
        }
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        if response.status_code in (401, 403):
            return None
        if response.status_code != 200:
            return []
        data = response.json()
        entries = data.get("entries", data.get("events", []))
        results = []
        for entry in entries:
            event = entry.get("event", entry)
            event_id = event.get("api_id", event.get("id", ""))
            if not event_id or event_id in viewed_ids:
                continue
            viewed_ids.add(event_id)
            name = event.get("name", "")
            start_at = event.get("start_at", "")
            url = event.get("url", "")
            description = (event.get("description") or "")[:200]
            geo = event.get("geo_address_json") or {}
            location = geo.get("city", "Online") if geo else "Online"
            if name:
                full_url = url if url.startswith("http") else f"https://lu.ma/{url}"
                results.append({
                    "source": "luma",
                    "title": name,
                    "date": start_at,
                    "location": location,
                    "link": full_url,
                    "snippet": description,
                })
        return results
    except Exception as e:
        print(f"  ⚠️  Luma error ({api_url}) for {city}/{keyword}: {e}")
        return []