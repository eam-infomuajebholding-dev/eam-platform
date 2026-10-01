"""Partner API key issuance and verification."""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.partner_platform import PartnerApiCredential

API_KEY_PREFIX = "eam_pk_live_"


def _hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def generate_api_key() -> tuple[str, str, str]:
    """Returns (full_key, key_prefix, key_hash)."""
    suffix = secrets.token_urlsafe(24)
    full = f"{API_KEY_PREFIX}{suffix}"
    prefix = full[:16]
    return full, prefix, _hash_key(full)


class PartnerApiKeyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_credential(
        self,
        *,
        partner_org_id: int,
        name: str,
        scopes: list[str],
        created_by_user_id: str | None,
    ) -> tuple[PartnerApiCredential, str]:
        full_key, prefix, key_hash = generate_api_key()
        cred = PartnerApiCredential(
            partner_org_id=partner_org_id,
            name=name.strip(),
            key_prefix=prefix,
            key_hash=key_hash,
            scopes=scopes,
            created_by_user_id=created_by_user_id,
        )
        self.db.add(cred)
        await self.db.flush()
        return cred, full_key

    async def revoke(self, credential_id: int, partner_org_id: int) -> None:
        result = await self.db.execute(
            select(PartnerApiCredential).where(
                PartnerApiCredential.id == credential_id,
                PartnerApiCredential.partner_org_id == partner_org_id,
            )
        )
        cred = result.scalar_one_or_none()
        if cred is None:
            raise ValueError("Credential not found")
        cred.is_active = False
        cred.revoked_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def authenticate(self, raw_key: str) -> PartnerApiCredential | None:
        if not raw_key.startswith(API_KEY_PREFIX):
            return None
        prefix = raw_key[:16]
        key_hash = _hash_key(raw_key)
        result = await self.db.execute(
            select(PartnerApiCredential).where(
                PartnerApiCredential.key_prefix == prefix,
                PartnerApiCredential.key_hash == key_hash,
                PartnerApiCredential.is_active.is_(True),
                PartnerApiCredential.revoked_at.is_(None),
            )
        )
        cred = result.scalar_one_or_none()
        if cred is None:
            return None
        cred.last_used_at = datetime.now(timezone.utc)
        await self.db.flush()
        return cred

    async def list_for_org(self, partner_org_id: int) -> list[PartnerApiCredential]:
        result = await self.db.execute(
            select(PartnerApiCredential)
            .where(PartnerApiCredential.partner_org_id == partner_org_id)
            .order_by(PartnerApiCredential.created_at.desc())
        )
        return list(result.scalars().all())
