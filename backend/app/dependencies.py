from fastapi import Header, HTTPException, status
from typing import Optional
from app.config import settings


async def verify_api_key(x_api_key: Optional[str] = Header(None, description="API Key for authentication")) -> Optional[str]:
    """
    Verify the API key from the X-API-Key header.

    If API_KEY is not configured in settings (empty/None), authentication is disabled
    and all requests are allowed (development mode).

    If API_KEY is configured, the X-API-Key header is required and must match.

    Args:
        x_api_key: API key from request header (optional)

    Returns:
        The API key if valid, or None if auth is disabled

    Raises:
        HTTPException: If API key is configured but missing or invalid
    """
    if not settings.API_KEY:
        # If no API key is configured, allow all requests (development mode)
        return None

    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    return x_api_key
