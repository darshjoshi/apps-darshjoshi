from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.dependencies import verify_api_key

router = APIRouter(
    prefix="/app1",
    tags=["app1"],
    dependencies=[Depends(verify_api_key)]
)


@router.get("/data")
async def get_app1_data() -> Dict[str, Any]:
    """
    Get data for App 1
    """
    return {
        "message": "Hello from App 1 API",
        "data": {
            "id": 1,
            "name": "Sample Data",
            "status": "active"
        }
    }


@router.post("/data")
async def create_app1_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create data for App 1
    """
    return {
        "message": "Data created successfully",
        "data": data
    }


@router.get("/health")
async def app1_health() -> Dict[str, str]:
    """
    Health check for App 1
    """
    return {"status": "healthy", "app": "app1"}
