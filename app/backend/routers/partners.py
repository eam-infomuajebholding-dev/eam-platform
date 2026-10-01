import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.partners import PARTNER_STATUS_ACTIVE, PARTNER_STATUS_ONBOARDING
from schemas.partners import (
    PartnerOrganizationPublic,
    PartnerOutletPublic,
    PartnerResolveResponse,
    sample_links_for_partner,
)
from services.partners import PartnerService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/partners", tags=["partners"])


@router.get("/resolve", response_model=PartnerResolveResponse)
async def resolve_partner(
    partner: str = Query(..., min_length=2, max_length=64),
    outlet: str | None = Query(None, max_length=64),
    db: AsyncSession = Depends(get_db),
):
    service = PartnerService(db)
    org = await service.get_org_by_slug(partner)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    if org.status not in {PARTNER_STATUS_ACTIVE, PARTNER_STATUS_ONBOARDING}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not available")

    outlets = await service.list_outlets(org.id)
    active_outlets = [o for o in outlets if o.is_active]

    outlet_public: PartnerOutletPublic | None = None
    if outlet:
        match = await service.get_outlet(org.id, outlet)
        if match is None or not match.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outlet not found")
        outlet_public = PartnerOutletPublic(
            outlet_code=match.outlet_code,
            name_ar=match.name_ar,
            name_en=match.name_en,
            city=match.city,
        )

    journey_types = list(org.journey_types or [])
    links = sample_links_for_partner(org.slug, journey_types)
    if outlet:
        links = [
            {**link, "path": f"{link['path']}&outlet={outlet.strip().lower()}"}
            for link in links
        ]

    return PartnerResolveResponse(
        partner=PartnerOrganizationPublic(
            slug=org.slug,
            display_name_ar=org.display_name_ar,
            display_name_en=org.display_name_en,
            sector_slugs=list(org.sector_slugs or []),
            journey_types=journey_types,
            status=org.status,
            outlets=[
                PartnerOutletPublic(
                    outlet_code=o.outlet_code,
                    name_ar=o.name_ar,
                    name_en=o.name_en,
                    city=o.city,
                )
                for o in active_outlets
            ],
        ),
        outlet=outlet_public,
        sample_journey_links=links,
    )


@router.get("/by-slug/{slug}", response_model=PartnerOrganizationPublic)
async def get_partner_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    service = PartnerService(db)
    org = await service.get_org_by_slug(slug)
    if org is None or org.status not in {PARTNER_STATUS_ACTIVE, PARTNER_STATUS_ONBOARDING}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    outlets = await service.list_outlets(org.id)
    return PartnerOrganizationPublic(
        slug=org.slug,
        display_name_ar=org.display_name_ar,
        display_name_en=org.display_name_en,
        sector_slugs=list(org.sector_slugs or []),
        journey_types=list(org.journey_types or []),
        status=org.status,
        outlets=[
            PartnerOutletPublic(
                outlet_code=o.outlet_code,
                name_ar=o.name_ar,
                name_en=o.name_en,
                city=o.city,
            )
            for o in outlets
            if o.is_active
        ],
    )
