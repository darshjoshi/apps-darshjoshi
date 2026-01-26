from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter(prefix="/app2", tags=["app2"])


@router.get("/data")
async def get_app2_data() -> Dict[str, Any]:
    """
    Get data for App 2
    """
    return {
        "message": "Hello from App 2 API",
        "data": {
            "id": 2,
            "name": "Another Sample Data",
            "status": "active"
        }
    }


@router.post("/data")
async def create_app2_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create data for App 2
    """
    return {
        "message": "Data created successfully",
        "data": data
    }


@router.get("/health")
async def app2_health() -> Dict[str, str]:
    """
    Health check for App 2
    """
    return {"status": "healthy", "app": "app2"}
