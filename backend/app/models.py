from pydantic import BaseModel
from pydantic import Field

class DailyEntry(BaseModel):
    user_id: str
    mood_score: int
    sleep_hours: float
    exercise_minutes: int
    notes: str = ""


class User(BaseModel):
    email: str
    password: str = Field(..., min_length=8, max_length=72)

class UserResponse(BaseModel):
    id: str
    email: str