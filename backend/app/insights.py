"""Weekly insights from a user's check-ins.

Uses Claude when ANTHROPIC_API_KEY is set; otherwise falls back to a
built-in summary, so the feature always works.
"""
import json
import os
from statistics import mean

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-5-5")

SYSTEM_PROMPT = """You are the insight engine inside Life Companion, a personal wellbeing journal.
You receive a user's recent daily check-ins (mood 1-10, sleep hours, exercise minutes, notes).
Write a short, warm, specific reflection grounded ONLY in their data.

Rules:
- Point out real patterns (e.g. mood vs sleep, exercise streaks, trend direction). Use their numbers.
- Never diagnose or give medical advice. You are not a clinician.
- If mood has been consistently low (3 or below), gently suggest talking with someone they trust
  or a professional. Do not be alarmist.
- Keep it encouraging and practical.

Respond with JSON only, no markdown fences:
{"summary": "<2 sentences>", "highlights": ["<observation>", "<observation>", "<observation>"], "suggestion": "<one concrete thing to try this week>"}"""


def compute_stats(entries: list[dict]) -> dict:
    """Numbers shown on the dashboard and fed to both insight engines."""
    if not entries:
        return {"count": 0}
    moods = [e["mood_score"] for e in entries]
    sleep = [e["sleep_hours"] for e in entries]
    exercise = [e.get("exercise_minutes", 0) for e in entries]

    good_sleep = [e["mood_score"] for e in entries if e["sleep_hours"] >= 7]
    short_sleep = [e["mood_score"] for e in entries if e["sleep_hours"] < 7]
    active = [e["mood_score"] for e in entries if e.get("exercise_minutes", 0) >= 20]
    inactive = [e["mood_score"] for e in entries if e.get("exercise_minutes", 0) < 20]

    return {
        "count": len(entries),
        "avg_mood": round(mean(moods), 1),
        "avg_sleep": round(mean(sleep), 1),
        "total_exercise": sum(exercise),
        "mood_good_sleep": round(mean(good_sleep), 1) if good_sleep else None,
        "mood_short_sleep": round(mean(short_sleep), 1) if short_sleep else None,
        "mood_active": round(mean(active), 1) if active else None,
        "mood_inactive": round(mean(inactive), 1) if inactive else None,
    }


def builtin_insight(entries: list[dict]) -> dict:
    s = compute_stats(entries)
    if s["count"] == 0:
        return {
            "summary": "No check-ins yet. Log a few days and your patterns will start to show here.",
            "highlights": [],
            "suggestion": "Do your first check-in today. It takes under a minute.",
        }

    highlights = [
        f"Average mood {s['avg_mood']}/10 across {s['count']} check-in{'s' if s['count'] != 1 else ''}.",
        f"Average sleep {s['avg_sleep']} hours; {s['total_exercise']} minutes of exercise in total.",
    ]
    if s["mood_good_sleep"] is not None and s["mood_short_sleep"] is not None:
        diff = round(s["mood_good_sleep"] - s["mood_short_sleep"], 1)
        if diff > 0:
            highlights.append(f"On nights with 7+ hours of sleep, your mood was {diff} points higher.")
        elif diff < 0:
            highlights.append("Sleep length doesn't seem to be lifting your mood yet. Other factors may matter more.")
    if s["mood_active"] is not None and s["mood_inactive"] is not None:
        diff = round(s["mood_active"] - s["mood_inactive"], 1)
        if diff > 0:
            highlights.append(f"Days with 20+ minutes of exercise averaged {diff} points better mood.")

    if s["avg_mood"] <= 3:
        suggestion = ("Your mood has been low lately. Consider reaching out to someone you trust, "
                      "or a professional, to talk it through.")
    elif s["avg_sleep"] < 7:
        suggestion = "Aim for one extra 30 minutes of sleep on a few nights this week and see how mood responds."
    elif s["total_exercise"] < 60:
        suggestion = "Try a 20-minute walk on three days this week."
    else:
        suggestion = "You've got a good rhythm. Keep checking in daily so the trends stay accurate."

    return {
        "summary": f"Here's a snapshot of your last {s['count']} check-ins.",
        "highlights": highlights[:3],
        "suggestion": suggestion,
    }


async def claude_insight(entries: list[dict]) -> dict:
    from anthropic import AsyncAnthropic  # imported lazily so the app runs without it configured

    rows = [
        {k: e.get(k) for k in ("date", "mood_score", "sleep_hours", "exercise_minutes", "notes")}
        for e in sorted(entries, key=lambda e: e["date"])
    ]
    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": "My check-ins:\n" + json.dumps(rows, default=str)
                       + "\n\nPrecomputed stats:\n" + json.dumps(compute_stats(entries)),
        }],
    )
    text = "".join(block.text for block in response.content if block.type == "text").strip()
    text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(text)
    return {
        "summary": str(data.get("summary", "")),
        "highlights": [str(h) for h in data.get("highlights", [])][:4],
        "suggestion": str(data.get("suggestion", "")),
    }


async def generate_insight(entries: list[dict]) -> dict:
    if entries and ANTHROPIC_API_KEY:
        try:
            return {**await claude_insight(entries), "source": "claude"}
        except Exception as exc:  # network, quota, or malformed output: never break the dashboard
            print(f"Claude insight failed, using built-in summary: {exc!r}")
    return {**builtin_insight(entries), "source": "built-in"}
