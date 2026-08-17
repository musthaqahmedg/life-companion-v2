from app.models import DailyEntry
from fastapi import FastAPI
from app.database import save_entry, get_entries
from app.models import User, UserResponse
from app.auth import hash_password, create_access_token
from app.database import save_user, get_user_by_email
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


@app.post("/api/auth/signup")
async def signup(user: User):
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        return {"error": "Email already registered"}
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Save user to database
    user_data = {
        "email": user.email,
        "password": hashed_password
    }
    user_id = await save_user(user_data)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "message": "User created successfully",
        "user_id": user_id,
        "access_token": access_token,
        "token_type": "bearer"
    }