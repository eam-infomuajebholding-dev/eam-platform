"""Resolve and persist partner / outlet attribution on journeys and service requests."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from models.partners import PARTNER_STATUS_ACTIVE, PARTNER_STATUS_ONBOARDING, PartnerOrganization, PartnerOutlet
from services.jos_validators import JourneyValidationError
from services.partners import PartnerService

ATTRIBUTION_CONTEXT_KEYS = (
    "partner_org_id",
    "partner_outlet_id",
    "partner_slug",
    "partner_display_name",
    "partner_outlet_code",
    "partner_outlet_name",
    "partner_attribution_source",
)

LIVE_ATTRIBUTION_STATUSES = frozenset({PARTNER_STATUS_ACTIVE, PARTNER_STATUS_ONBOARDING})


def build_partner_attribution_snapshot(context: dict[str, Any]) -> dict[str, Any] | None:
    org_id = context.get("partner_org_id")
    if org_id is None:
        return None
    snapshot: dict[str, Any] = {
        "partner_org_id": org_id,
        "partner_slug": context.get("partner_slug"),
        "partner_display_name": context.get("partner_display_name"),
    }
    if context.get("partner_outlet_id") is not None:
        snapshot["partner_outlet_id"] = context.get("partner_outlet_id")
        snapshot["partner_outlet_code"] = context.get("partner_outlet_code")
        snapshot["partner_outlet_name"] = context.get("partner_outlet_name")
    if context.get("partner_attribution_source"):
        snapshot["source"] = context.get("partner_attribution_source")
    return snapshot


async def enrich_journey_initial_context(
    db: AsyncSession,
    *,
    journey_type: str,
    initial_context: dict[str, Any] | None,
) -> dict[str, Any]:
    """Validate partner slug/outlet from deep links and merge attribution into journey context."""
    context = dict(initial_context or {})
    partner_slug = (context.pop("partner_slug", None) or context.pop("partner", None) or "").strip()
    outlet_code = (context.pop("partner_outlet_code", None) or context.pop("outlet", None) or "").strip()

    if not partner_slug:
        return context

    service = PartnerService(db)
    org = await service.get_org_by_slug(partner_slug)
    if org is None:
        raise JourneyValidationError(f"Unknown partner: {partner_slug}")
    if org.status not in LIVE_ATTRIBUTION_STATUSES:
        raise JourneyValidationError(f"Partner '{partner_slug}' is not accepting referrals yet")

    journey_types = org.journey_types or []
    if journey_types and journey_type not in journey_types:
        raise JourneyValidationError(f"Partner '{partner_slug}' is not enabled for this journey")

    context["partner_org_id"] = org.id
    context["partner_slug"] = org.slug
    context["partner_display_name"] = org.display_name_ar
    context["partner_attribution_source"] = "deeplink"

    if outlet_code:
        outlet = await service.get_outlet(org.id, outlet_code)
        if outlet is None or not outlet.is_active:
            raise JourneyValidationError(f"Unknown or inactive outlet: {outlet_code}")
        context["partner_outlet_id"] = outlet.id
        context["partner_outlet_code"] = outlet.outlet_code
        context["partner_outlet_name"] = outlet.name_ar

    if not context.get("source_channel"):
        channel = f"partner:{org.slug}"
        if outlet_code:
            channel = f"{channel}:{outlet_code}"
        context["source_channel"] = channel

    return context
