"""API tests. Run from backend/:  pip install -r requirements-dev.txt && pytest -q

Uses an in-memory MongoDB, so no real database or API key is needed.
"""
import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

import app.database as database
import app.insights as insights
from app.main import app


@pytest.fixture(autouse=True)
def fake_db(monkeypatch):
    monkeypatch.setattr(database, "_client", AsyncMongoMockClient())
    monkeypatch.setattr(insights, "ANTHROPIC_API_KEY", None)


@pytest.fixture
def client():
    return TestClient(app)


def signup(client, email="a@example.com", password="Password1"):
    r = client.post("/api/auth/signup", json={"email": email, "password": password})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}, r.json()


def test_signup_login_and_duplicate(client):
    signup(client)
    assert client.post("/api/auth/signup", json={"email": "A@example.com", "password": "Password1"}).status_code == 409
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrongpass1"}).status_code == 401
    r = client.post("/api/auth/login", json={"email": "a@example.com", "password": "Password1"})
    assert r.status_code == 200 and r.json()["access_token"]


def test_entries_require_login(client):
    assert client.get("/api/entries").status_code == 401
    assert client.post("/api/entries", json={"mood_score": 5, "sleep_hours": 7}).status_code == 401
    assert client.get("/api/entries", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_refresh_token_cannot_be_used_as_access_token(client):
    _, body = signup(client)
    bad = {"Authorization": f"Bearer {body['refresh_token']}"}
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/me", headers=bad).status_code == 401
    r = client.post("/api/auth/refresh", json={"refresh_token": body["refresh_token"]})
    assert r.status_code == 200
    assert client.get("/api/me", headers={"Authorization": f"Bearer {r.json()['access_token']}"}).json() == {"email": "a@example.com"}


def test_checkin_upsert_list_delete_and_isolation(client):
    alice, _ = signup(client, "alice@example.com")
    bob, _ = signup(client, "bob@example.com")

    client.post("/api/entries", headers=alice, json={"date": "2026-11-27", "mood_score": 6, "sleep_hours": 6.5, "exercise_minutes": 0})
    client.post("/api/entries", headers=alice, json={"date": "2026-11-28", "mood_score": 8, "sleep_hours": 8, "exercise_minutes": 30, "notes": "walk"})
    # same date again updates rather than duplicates
    client.post("/api/entries", headers=alice, json={"date": "2026-11-28", "mood_score": 9, "sleep_hours": 8, "exercise_minutes": 30})

    r = client.get("/api/entries", headers=alice).json()
    assert [e["date"] for e in r["entries"]] == ["2026-11-28", "2026-11-27"]
    assert r["entries"][0]["mood_score"] == 9
    assert r["stats"]["count"] == 2 and r["stats"]["avg_mood"] == 7.5

    # Bob can't see or delete Alice's data
    assert client.get("/api/entries", headers=bob).json()["entries"] == []
    assert client.delete("/api/entries/2026-11-28", headers=bob).status_code == 404

    assert client.delete("/api/entries/2026-11-28", headers=alice).status_code == 200
    assert len(client.get("/api/entries", headers=alice).json()["entries"]) == 1


def test_validation(client):
    h, _ = signup(client)
    assert client.post("/api/entries", headers=h, json={"mood_score": 11, "sleep_hours": 7}).status_code == 422
    assert client.post("/api/entries", headers=h, json={"mood_score": 5, "sleep_hours": 30}).status_code == 422


def test_builtin_insight(client):
    h, _ = signup(client)
    empty = client.post("/api/insights", headers=h).json()
    assert empty["source"] == "built-in" and "No check-ins yet" in empty["summary"]

    for day, mood, sleep, ex in [("2026-11-25", 4, 5.5, 0), ("2026-11-26", 8, 8, 30), ("2026-11-27", 7, 7.5, 25)]:
        client.post("/api/entries", headers=h, json={"date": day, "mood_score": mood, "sleep_hours": sleep, "exercise_minutes": ex})
    r = client.post("/api/insights", headers=h).json()
    assert r["source"] == "built-in"
    assert any("7+ hours" in x for x in r["highlights"])
    assert r["suggestion"]


def test_claude_insight_falls_back_on_failure(client, monkeypatch):
    h, _ = signup(client)
    client.post("/api/entries", headers=h, json={"mood_score": 6, "sleep_hours": 7})
    monkeypatch.setattr(insights, "ANTHROPIC_API_KEY", "sk-test")

    async def boom(entries):
        raise RuntimeError("network down")
    monkeypatch.setattr(insights, "claude_insight", boom)
    assert client.post("/api/insights", headers=h).json()["source"] == "built-in"

    async def ok(entries):
        return {"summary": "s", "highlights": ["h"], "suggestion": "t"}
    monkeypatch.setattr(insights, "claude_insight", ok)
    assert client.post("/api/insights", headers=h).json() == {"summary": "s", "highlights": ["h"], "suggestion": "t", "source": "claude"}
