from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.partner_api_keys import PartnerApiKeyService
from services.partner_portal import PartnerPortalService


@dataclass(frozen=True)
class PartnerAuthContext:
    partner_org_id: int
    auth_mode: str  # session | api_key
    user_id: str | None
    api_scopes: frozenset[str]


async def get_partner_session_context(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> PartnerAuthContext:
    portal = PartnerPortalService(db)
    membership = await portal.get_active_membership(current_user.id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Partner portal access required")
    return PartnerAuthContext(
        partner_org_id=membership.partner_org_id,
        auth_mode="session",
        user_id=current_user.id,
        api_scopes=frozenset(),
    )


async def get_partner_api_context(
    db: AsyncSession = Depends(get_db),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
) -> PartnerAuthContext:
    raw_key = x_api_key
    if not raw_key and authorization and authorization.lower().startswith("bearer eam_pk_"):
        raw_key = authorization.split(" ", 1)[1].strip()
    if not raw_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API key required")

    key_service = PartnerApiKeyService(db)
    cred = await key_service.authenticate(raw_key)
    if cred is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    scopes = frozenset(str(s) for s in (cred.scopes or []))
    return PartnerAuthContext(
        partner_org_id=cred.partner_org_id,
        auth_mode="api_key",
        user_id=None,
        api_scopes=scopes,
    )


def require_api_scope(scope: str):
    async def _dep(ctx: PartnerAuthContext = Depends(get_partner_api_context)) -> PartnerAuthContext:
        if scope not in ctx.api_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API scope required: {scope}",
            )
        return ctx

    return _dep
