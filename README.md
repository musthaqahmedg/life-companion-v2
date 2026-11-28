# Life Companion

A personal life operating system: a FastAPI + MongoDB backend with JWT authentication, and a React (Vite) frontend.

## 🚀 Live App

- **Web app:** https://life-companion-web.vercel.app
- **API:** https://life-companion-api.vercel.app
- **API Docs:** https://life-companion-api.vercel.app/docs
- **Hosting:** Vercel (frontend and backend), MongoDB Atlas (database)

## What It Does

Captures daily life data and provides AI insights through REST API endpoints. Data is **permanently stored** in MongoDB Atlas cloud database.

## Features

✅ Daily check-in: mood (1–10), sleep, exercise and notes, one per day (editable)  
✅ Mood ribbon: the last four weeks at a glance, coloured from low to high mood  
✅ **AI reflection powered by Claude**, with a built-in fallback when no API key is set  
✅ Signup and login with JWT access and refresh tokens (auto-refresh in the browser)  
✅ Every entry is private to the logged-in user  
✅ Passwords hashed with bcrypt  
✅ Responsive React UI, keyboard accessible, no pop-ups  
✅ Backend test suite (pytest, in-memory MongoDB)

## Endpoints

All `/api/entries` and `/api/insights` routes need `Authorization: Bearer <access_token>`.

| Method | Path | What it does |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/auth/signup` | Create an account, returns access and refresh tokens |
| POST | `/api/auth/login` | Log in, returns access and refresh tokens |
| POST | `/api/auth/refresh` | Swap a refresh token for a new access token |
| GET | `/api/me` | The logged-in user's email |
| GET | `/api/entries` | Your check-ins (newest first) plus summary stats |
| POST | `/api/entries` | Save a check-in; the same date again updates it |
| DELETE | `/api/entries/{date}` | Delete the check-in for a date (`YYYY-MM-DD`) |
| POST | `/api/insights` | AI reflection on your last 14 check-ins |

Example check-in:
```json
{ "date": "2026-11-28", "mood_score": 7, "sleep_hours": 7.5, "exercise_minutes": 25, "notes": "Walk by the canal" }
```

Full interactive docs: https://life-companion-api.vercel.app/docs

## Running the tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q
```

The tests use an in-memory MongoDB, so they need no database or API key.

## Tech Stack

**Frontend:** React 19, Vite, plain CSS (Bricolage Grotesque + Atkinson Hyperlegible)

**Backend:** FastAPI, Pydantic v2, Uvicorn, Motor (async MongoDB driver)

**AI:** Anthropic Claude API (`claude-haiku-5-5` by default) for weekly reflections

**Auth:** PyJWT (access + refresh tokens), bcrypt

**Database:** MongoDB Atlas

**Hosting:** Vercel (frontend and backend as separate projects)

**Testing:** pytest, mongomock-motor

## Architecture

```
React (Vercel) ──HTTPS + Bearer token──▶ FastAPI (Vercel Functions)
                                            ├── MongoDB Atlas (users, entries)
                                            └── Claude API (reflections, optional)
```

## Phase Progress

**Phase 1: FastAPI Setup** ✅
- Created FastAPI app
- Added Pydantic models
- Built basic endpoints
- Deployed to Codespaces

**Phase 2: MongoDB Integration** ✅
- Set up MongoDB Atlas
- Connected with Motor
- Implemented save endpoint
- Implemented retrieve endpoint
- Data persistence working!

**Phase 3: JWT Auth + React Frontend** ✅
- Signup and login endpoints with JWT access and refresh tokens ✅
- Passwords hashed with bcrypt ✅
- CORS enabled so the browser can call the API ✅
- React (Vite) frontend with Login and Signup pages ✅
- Signup and login tested end to end ✅
- Token saved in the browser after login ✅
- Frontend and backend deployed on Vercel ✅

**Phase 4: Dashboard + AI** ✅
- Daily check-in form, mood ribbon, stats and history
- Entries secured per user with JWT
- Claude-powered reflections with a built-in fallback
- Backend test suite

**Phase 5: N8N Automation** (Coming)
- Workflow automation
- Scheduled tasks
- Data enrichment

**Phase 6: Agentic AI** (Coming)
- AI agents
- Intelligent insights
- MCP tool integration

**Phase 7: More testing** (Coming)
- Unit tests with Pytest
- Integration tests
- API testing

**Phase 8: Production hardening** (Coming)
- Docker containerization
- Cloud deployment (GCP/Azure)
- Production setup

## Getting Started (Local Development)

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
cd backend
uvicorn app.main:app --reload

# Server runs at http://127.0.0.1:8000
# Docs at http://127.0.0.1:8000/docs
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the backend address from `VITE_API_URL`. For local development, create `frontend/.env` with `VITE_API_URL=http://localhost:8000` (this is also the default).

## Environment Variables

Backend (`backend/.env` locally, or Vercel project settings):

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
SECRET_KEY=a-long-random-string-for-signing-jwts
ANTHROPIC_API_KEY=sk-ant-...        # optional: enables Claude reflections
CLAUDE_MODEL=claude-haiku-5-5        # optional
```

Frontend (`frontend/.env` locally, or Vercel project settings):

```
VITE_API_URL=http://localhost:8000
```

## File Structure

```
backend/
├── app/
│   ├── main.py       (routes)
│   ├── auth.py       (passwords, JWT, current_user dependency)
│   ├── database.py   (MongoDB queries, scoped per user)
│   ├── insights.py   (Claude reflections + built-in fallback)
│   └── models.py     (request validation)
└── tests/test_api.py
frontend/src/
├── api.js            (fetch wrapper, token refresh)
├── mood.js           (mood colours and date helpers)
├── App.jsx
└── components/       (AuthScreen, Dashboard, CheckInForm, MoodRibbon, InsightPanel, History)
```

## Author

Musthaq Ahmed Gaffoor

- GitHub: github.com/musthaqahmedg/life-companion-v2
- LinkedIn: linkedin.com/in/musthaq-ahmed-gaffoor-a24929236
- Twitter: @musthaqahmed20

## License

MIT

---

**Building in public. Phase 4 (dashboard + AI reflections) is live!**

