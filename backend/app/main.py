from app.models import DailyEntry
from fastapi import FastAPI
from app.database import save_entry, get_entries
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Life Companion API", "version": "1.0", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/entries")
async def create_entry(entry: DailyEntry):
    entry_data = entry.dict()
    entry_id = await save_entry(entry_data)
    return {"message": "Entry created successfully!", "entry_id": entry_id}


@app.get("/api/entries/{user_id}")
async def get_user_entries(user_id: str):
    entries = await get_entries(user_id)
    # Convert ObjectId to string for JSON serialization
    for entry in entries:
        entry["_id"] = str(entry["_id"])
    return {"user_id": user_id, "entries": entries}