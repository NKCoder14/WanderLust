import requests
from bs4 import BeautifulSoup

DEVFOLIO_URL = "https://devfolio.co/hackathons"

def Scrape_from_Devfolio() -> list[dict]:
    events = []
    try:
        api_url = "https://api.devfolio.co/api/hackathons"
        params = {
            "type": "open",
            "page": 1,
            "per_page": 20,
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; EventRadar/1.0)",
            "Accept": "application/json",
        }
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            hackathons = data.get("results", data.get("hackathons", []))
            for h in hackathons:
                name = h.get("name", "")
                slug = h.get("slug", "")
                starts_at = h.get("starts_at", "")
                ends_at = h.get("ends_at", "")
                prize = h.get("prize_pool", "")
                location = h.get("location", "Online")
                if name:
                    events.append({
                        "source": "devfolio",
                        "title": name,
                        "date": f"{starts_at} to {ends_at}",
                        "location": location if location else "Online",
                        "link": f"https://devfolio.co/hackathons/{slug}" if slug else DEVFOLIO_URL,
                        "snippet": f"Devfolio hackathon: {name} | Prize pool: {prize}",
                    })
        else:
            events = Scrape_from_Devfolio_HTML()
    except Exception as e:
        print(f"  ⚠️  Devfolio scraper error: {e}")
        events = Scrape_from_Devfolio_HTML()
    return events

def Scrape_from_Devfolio_HTML() -> list[dict]:
    events = []
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; EventRadar/1.0)"}
        response = requests.get(DEVFOLIO_URL, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.find_all("a", href=True)
        for card in cards:
            href = card.get("href", "")
            text = card.get_text(strip=True)
            if "/hackathons/" in href and text:
                events.append({
                    "source": "devfolio",
                    "title": text,
                    "date": "",
                    "location": "Online/India",
                    "link": f"https://devfolio.co{href}" if href.startswith("/") else href,
                    "snippet": f"Devfolio hackathon: {text}",
                })
    except Exception as e:
        print(f"  ⚠️  Devfolio HTML fallback error: {e}")
    return events