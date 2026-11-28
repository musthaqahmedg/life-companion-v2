"""MongoDB access. All entry queries are scoped to a single user."""
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import DESCENDING

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = "life_companion"

# Created lazily on first use, so importing the app never needs a database.
# Tests replace this with an in-memory client.
_client = None


def get_db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=8000)
    return _client[DB_NAME]


# ---------- users ----------

async def save_user(user_data: dict) -> str:
    result = await get_db().users.insert_one(user_data)
    return str(result.inserted_id)


async def get_user_by_email(email: str):
    return await get_db().users.find_one({"email": email})


# ---------- daily entries ----------

def _clean(entry: dict) -> dict:
    entry["_id"] = str(entry["_id"])
    return entry


async def upsert_entry(user_email: str, entry: dict) -> dict:
    """One check-in per user per day: logging the same date again updates it."""
    db = get_db()
    await db.entries.update_one(
        {"user_email": user_email, "date": entry["date"]},
        {"$set": {**entry, "user_email": user_email}},
        upsert=True,
    )
    saved = await db.entries.find_one({"user_email": user_email, "date": entry["date"]})
    return _clean(saved)


async def list_entries(user_email: str, limit: int = 60) -> list[dict]:
    cursor = (
        get_db().entries.find({"user_email": user_email})
        .sort("date", DESCENDING)
        .limit(limit)
    )
    return [_clean(e) for e in await cursor.to_list(length=limit)]


async def delete_entry(user_email: str, date: str) -> bool:
    result = await get_db().entries.delete_one({"user_email": user_email, "date": date})
    return result.deleted_count == 1
