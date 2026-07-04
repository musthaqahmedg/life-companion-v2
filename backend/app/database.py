from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os

MONGO_URL = "mongodb+srv://musthaq_ahmed_gaffoor:RLlJ448PCvs1dNZ6@cluster0.jyog6xr.mongodb.net/?appName=Cluster0"

client = AsyncIOMotorClient(MONGO_URL)

database = client.life_companion
entries_collection = database.entries

async def save_entry(entry_data):
    result = await entries_collection.insert_one(entry_data)
    return str(result.inserted_id)


async def get_entries(user_id):
    entries = await entries_collection.find({"user_id": user_id}).to_list(None)
    return entries

    