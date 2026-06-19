from groq import Groq
import json
import os
import asyncio
import re
from datetime import datetime, timedelta
from config import USER_PROFILE

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MAX_RETRIES = 3
BATCH_DELAY = 2
_JUNK_DOMAINS = {"wikipedia.org", "youtube.com", "twitter.com", "x.com","instagram.com", "quora.com"}

def PreFilter_Events(raw_events: list[dict]) -> list[dict]:
    Viewed_Links = set()
    cleaned = []
    for event in raw_events:
        title = (event.get("title") or "").strip()
        link  = (event.get("link")  or "").strip()
        if not title:
            continue
        if link in Viewed_Links:
            continue
        if any(d in link for d in _JUNK_DOMAINS):
            continue
        Viewed_Links.add(link)
        cleaned.append({
            "t": title,
            "d": (event.get("date") or "")[:40],
            "l": (event.get("location") or "")[:40],
            "u": link,
            "s": (event.get("snippet") or "")[:120],
        })
    return cleaned

async def Filter_Events(raw_events: list[dict]) -> list[dict]:
    events = PreFilter_Events(raw_events)
    print(f" Pre-filter: {len(raw_events)} → {len(events)} events (removed duplicates/junk)")
    batch_size = 25
    filtered_events = []
    total_batches = (len(events) + batch_size - 1) // batch_size
    early_abortion = False
    for index, i in enumerate(range(0, len(events), batch_size)):
        if early_abortion:
            break
        batch = events[i:i + batch_size]
        print(f" Batch {index + 1}/{total_batches} ({len(batch)} events)...")
        filtered, early_abortion = await Process_Batch_with_Retry(batch)
        filtered_events.extend(filtered)
        if index < total_batches - 1 and not early_abortion:
            await asyncio.sleep(BATCH_DELAY)
    viewed_titles = set()
    deduped = []
    for event in filtered_events:
        key = event.get("title", "").lower()[:40]
        if key not in viewed_titles:
            viewed_titles.add(key)
            deduped.append(event)
    deduped.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    return deduped

async def Process_Batch_with_Retry(events: list[dict]) -> tuple[list[dict], bool]:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = await Process_Batches(events)
            return result, False
        except Exception as e:
            err_str = str(e)
            if any(code in err_str for code in ["401", "403", "invalid_api_key", "Authentication"]):
                print(f"  ❌ Fatal: invalid Groq API Key")
                return [], True
            elif "429" in err_str or "rate_limit" in err_str.lower():
                delay = Retry_Delay(err_str)
                if attempt < MAX_RETRIES:
                    print(f"  ⏳ Rate limited ({attempt}/{MAX_RETRIES}). Waiting {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    print(f"  ❌ Rate limit persists after {MAX_RETRIES} attempts.")
                    return [], False
            else:
                print(f"  ⚠️  Groq error: {e}")
                return [], False
    return [], False

async def Process_Batches(events: list[dict]) -> list[dict]:
    today     = datetime.now()
    cutoff    = today + timedelta(days=60)
    today_str = today.strftime("%d %b %Y")  
    cutoff_str= cutoff.strftime("%d %b %Y")  
    prompt = (
        f"Filter tech events for an Indian student (web dev, cloud, AI, hackathons). "
        f"TODAY={today_str}. WINDOW={today_str} to {cutoff_str}.\n"
        f"Cities: {', '.join(USER_PROFILE['cities'])}.\n\n"
        f"INPUT (fields: t=title, d=date, l=location, u=url, s=snippet):\n"
        f"{json.dumps(events, separators=(',', ':'))}\n\n"
        f"RULES:\n"
        f"1. Drop past events (before {today_str}) and events after {cutoff_str}.\n"
        f"2. Drop non-tech / enterprise-only events.\n"
        f"3. Score 1-10 relevance. Keep only score>=6.\n"
        f"4. Return ONLY a JSON array, no markdown. Each item:\n"
        f'{{"title":"","date":"","location":"","link":"","source":"serpapi/mlh/devfolio/luma",'
        f'"type":"hackathon/conference/meetup/workshop","relevance_score":0,'
        f'"why_relevant":"","is_free_or_student":true}}\n'
        f"Empty = []"
    )
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=3000,
        )
    )
    raw_text = response.choices[0].message.content.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    raw_text = raw_text.strip()
    try:
        filtered = json.loads(raw_text)
        return filtered if isinstance(filtered, list) else []
    except json.JSONDecodeError as e:
        print(f"  ⚠️  Invalid JSON from Groq: {e}")
        return []

def Retry_Delay(error_str: str) -> int:
    match = re.search(r"retry[^0-9]*(\d+)", error_str, re.IGNORECASE)
    return int(match.group(1)) + 5 if match else 30