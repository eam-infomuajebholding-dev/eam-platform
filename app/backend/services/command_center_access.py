"""Command Center access — platform owner and owner-granted delegates."""

from __future__ import annotations

from datetime import datetime, timezone

from core.config import settings
from models.command_center_delegation import CommandCenterDelegation
from schemas.auth import CommandCenterAccessInfo, UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

DEFAULT_DELEGATE_PERMISSIONS = ("read", "search", "executive_brief", "evidence")
OWNER_PERMISSIONS = (*DEFAULT_DELEGATE_PERMISSIONS, "delegations_manage")


def _parse_permissions(raw: str | None) -> tuple[str, ...]:
    if not raw:
        return DEFAULT_DELEGATE_PERMISSIONS
    parts = [part.strip() for part in raw.split(",") if part.strip()]
    return tuple(parts) or DEFAULT_DELEGATE_PERMISSIONS


def is_platform_owner(user: UserResponse) -> bool:
    """V1 owner authority — platform admin user."""
    admin_user_id = str(getattr(settings, "admin_user_id", "") or "")
    if admin_user_id and user.id == admin_user_id:
        return True
    return user.role == "admin"


async def resolve_command_center_access(
    db: AsyncSession,
    user: UserResponse,
) -> CommandCenterAccessInfo | None:
    if is_platform_owner(user):
        return CommandCenterAccessInfo(
            role="owner",
            permissions=list(OWNER_PERMISSIONS),
        )

    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(CommandCenterDelegation)
        .where(
            CommandCenterDelegation.delegate_user_id == user.id,
            CommandCenterDelegation.revoked_at.is_(None),
        )
        .order_by(CommandCenterDelegation.created_at.desc())
    )
    rows = result.scalars().all()
    for row in rows:
        if row.expires_at and row.expires_at <= now:
            continue
        return CommandCenterAccessInfo(
            role="delegate",
            permissions=list(_parse_permissions(row.permissions)),
            delegation_id=row.id,
            expires_at=row.expires_at,
        )

    return None


def user_has_command_center_permission(access: CommandCenterAccessInfo | None, permission: str) -> bool:
    return bool(access and permission in access.permissions)
