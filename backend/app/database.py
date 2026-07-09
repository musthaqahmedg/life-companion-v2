from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

# Lazy connection - don't connect until needed
client = None
database = None
entries_collection = None

async def get_connection():
    global client, database, entries_collection
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL)
        database = client.life_companion
        entries_collection = database.entries
    return database, entries_collection

async def save_entry(entry_data):
    db, collection = await get_connection()
    result = await collection.insert_one(entry_data)
    return str(result.inserted_id)

async def get_entries(user_id):
    db, collection = await get_connection()
    entries = await collection.find({"user_id": user_id}).to_list(None)
    return entries