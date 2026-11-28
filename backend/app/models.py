from datetime import date as Date

from pydantic import BaseModel, Field


class User(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=8, max_length=72)


class RefreshRequest(BaseModel):
    refresh_token: str


class EntryIn(BaseModel):
    """A daily check-in. The owner comes from the login token, never the request body."""
    date: Date = Field(default_factory=Date.today)
    mood_score: int = Field(..., ge=1, le=10)
    sleep_hours: float = Field(..., ge=0, le=24)
    exercise_minutes: int = Field(0, ge=0, le=1440)
    notes: str = Field("", max_length=1000)
