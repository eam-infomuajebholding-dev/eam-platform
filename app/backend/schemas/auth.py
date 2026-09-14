from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class CommandCenterAccessInfo(BaseModel):
    role: Literal["owner", "delegate"]
    permissions: list[str] = Field(default_factory=list)
    delegation_id: Optional[int] = None
    expires_at: Optional[datetime] = None


class UserResponse(BaseModel):
    id: str  # Now a string UUID (platform sub)
    email: str
    name: Optional[str] = None
    role: str = "user"  # user/admin
    last_login: Optional[datetime] = None
    command_center: Optional[CommandCenterAccessInfo] = None

    class Config:
        from_attributes = True


class PlatformTokenExchangeRequest(BaseModel):
    """Request body for exchanging Platform token for app token."""

    platform_token: str


class TokenExchangeResponse(BaseModel):
    """Response body for issued application token."""

    token: str
