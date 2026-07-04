from pydantic import BaseModel

class DailyEntry(BaseModel):
    user_id: str
    mood_score: int
    sleep_hours: float
    exercise_minutes: int
    notes: str = ""