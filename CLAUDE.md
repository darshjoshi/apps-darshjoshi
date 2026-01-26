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

### Testing API Endpoints
**Without API Key (development with API_KEY unset):**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/app1/data
```

**With API Key (production or when API_KEY is set):**
```bash
# Public endpoints (no key needed)
curl https://apis.darshjoshi.com/health

# Protected endpoints (require X-API-Key header)
curl -H "X-API-Key: your-api-key-here" https://apis.darshjoshi.com/api/app1/data
curl -H "X-API-Key: your-api-key-here" https://apis.darshjoshi.com/api/app2/data

# POST request with API key
curl -X POST -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://apis.darshjoshi.com/api/app1/data
```

**Expected error without API key:**
```json
{
  "detail": "Invalid or missing API key"
}
```

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

### API Key Authentication
The platform uses API key authentication to protect all app endpoints.

**Implementation:**
- Authentication logic in `app/dependencies.py` - `verify_api_key` function
- Checks `X-API-Key` header against `settings.API_KEY`
- If `API_KEY` is empty/unset, authentication is **disabled** (development mode)
- If `API_KEY` is set, all protected routes require valid key

**Protected Routes:**
- All `/api/app{N}/*` endpoints require API key
- Root `/` and `/health` remain **public** (no key needed)

**Adding API Key to New Routes:**
```python
from fastapi import APIRouter, Depends
from app.dependencies import verify_api_key

router = APIRouter(
    prefix="/app{N}",
    tags=["app{N}"],
    dependencies=[Depends(verify_api_key)]  # This protects all routes
)
```

**Frontend API Key Usage:**
The axios client in `lib/api.ts` automatically adds `X-API-Key` header:
- Reads from `NEXT_PUBLIC_API_KEY` environment variable
- If empty, no header is added (works with disabled auth)
- All API calls include the key when configured

### Environment Variables
**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend endpoint
  - Dev: `http://localhost:8000/api` (from `.env.local`)
  - Prod: `https://apis.darshjoshi.com/api` (from `.env.production`)
- `NEXT_PUBLIC_API_KEY` - API key for authentication
  - Dev: Empty or unset (optional in development)
  - Prod: Set in Netlify dashboard with value from Render

**Backend:**
- Uses Pydantic Settings to load from `.env`
- All settings defined in `app/config.py`
- `API_KEY` - If empty, authentication disabled; if set, required for all app routes
- `BACKEND_CORS_ORIGINS` - Comma-separated list (parsed by model_validator)
- `SECRET_KEY` - Auto-generated in Render for production

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

**CORS Origins Parsing:**
The `BACKEND_CORS_ORIGINS` field uses a special pattern to handle environment variables:
```python
BACKEND_CORS_ORIGINS: Union[str, List[str]] = "..."

@model_validator(mode='before')
@classmethod
def parse_cors_origins(cls, values: Any) -> Any:
    # Converts comma-separated string to list
    if isinstance(values, dict):
        cors_origins = values.get('BACKEND_CORS_ORIGINS')
        if isinstance(cors_origins, str):
            values['BACKEND_CORS_ORIGINS'] = [
                origin.strip() for origin in cors_origins.split(",")
            ]
    return values
```

**Why this is needed:**
- Pydantic Settings v2 auto-parses `List[str]` as JSON from env vars
- Environment variables like `https://a.com,https://b.com` fail JSON parsing
- Using `Union[str, List[str]]` prevents automatic JSON parsing
- `model_validator(mode='before')` manually converts string → list
- Works with both comma-separated strings (env vars) and lists (defaults)

## Deployment Architecture

### Production URLs
- **Frontend**: https://apps.darshjoshi.com (Netlify)
- **Backend**: https://apis.darshjoshi.com (Render with custom domain)
- **API Docs**: https://apis.darshjoshi.com/api/docs

### Frontend (Netlify)
**Configuration:**
- Configured via `netlify.toml` (base: `frontend/`, publishes `.next/`)
- Custom domain: `apps.darshjoshi.com`
- Auto-deploys from `main` branch on GitHub

**Environment Variables (set in Netlify Dashboard):**
```
NEXT_PUBLIC_API_URL=https://apis.darshjoshi.com/api
NEXT_PUBLIC_API_KEY=<value-from-render>
```

**Deployment Steps:**
1. Connect GitHub repo to Netlify
2. Netlify auto-detects Next.js from `netlify.toml`
3. Set environment variables in Netlify dashboard
4. Configure custom domain: `apps.darshjoshi.com`
5. Update GoDaddy DNS: CNAME `apps` → Netlify site

### Backend (Render)
**Configuration:**
- Configured via `backend/render.yaml` (infrastructure as code)
- Plan: Starter Plus ($7/mo, always on, 512MB RAM)
- Region: Virginia (US East)
- Auto-detects Python, installs from `requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Environment Variables (in render.yaml):**
- `ENVIRONMENT=production`
- `DEBUG=false`
- `BACKEND_CORS_ORIGINS=https://apps.darshjoshi.com,http://localhost:3000`
- `SECRET_KEY` - Auto-generated by Render
- `API_KEY` - Auto-generated by Render (copy this for frontend)

**Custom Domain Setup (apis.darshjoshi.com):**
1. In Render Dashboard → Service → Settings → Custom Domain
2. Add domain: `apis.darshjoshi.com`
3. Render provides DNS records (usually CNAME)
4. In GoDaddy → DNS Management:
   - Add CNAME record: `apis` → Render's target
   - Or add A record if Render provides IP
5. Wait for DNS propagation (can take up to 48 hours, usually < 1 hour)
6. Render automatically provisions SSL certificate

**CORS Configuration:**
The backend CORS is configured to accept requests from:
- `https://apps.darshjoshi.com` (production frontend)
- `http://localhost:3000` (development frontend)

Update `backend/render.yaml` if you change frontend domain.

### Alternative: Railway
Backend includes `Procfile` for Railway/Heroku deployment if needed.

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
