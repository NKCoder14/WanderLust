import asyncio
import requests
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

async def Send_Message_To_Telegram(text: str) -> bool:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("  ⚠️  Telegram credentials not fetched")
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    chunks = Split_Message(text, max_length=4000)
    for chunk in chunks:
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": chunk,
            "parse_mode": "HTML",
            "disable_web_page_preview": False,
        }
        try:
            response = requests.post(url, json=payload, timeout=10)
            data = response.json()
            if not data.get("ok"):
                print(f"  ⚠️  Telegram error: {data.get('description')} - retrying as plain text")
                plain_payload = {
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": Strip_HTML(chunk),
                }
                requests.post(url, json=plain_payload, timeout=10)
            await asyncio.sleep(0.5)
        except Exception as e:
            print("  ⚠️  Telegram send error (check logs)")
            return False
    return True

def Split_Message(text: str, max_length: int = 4000) -> list[str]:
    if len(text) <= max_length:
        return [text]
    chunks = []
    current = ""
    for line in text.split("\n"):
        if len(current) + len(line) + 1 > max_length:
            chunks.append(current)
            current = line
        else:
            current += "\n" + line if current else line
    if current:
        chunks.append(current)
    return chunks

def Strip_HTML(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", "", text)