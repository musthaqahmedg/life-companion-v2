from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import (
    create_access_token,
    create_refresh_token,
    current_user,
    decode_token,
    hash_password,
    verify_password,
)
from app.database import (
    delete_entry,
    get_user_by_email,
    list_entries,
    save_user,
    upsert_entry,
)
from app.insights import compute_stats, generate_insight
from app.models import EntryIn, RefreshRequest, User

app = FastAPI(title="Life Companion API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _tokens(email: str, user_id: str, message: str) -> dict:
    return {
        "message": message,
        "user_id": user_id,
        "email": email,
        "access_token": create_access_token(email),
        "refresh_token": create_refresh_token(email),
        "token_type": "bearer",
    }


@app.get("/")
async def root():
    return {"message": "Life Companion API", "version": "2.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------- auth ----------

@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: User):
    email = user.email.strip().lower()
    if await get_user_by_email(email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user_id = await save_user({"email": email, "password": hash_password(user.password)})
    return _tokens(email, user_id, "User created successfully")


@app.post("/api/auth/login")
async def login(user: User):
    email = user.email.strip().lower()
    existing = await get_user_by_email(email)
    if not existing or not verify_password(user.password, existing["password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return _tokens(email, str(existing["_id"]), "Login successful")


@app.post("/api/auth/refresh")
async def refresh(body: RefreshRequest):
    email = decode_token(body.refresh_token, "refresh")
    return {"access_token": create_access_token(email), "token_type": "bearer"}


@app.get("/api/me")
async def me(email: str = Depends(current_user)):
    return {"email": email}


# ---------- daily check-ins (always scoped to the logged-in user) ----------

@app.get("/api/entries")
async def get_my_entries(limit: int = 60, email: str = Depends(current_user)):
    entries = await list_entries(email, limit=max(1, min(limit, 365)))
    return {"entries": entries, "stats": compute_stats(entries)}


@app.post("/api/entries")
async def save_my_entry(entry: EntryIn, email: str = Depends(current_user)):
    data = entry.model_dump()
    data["date"] = entry.date.isoformat()
    saved = await upsert_entry(email, data)
    return {"message": "Check-in saved", "entry": saved}


@app.delete("/api/entries/{date}")
async def delete_my_entry(date: str, email: str = Depends(current_user)):
    if not await delete_entry(email, date):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No check-in for that date")
    return {"message": "Check-in deleted"}


# ---------- AI insights ----------

@app.post("/api/insights")
async def insights(email: str = Depends(current_user)):
    entries = await list_entries(email, limit=14)
    return await generate_insight(entries)
