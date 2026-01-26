# Apps Dashboard

A full-stack application dashboard built with Next.js 14+ and FastAPI, designed to host multiple independent applications under a unified platform.

## Project Structure

```
apps-darshjoshi/
├── frontend/              # Next.js 14+ frontend
│   ├── app/              # Next.js App Router
│   │   ├── example-app/ # Example application
│   │   ├── page.tsx     # Homepage with app cards
│   │   └── layout.tsx   # Root layout
│   ├── components/       # Shared React components
│   ├── lib/             # Utility functions
│   │   └── api.ts       # API client with axios
│   └── public/          # Static assets
├── backend/             # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/  # API route handlers
│   │   │       └── example_app.py
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── config.py    # Configuration management
│   ├── main.py          # FastAPI entry point
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
└── netlify.toml        # Netlify deployment config
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Deployment**: Netlify

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Server**: Uvicorn
- **Configuration**: Pydantic Settings
- **Deployment**: Render / Railway

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development server:
```bash
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000
API documentation: http://localhost:8000/api/docs

## Development Workflow

### Running Both Servers

In development, you'll need to run both the frontend and backend servers:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will make API calls to `http://localhost:8000/api` as configured in `.env.local`.

### Testing Endpoints

**Without API Key (development or when API_KEY is unset):**
```bash
# Public endpoints
curl http://localhost:8000/health

# Protected endpoints (no key needed in dev)
curl http://localhost:8000/api/example-app/data
```

**With API Key (production or when API_KEY is set):**
```bash
# Public endpoints (no key needed)
curl https://apis.darshjoshi.com/health

# Protected endpoints (require X-API-Key header)
curl -H "X-API-Key: your-api-key-here" https://apis.darshjoshi.com/api/example-app/data

# POST request with API key
curl -X POST -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://apis.darshjoshi.com/api/example-app/data
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
from app.api.routes import example_app, app{N}
# ...
app.include_router(app{N}.router, prefix=settings.API_V1_STR)
```

### 2. Frontend Route (Next.js)
Create `frontend/app/app{N}/page.tsx` following the existing pattern in example-app.

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
- Each app exports its own API object (e.g., `exampleAppAPI`, `app2API`)

### FastAPI Router Registration
All API routes are prefixed with `/api` (defined in `settings.API_V1_STR`):
- Individual routers define their own prefix (e.g., `/example-app`)
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

## Deployment

### Frontend Deployment (Netlify)

1. Push your code to GitHub

2. Connect your repository to Netlify

3. Netlify will automatically detect the configuration from `netlify.toml`

4. Set environment variables in Netlify:
   - `NEXT_PUBLIC_API_URL`: Your production backend URL
   - `NEXT_PUBLIC_API_KEY`: Your API key from the backend

5. Configure custom domain in Netlify:
   - Add `apps.darshjoshi.com` as a custom domain

6. Update GoDaddy DNS:
   - Add CNAME record: `apps` → `your-netlify-site.netlify.app`

### Backend Deployment (Render)

1. Push your code to GitHub

2. Create a new Web Service on Render

3. Connect your repository and select the `backend` directory

4. Render will detect `render.yaml` or use these settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Set environment variables:
   - `ENVIRONMENT`: production
   - `DEBUG`: false
   - `SECRET_KEY`: Generate a secure key
   - `API_KEY`: Generate a secure API key (e.g., using `openssl rand -hex 32`)
   - `BACKEND_CORS_ORIGINS`: `https://apps.darshjoshi.com`

6. Deploy and note your backend URL

7. Update frontend's `.env.production` with your backend URL

### Alternative Backend Deployment (Railway)

1. Install Railway CLI or use the web interface

2. Initialize Railway:
```bash
cd backend
railway init
```

3. Deploy:
```bash
railway up
```

4. Set environment variables in Railway dashboard (similar to Render)

5. Railway will automatically detect the `Procfile`

## Contributing

1. Create a new branch for your app
2. Develop and test locally
3. Submit a pull request

## License

MIT License
