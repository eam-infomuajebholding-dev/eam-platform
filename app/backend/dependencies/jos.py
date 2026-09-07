from typing import Optional

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials
from schemas.auth import UserResponse

from core.auth import AccessTokenError, decode_access_token
from dependencies.auth import bearer_scheme


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> UserResponse | None:
    if not credentials or credentials.scheme.lower() != "bearer":
        return None

    try:
        payload = decode_access_token(credentials.credentials)
    except AccessTokenError:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    return UserResponse(
        id=user_id,
        email=payload.get("email", ""),
        name=payload.get("name"),
        role=payload.get("role", "user"),
        last_login=None,
    )


def get_anonymous_session_id(
    x_anonymous_session_id: str | None = Header(default=None, alias="X-Anonymous-Session-Id"),
) -> str | None:
    return x_anonymous_session_id
