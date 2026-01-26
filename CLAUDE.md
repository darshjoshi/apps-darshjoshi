# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **multi-app platform** built with a split frontend/backend architecture. The key design pattern is that each independent application lives in its own route namespace on both the frontend and backend, while sharing common infrastructure.

### Monorepo Structure
- **frontend/** - Next.js 14+ with App Router (TypeScript + Tailwind CSS)
- **backend/** - FastAPI Python API (Python 3.11+)
- Both services run independently and communicate via HTTP

### Multi-App Pattern
Each app is isolated in its own namespace:
- Frontend: `app/app{N}/page.tsx` - Individual Next.js routes
- Backend: `app/api/routes/app{N}.py` - FastAPI routers with `/app{N}` prefix
- API Client: `lib/api.ts` exports `app{N}API` objects with typed methods

This allows multiple independent applications to coexist under a single dashboard while maintaining separation of concerns.

## Development Commands

### Running the Full Stack
Development requires **two terminal sessions** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on `localhost:3000`, backend on `localhost:8000`.

### Frontend Commands
```bash
npm run dev     # Start dev server with hot reload
npm run build   # Production build (creates .next/ directory)
npm run start   # Serve production build
npm run lint    # Run ESLint
```

### Backend Commands
```bash
# First time setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Development
uvicorn main:app --reload              # Start with hot reload
uvicorn main:app --reload --port 8000  # Specify port explicitly

# Production
uvicorn main:app --host 0.0.0.0 --port $PORT  # Used by Render/Railway
```

### API Documentation
When backend is running, auto-generated docs are available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Adding a New App

Follow this pattern to add a new app to the platform:

### 1. Backend Route (FastAPI)
Create `backend/app/api/routes/app{N}.py`:
```python
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/app{N}", tags=["app{N}"])

@router.get("/data")
async def get_data() -> Dict[str, Any]:
    return {"message": "Hello from App {N}"}
```

Register in `backend/main.py`:
```python
from app.api.routes import app1, app2, app{N}
# ...
app.include_router(app{N}.router, prefix=settings.API_V1_STR)
```

### 2. Frontend Route (Next.js)
Create `frontend/app/app{N}/page.tsx` following the existing pattern in app1/app2.

### 3. API Client
Add to `frontend/lib/api.ts`:
```typescript
export const app{N}API = {
  getData: () => api.get('/api/app{N}/data'),
  postData: (data: any) => api.post('/api/app{N}/data', data),
};
```

### 4. Homepage Card
Add app card to `frontend/app/page.tsx` in the `apps` array.

## Key Architecture Patterns

### Environment Variables
- **Frontend**: Uses `NEXT_PUBLIC_API_URL` to determine backend endpoint
  - Dev: `http://localhost:8000/api` (from `.env.local`)
  - Prod: Set in Netlify dashboard (from `.env.production`)
- **Backend**: Uses Pydantic Settings to load from `.env`
  - All settings defined in `app/config.py`
  - CORS origins configured here for both dev and prod

### API Client Pattern
The `lib/api.ts` file exports a configured axios instance that:
- Automatically prefixes all requests with the API base URL
- Includes request/response interceptors (ready for auth tokens)
- Handles errors globally with console logging
- Each app exports its own API object (e.g., `app1API`, `app2API`)

### FastAPI Router Registration
All API routes are prefixed with `/api` (defined in `settings.API_V1_STR`):
- Individual routers define their own prefix (e.g., `/app1`)
- Final URL structure: `/api/app{N}/{endpoint}`
- Tags in routers organize endpoints in auto-generated docs

### Configuration Management
Backend uses `pydantic-settings` with `.env` file:
- Settings class in `app/config.py` defines all configuration
- Environment variables automatically override defaults
- CORS origins list supports both dev and prod URLs simultaneously

## Deployment Architecture

### Frontend (Netlify)
- Configured via `netlify.toml` (base: `frontend/`, publishes `.next/`)
- Custom domain: `apps.darshjoshi.com`
- Set `NEXT_PUBLIC_API_URL` to production backend URL in Netlify dashboard

### Backend (Render)
- Configured via `backend/render.yaml` (infrastructure as code)
- Auto-detects Python, installs from `requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root directory set to `backend/` in deployment config
- Environment variables defined in `render.yaml` (CORS, DEBUG, etc.)

### Alternative: Railway
Backend includes `Procfile` for Railway/Heroku deployment.

## Database Integration (Future)

Database drivers are commented out in `requirements.txt`:
- PostgreSQL: Uncomment `psycopg2-binary`
- MongoDB: Uncomment `pymongo`
- ORM: Uncomment `sqlalchemy`

When adding database:
1. Create `app/database.py` for connection logic
2. Define models in `app/models/`
3. Define Pydantic schemas in `app/schemas/`
4. Update `app/config.py` with database URL settings
5. Business logic goes in `app/services/`

## Git Configuration

Repository owner: Darsh Joshi (contact@darshjoshi.com)
- Frontend has `.gitignore` that excludes `.env*` except `.env.example`
- Backend has separate `.gitignore` for Python artifacts
- Root `.gitignore` for OS files
