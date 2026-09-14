from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class CommandCenterDelegationCreate(BaseModel):
    delegate_email: EmailStr
    note: Optional[str] = Field(default=None, max_length=500)
    expires_at: Optional[datetime] = None


class CommandCenterDelegationResponse(BaseModel):
    id: int
    delegate_user_id: str
    delegate_email: str
    delegate_name: Optional[str] = None
    granted_by_user_id: str
    permissions: list[str]
    note: Optional[str] = None
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
