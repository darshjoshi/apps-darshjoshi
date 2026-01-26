from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import example_app, ats_boss

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Apps Dashboard API",
        "docs": f"{settings.API_V1_STR}/docs",
        "environment": settings.ENVIRONMENT
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


# Include routers
app.include_router(example_app.router, prefix=settings.API_V1_STR)
app.include_router(ats_boss.router, prefix=settings.API_V1_STR)


# Startup event
@app.on_event("startup")
async def startup_event():
    print(f"Starting {settings.PROJECT_NAME}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug mode: {settings.DEBUG}")
    print(f"API Documentation: http://localhost:8000{settings.API_V1_STR}/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print(f"Shutting down {settings.PROJECT_NAME}")
