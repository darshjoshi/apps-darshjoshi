# Apps Dashboard

A full-stack application dashboard built with Next.js 14+ and FastAPI, designed to host multiple independent applications under a unified platform.

## Project Structure

```
apps-darshjoshi/
├── frontend/              # Next.js 14+ frontend
│   ├── app/              # Next.js App Router
│   │   ├── app1/        # Individual app 1
│   │   ├── app2/        # Individual app 2
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
│   │   │       ├── app1.py
│   │   │       └── app2.py
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

### Adding a New App

1. **Frontend**: Create a new directory in `frontend/app/` (e.g., `app/app3/`)
   - Add a `page.tsx` file with your app component
   - Add the app to the homepage cards in `app/page.tsx`
   - Create API functions in `lib/api.ts`

2. **Backend**: Create a new router in `backend/app/api/routes/`
   - Create `app3.py` with your API endpoints
   - Register the router in `main.py`

Example router:
```python
# backend/app/api/routes/app3.py
from fastapi import APIRouter

router = APIRouter(prefix="/app3", tags=["app3"])

@router.get("/data")
async def get_data():
    return {"message": "Hello from App 3"}
```

Register in `main.py`:
```python
from app.api.routes import app1, app2, app3

app.include_router(app3.router, prefix=settings.API_V1_STR)
```

## Deployment

### Frontend Deployment (Netlify)

1. Push your code to GitHub

2. Connect your repository to Netlify

3. Netlify will automatically detect the configuration from `netlify.toml`

4. Set environment variables in Netlify:
   - `NEXT_PUBLIC_API_URL`: Your production backend URL

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
   - `BACKEND_CORS_ORIGINS`: https://apps.darshjoshi.com

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

4. Set environment variables in Railway dashboard

5. Railway will automatically detect the `Procfile`

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (.env)
```env
API_V1_STR=/api
PROJECT_NAME=Apps Dashboard API
ENVIRONMENT=development
DEBUG=True
BACKEND_CORS_ORIGINS=http://localhost:3000,https://apps.darshjoshi.com
SECRET_KEY=your-secret-key-here
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Project Features

- **Modular Architecture**: Each app is isolated in its own route and directory
- **Shared Components**: Common UI components and utilities
- **Type Safety**: Full TypeScript support in frontend
- **API Integration**: Axios-based API client with interceptors
- **CORS Configured**: Proper CORS setup for development and production
- **Environment-Based Config**: Different settings for dev and prod
- **Auto Documentation**: FastAPI generates interactive API docs
- **Hot Reload**: Both frontend and backend support hot reloading

## Database Integration (Optional)

To add database support:

1. Uncomment database dependencies in `requirements.txt`

2. Install the driver:
```bash
pip install psycopg2-binary  # For PostgreSQL
# or
pip install pymongo  # For MongoDB
```

3. Update `app/config.py` with database URL

4. Create models in `app/models/`

5. Create database connection logic in a new `app/database.py`

## Contributing

1. Create a new branch for your app
2. Develop and test locally
3. Submit a pull request

## License

MIT License
