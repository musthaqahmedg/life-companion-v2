# Life Companion API

A personal life operating system API built with FastAPI and Python.

## What It Does

Captures daily life data and provides AI insights through REST API endpoints.

## Features

- ✅ Health check endpoint
- ✅ Daily entry creation with validation
- ✅ Data validation using Pydantic
- ✅ Auto-documentation with Swagger UI
- ✅ Fast async API with FastAPI

## Endpoints

### 1. Health Check

GET /health

Returns: `{"status":"ok"}`

### 2. Create Daily Entry

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

## How to Test

1. Go to: `https://YOUR-CODESPACE-URL/docs`
2. Click "Try it out" on POST /api/entries
3. Enter data and click "Execute"

## Built With

- FastAPI (Python web framework)
- Pydantic (Data validation)
- Uvicorn (Server)
- GitHub Codespaces (Cloud IDE)

## Author

Musthaq Ahmed Gaffoor

## License

MIT
