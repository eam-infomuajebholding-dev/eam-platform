"""Partner registry for company / outlet onboarding."""

from __future__ import annotations

import re
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.partners import (
    PARTNER_STATUSES,
    PARTNER_STATUS_PROSPECT,
    PartnerOrganization,
    PartnerOutlet,
)

SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$")


class PartnerValidationError(ValueError):
    pass


def _normalize_slug(value: str) -> str:
    slug = value.strip().lower()
    if not SLUG_RE.match(slug):
        raise PartnerValidationError("Invalid partner slug (use lowercase letters, numbers, hyphens)")
    return slug


class PartnerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_org_by_slug(self, slug: str) -> PartnerOrganization | None:
        normalized = slug.strip().lower()
        result = await self.db.execute(
            select(PartnerOrganization).where(PartnerOrganization.slug == normalized)
        )
        return result.scalar_one_or_none()

    async def get_org_by_id(self, org_id: int) -> PartnerOrganization | None:
        result = await self.db.execute(
            select(PartnerOrganization)
            .options(selectinload(PartnerOrganization.outlets))
            .where(PartnerOrganization.id == org_id)
        )
        return result.scalar_one_or_none()

    async def list_organizations(self) -> list[PartnerOrganization]:
        result = await self.db.execute(
            select(PartnerOrganization).order_by(PartnerOrganization.display_name_ar.asc())
        )
        return list(result.scalars().all())

    async def create_organization(self, payload: dict[str, Any]) -> PartnerOrganization:
        slug = _normalize_slug(payload["slug"])
        existing = await self.get_org_by_slug(slug)
        if existing:
            raise PartnerValidationError(f"Partner slug already exists: {slug}")

        status = payload.get("status") or PARTNER_STATUS_PROSPECT
        if status not in PARTNER_STATUSES:
            raise PartnerValidationError(f"Invalid partner status: {status}")

        org = PartnerOrganization(
            slug=slug,
            legal_name=payload["legal_name"].strip(),
            display_name_ar=payload["display_name_ar"].strip(),
            display_name_en=(payload.get("display_name_en") or "").strip() or None,
            status=status,
            journey_types=list(payload.get("journey_types") or []),
            sector_slugs=list(payload.get("sector_slugs") or []),
            contact_name=(payload.get("contact_name") or "").strip() or None,
            contact_email=(payload.get("contact_email") or "").strip() or None,
            contact_phone=(payload.get("contact_phone") or "").strip() or None,
            internal_notes=(payload.get("internal_notes") or "").strip() or None,
        )
        self.db.add(org)
        await self.db.flush()
        return org

    async def update_organization(self, org_id: int, payload: dict[str, Any]) -> PartnerOrganization:
        org = await self.get_org_by_id(org_id)
        if org is None:
            raise PartnerValidationError("Partner not found")

        if "status" in payload:
            status = payload["status"]
            if status not in PARTNER_STATUSES:
                raise PartnerValidationError(f"Invalid partner status: {status}")
            org.status = status
        for field in (
            "legal_name",
            "display_name_ar",
            "display_name_en",
            "contact_name",
            "contact_email",
            "contact_phone",
            "internal_notes",
        ):
            if field in payload and payload[field] is not None:
                value = str(payload[field]).strip()
                setattr(org, field, value or None)
        if "journey_types" in payload:
            org.journey_types = list(payload["journey_types"] or [])
        if "sector_slugs" in payload:
            org.sector_slugs = list(payload["sector_slugs"] or [])

        await self.db.flush()
        return org

    async def get_outlet(self, org_id: int, outlet_code: str) -> PartnerOutlet | None:
        code = outlet_code.strip().lower()
        result = await self.db.execute(
            select(PartnerOutlet).where(
                PartnerOutlet.partner_org_id == org_id,
                PartnerOutlet.outlet_code == code,
            )
        )
        return result.scalar_one_or_none()

    async def list_outlets(self, org_id: int) -> list[PartnerOutlet]:
        result = await self.db.execute(
            select(PartnerOutlet)
            .where(PartnerOutlet.partner_org_id == org_id)
            .order_by(PartnerOutlet.name_ar.asc())
        )
        return list(result.scalars().all())

    async def create_outlet(self, org_id: int, payload: dict[str, Any]) -> PartnerOutlet:
        org = await self.get_org_by_id(org_id)
        if org is None:
            raise PartnerValidationError("Partner not found")

        code = payload["outlet_code"].strip().lower()
        if await self.get_outlet(org_id, code):
            raise PartnerValidationError(f"Outlet code already exists: {code}")

        outlet = PartnerOutlet(
            partner_org_id=org_id,
            outlet_code=code,
            name_ar=payload["name_ar"].strip(),
            name_en=(payload.get("name_en") or "").strip() or None,
            city=(payload.get("city") or "").strip() or None,
            is_active=bool(payload.get("is_active", True)),
        )
        self.db.add(outlet)
        await self.db.flush()
        return outlet

    def public_org_dict(self, org: PartnerOrganization) -> dict[str, Any]:
        return {
            "slug": org.slug,
            "display_name_ar": org.display_name_ar,
            "display_name_en": org.display_name_en,
            "sector_slugs": org.sector_slugs or [],
            "journey_types": org.journey_types or [],
            "status": org.status,
        }
