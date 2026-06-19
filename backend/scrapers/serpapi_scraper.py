from serpapi import GoogleSearch
from config import SERPAPI_KEY, SEARCH_QUERIES
import time

def Scrape_from_SerpAPI() -> list[dict]:
    all_results = []
    viewed_links = set()
    for query in SEARCH_QUERIES:
        try:
            params = {
                "q": query,
                "api_key": SERPAPI_KEY,
                "num": 10,
                "hl": "en",
                "gl": "in",
            }
            search = GoogleSearch(params)
            results = search.get_dict()
            organic = results.get("organic_results", [])
            for result in organic:
                link = result.get("link", "")
                if link in viewed_links:
                    continue
                viewed_links.add(link)
                skip_domains = ["wikipedia.org", "youtube.com", "x.com", "linkedin.com", "instagram.com", "quora.com"]
                if any(domain in link for domain in skip_domains):
                    continue
                all_results.append({
                    "source": "serpapi",
                    "query_used": query,
                    "title": result.get("title", ""),
                    "link": link,
                    "snippet": result.get("snippet", ""),
                    "date": result.get("date", ""),
                })
            time.sleep(0.5)
        except Exception as e:
            print(f"  ⚠️  SerpAPI error for query '{query}': {e}")
            continue
    return all_results