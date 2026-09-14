import hashlib
import logging
from datetime import datetime
from typing import Optional

from core.auth import AccessTokenError, decode_access_token
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from core.database import get_db
from schemas.auth import CommandCenterAccessInfo, UserResponse
from services.command_center_access import resolve_command_center_access, user_has_command_center_permission
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> str:
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    logger.debug("Authentication required for request %s %s", request.method, request.url.path)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def get_current_user(token: str = Depends(get_bearer_token)) -> UserResponse:
    """Dependency to get current authenticated user via JWT token."""
    try:
        payload = decode_access_token(token)
    except AccessTokenError as exc:
        # Log error type only, not the full exception which may contain sensitive token data
        logger.warning("Token validation failed: %s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=exc.message)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    last_login_raw = payload.get("last_login")
    last_login = None
    if isinstance(last_login_raw, str):
        try:
            last_login = datetime.fromisoformat(last_login_raw)
        except ValueError:
            # Log user hash instead of actual user ID to avoid exposing sensitive information
            user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8] if user_id else "unknown"
            logger.debug("Failed to parse last_login for user hash: %s", user_hash)

    return UserResponse(
        id=user_id,
        email=payload.get("email", ""),
        name=payload.get("name"),
        role=payload.get("role", "user"),
        last_login=last_login,
    )


async def get_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to ensure current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def get_owner_user(current_user: UserResponse = Depends(get_admin_user)) -> UserResponse:
    """V1 owner authority — maps platform admin to OWNER until dedicated owner role exists."""
    return current_user


async def get_command_center_access(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommandCenterAccessInfo:
    """Resolve command center access for owner or active delegate."""
    access = await resolve_command_center_access(db, current_user)
    if access is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Command center access required",
        )
    return access


async def get_command_center_user(
    current_user: UserResponse = Depends(get_current_user),
    access: CommandCenterAccessInfo = Depends(get_command_center_access),
) -> UserResponse:
    """Authenticated user with verified command center access."""
    current_user.command_center = access
    return current_user


async def get_command_center_owner(
    current_user: UserResponse = Depends(get_current_user),
    access: CommandCenterAccessInfo = Depends(get_command_center_access),
) -> UserResponse:
    """Owner-only operations such as delegation management."""
    if access.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner access required",
        )
    return current_user


def require_command_center_permission(permission: str):
    """Factory for endpoint-level delegate permission checks."""

    async def _dependency(
        access: CommandCenterAccessInfo = Depends(get_command_center_access),
    ) -> CommandCenterAccessInfo:
        if not user_has_command_center_permission(access, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Command center permission required: {permission}",
            )
        return access

    return _dependency
