# Life Companion API

A personal life operating system API built with FastAPI, Python, and MongoDB.

## 🚀 LIVE API

**API is now deployed and live!**

- **Live URL:** https://web-production-411ab.up.railway.app/
- **API Docs:** https://web-production-411ab.up.railway.app/docs
- **Status:** Active ✅

## What It Does

Captures daily life data and provides AI insights through REST API endpoints. Data is **permanently stored** in MongoDB Atlas cloud database.

## Features

✅ Health check endpoint  
✅ Daily entry creation with validation  
✅ **Data persistence with MongoDB**  
✅ **Retrieve entries by user**  
✅ Data validation using Pydantic  
✅ Auto-documentation with Swagger UI  
✅ Fast async API with FastAPI  
✅ Async database driver (Motor)  

## Endpoints

### 1. Root Endpoint

GET /

Returns API info and docs link

### 2. Health Check

GET /health

Returns: `{"status":"ok"}`

### 3. Create Daily Entry (Save to MongoDB)

POST /api/entries

Request body:
```json
{
  "user_id": "user123",
  "mood_score": 7,
  "sleep_hours": 7.5,
  "exercise_minutes": 30,
  "notes": "Great day!"
}
```

Response:
```json
{
  "message": "Entry created successfully!",
  "entry_id": "6a480696db1de8ed86675774"
}
```

### 4. Retrieve Entries by User (Get from MongoDB)

GET /api/entries/{user_id}

Example: `GET /api/entries/user123`

Response:
```json
{
  "user_id": "user123",
  "entries": [
    {
      "_id": "6a480696db1de8ed86675774",
      "user_id": "user123",
      "mood_score": 7,
      "sleep_hours": 7.5,
      "exercise_minutes": 30,
      "notes": "Great day!"
    }
  ]
}
```

## How to Test

1. Go to: `https://web-production-411ab.up.railway.app/docs`
2. Try the endpoints:
   - **GET /health** - Test if API is alive
   - **POST /api/entries** - Save a daily entry to MongoDB
   - **GET /api/entries/{user_id}** - Retrieve entries for a user

## Tech Stack

**Backend Framework**
- FastAPI (Python web framework)
- Uvicorn (ASGI server)

**Data & Validation**
- Pydantic (Type validation)
- Motor (Async MongoDB driver)

**Database**
- MongoDB Atlas (Cloud database)
- Pymongo (MongoDB Python driver)

**Infrastructure**
- GitHub Codespaces (Cloud IDE)
- GitHub (Version control)

## Architecture

FastAPI App
↓
Pydantic Models (Validation)
↓
Motor AsyncClient
↓
MongoDB Atlas (Cloud)

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

**Phase 3: N8N Automation** (Coming)
- Workflow automation
- Scheduled tasks
- Data enrichment

**Phase 4: Agentic AI** (Coming)
- AI agents
- Intelligent insights
- MCP tool integration

**Phase 5: Testing** (Coming)
- Unit tests with Pytest
- Integration tests
- API testing

**Phase 6: Deployment** (Coming)
- Docker containerization
- Cloud deployment (GCP/Azure)
- Production setup

## Getting Started (Local Development)

```bash
# Install dependencies
pip install fastapi uvicorn motor pymongo pydantic

# Start server
cd backend
uvicorn app.main:app --reload

# Server runs at http://127.0.0.1:8000
# Docs at http://127.0.0.1:8000/docs
```

## Environment Variables

Create a `.env` file in `backend/` (not in version control):

MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

## File Structure

backend/
└── app/
├── main.py (FastAPI app + endpoints)
├── models.py (Pydantic data models)
└── database.py (MongoDB connection)

## Author

Musthaq Ahmed Gaffoor

- GitHub: github.com/musthaqahmedg/life-companion-v2
- LinkedIn: linkedin.com/in/musthaq-ahmed-gaffoor-a24929236
- Twitter: @musthaqahmed20

## License

MIT

---

**Building in public. Follow along for Phase 3!**

