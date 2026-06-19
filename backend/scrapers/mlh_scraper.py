import requests
from bs4 import BeautifulSoup

MLH_URL = "https://mlh.io/seasons/2026/events"

def Scrape_from_MLH() -> list[dict]:
    events = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        }
        response = requests.get(MLH_URL, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        event_cards = soup.find_all("a", class_="event")
        if not event_cards:
            event_cards = soup.find_all("div", class_="event")
        for card in event_cards:
            try:
                name_tag = (
                    card.find("h3", class_="event-name") or
                    card.find("h3") or
                    card.find("h2")
                )
                date_tag = (
                    card.find("p", class_="event-date") or
                    card.find("span", class_="event-date") or
                    card.find("p", class_="date")
                )
                location_tag = (
                    card.find("p", class_="event-location") or
                    card.find("span", class_="event-location") or
                    card.find("p", class_="location")
                )
                link = card.get("href", MLH_URL) if card.name == "a" else MLH_URL
                if not link.startswith("http"):
                    link = "https://mlh.io" + link
                name = name_tag.get_text(strip=True) if name_tag else ""
                date = date_tag.get_text(strip=True) if date_tag else ""
                location = location_tag.get_text(strip=True) if location_tag else ""
                if name:
                    events.append({
                        "source": "mlh",
                        "title": name,
                        "date": date,
                        "location": location or "Online/In-Person",
                        "link": link,
                        "snippet": f"MLH hackathon: {name} | {date} | {location}",
                    })
            except Exception:
                continue
        if not events:
            print("  ⚠️  MLH: 0 events parsed - HTML structure may have changed. Check selectors.")
    except Exception as e:
        print(f"  ⚠️  MLH scraper error: {e}")
    return events