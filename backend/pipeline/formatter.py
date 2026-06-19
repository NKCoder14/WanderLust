from datetime import datetime

def Format_Digest(events: list[dict]) -> str:
    today = datetime.now().strftime("%d %B %Y")
    lines = []
    lines.append(f"🎯 <b>Event Radar — Weekly Digest</b>")
    lines.append(f"📅 {today}\n")
    if not events:
        lines.append("No relevant events found this week. Check back next Saturday!")
        return "\n".join(lines)
    hackathons = [e for e in events if e.get("type") == "hackathon"]
    conferences = [e for e in events if e.get("type") in ("conference", "summit")]
    others = [e for e in events if e.get("type") not in ("hackathon", "conference", "summit")]

    def Section_Format(title: str, items: list[dict]) -> list[str]:
        if not items:
            return []
        section = [f"\n{title}"]
        for i, event in enumerate(items, 1):
            score = event.get("relevance_score", "?")
            is_free = " Free/Student" if event.get("is_free_or_student") else ""
            section.append(
                f"\n{i}. <b>{event.get('title', 'Untitled')}</b> {is_free}\n"
                f"   📍 {event.get('location', 'Unknown')}\n"
                f"   🗓 {event.get('date', 'Date TBD')}\n"
                f"   💡 {event.get('why_relevant', '')}\n"
                f"   🔗 <a href=\"{event.get('link', '#')}\">Register / Learn more</a>\n"
                f"   ⭐ Relevance: {score}/10 "
            )
        return section
    lines.extend(Section_Format("🏆 HACKATHONS", hackathons))
    lines.extend(Section_Format("🎤 CONFERENCES & SUMMITS", conferences))
    lines.extend(Section_Format("📌 OTHER EVENTS", others))
    lines.append(f"\n\n<i>Found {len(events)} events this week. See you next Saturday!</i>")
    return "\n".join(lines)