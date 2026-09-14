"""Owner-managed command center delegations."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from models.auth import User
from models.command_center_delegation import CommandCenterDelegation
from schemas.auth import UserResponse
from schemas.command_center_delegation import (
    CommandCenterDelegationCreate,
    CommandCenterDelegationResponse,
)
from services.command_center_access import DEFAULT_DELEGATE_PERMISSIONS, is_platform_owner
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def _to_response(row: CommandCenterDelegation, delegate: User) -> CommandCenterDelegationResponse:
    return CommandCenterDelegationResponse(
        id=row.id,
        delegate_user_id=row.delegate_user_id,
        delegate_email=delegate.email,
        delegate_name=delegate.name,
        granted_by_user_id=row.granted_by_user_id,
        permissions=[part.strip() for part in row.permissions.split(",") if part.strip()],
        note=row.note,
        expires_at=row.expires_at,
        revoked_at=row.revoked_at,
        created_at=row.created_at,
    )


async def list_delegations(db: AsyncSession) -> list[CommandCenterDelegationResponse]:
    result = await db.execute(
        select(CommandCenterDelegation, User)
        .join(User, User.id == CommandCenterDelegation.delegate_user_id)
        .where(CommandCenterDelegation.revoked_at.is_(None))
        .order_by(CommandCenterDelegation.created_at.desc())
    )
    return [_to_response(row, user) for row, user in result.all()]


async def grant_delegation(
    db: AsyncSession,
    owner: UserResponse,
    payload: CommandCenterDelegationCreate,
) -> CommandCenterDelegationResponse:
    if not is_platform_owner(owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")

    delegate_email = payload.delegate_email.strip().lower()
    result = await db.execute(select(User).where(User.email == delegate_email))
    delegate = result.scalar_one_or_none()
    if delegate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delegate user must sign in at least once before access can be granted",
        )

    if delegate.id == owner.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner cannot delegate to self")

    if is_platform_owner(
        UserResponse(id=delegate.id, email=delegate.email, name=delegate.name, role=delegate.role)
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner account already has full access")

    existing = await db.execute(
        select(CommandCenterDelegation).where(
            CommandCenterDelegation.delegate_user_id == delegate.id,
            CommandCenterDelegation.revoked_at.is_(None),
        )
    )
    active = existing.scalar_one_or_none()
    if active is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Active delegation already exists for user")

    row = CommandCenterDelegation(
        delegate_user_id=delegate.id,
        granted_by_user_id=owner.id,
        permissions=",".join(DEFAULT_DELEGATE_PERMISSIONS),
        note=payload.note,
        expires_at=payload.expires_at,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return _to_response(row, delegate)


async def revoke_delegation(db: AsyncSession, owner: UserResponse, delegation_id: int) -> None:
    if not is_platform_owner(owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")

    result = await db.execute(
        select(CommandCenterDelegation).where(
            CommandCenterDelegation.id == delegation_id,
            CommandCenterDelegation.revoked_at.is_(None),
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delegation not found")

    row.revoked_at = datetime.now(timezone.utc)
    await db.commit()
