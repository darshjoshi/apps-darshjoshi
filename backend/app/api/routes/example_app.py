from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.dependencies import verify_api_key

router = APIRouter(
    prefix="/example-app",
    tags=["example-app"]
)


@router.get("/data")
async def get_example_app_data() -> Dict[str, Any]:
    """
    Get data for Example App
    """
    return {
        "message": "Hello from Example App API",
        "data": {
            "id": 1,
            "name": "Sample Data",
            "status": "active"
        }
    }


@router.post("/data")
async def create_example_app_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create data for Example App
    """
    return {
        "message": "Data created successfully",
        "data": data
    }


@router.get("/health")
async def example_app_health() -> Dict[str, str]:
    """
    Health check for Example App
    """
    return {"status": "healthy", "app": "example-app"}
