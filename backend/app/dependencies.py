from fastapi import Header, HTTPException, status
from app.config import settings


async def verify_api_key(x_api_key: str = Header(..., description="API Key for authentication")) -> str:
    """
    Verify the API key from the X-API-Key header.

    Args:
        x_api_key: API key from request header

    Returns:
        The API key if valid

    Raises:
        HTTPException: If API key is missing or invalid
    """
    if not settings.API_KEY:
        # If no API key is configured, allow all requests (development mode)
        return x_api_key

    if x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    return x_api_key
