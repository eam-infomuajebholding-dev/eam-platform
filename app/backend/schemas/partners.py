from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PartnerOutletPublic(BaseModel):
    outlet_code: str
    name_ar: str
    name_en: str | None = None
    city: str | None = None


class PartnerOrganizationPublic(BaseModel):
    slug: str
    display_name_ar: str
    display_name_en: str | None = None
    sector_slugs: list[str] = Field(default_factory=list)
    journey_types: list[str] = Field(default_factory=list)
    status: str
    outlets: list[PartnerOutletPublic] = Field(default_factory=list)


class PartnerResolveResponse(BaseModel):
    partner: PartnerOrganizationPublic
    outlet: PartnerOutletPublic | None = None
    sample_journey_links: list[dict[str, str]] = Field(default_factory=list)


class PartnerOutletSummary(BaseModel):
    id: int
    outlet_code: str
    name_ar: str
    name_en: str | None = None
    city: str | None = None
    is_active: bool

    class Config:
        from_attributes = True


class PartnerOrganizationSummary(BaseModel):
    id: int
    slug: str
    legal_name: str
    display_name_ar: str
    display_name_en: str | None = None
    status: str
    journey_types: list[str] = Field(default_factory=list)
    sector_slugs: list[str] = Field(default_factory=list)
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class PartnerOrganizationDetail(PartnerOrganizationSummary):
    internal_notes: str | None = None
    outlets: list[PartnerOutletSummary] = Field(default_factory=list)
    sample_journey_links: list[dict[str, str]] = Field(default_factory=list)


class PartnerOrganizationListResponse(BaseModel):
    items: list[PartnerOrganizationSummary]


class CreatePartnerOrganizationBody(BaseModel):
    slug: str
    legal_name: str
    display_name_ar: str
    display_name_en: str | None = None
    status: str = "prospect"
    journey_types: list[str] = Field(default_factory=list)
    sector_slugs: list[str] = Field(default_factory=list)
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    internal_notes: str | None = None


class UpdatePartnerOrganizationBody(BaseModel):
    legal_name: str | None = None
    display_name_ar: str | None = None
    display_name_en: str | None = None
    status: str | None = None
    journey_types: list[str] | None = None
    sector_slugs: list[str] | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    internal_notes: str | None = None


class CreatePartnerOutletBody(BaseModel):
    outlet_code: str
    name_ar: str
    name_en: str | None = None
    city: str | None = None
    is_active: bool = True


def sample_links_for_partner(slug: str, journey_types: list[str]) -> list[dict[str, str]]:
    mapping = {
        "building_materials": "/journeys/building-materials",
        "equipment": "/journeys/equipment",
        "contracting": "/journeys/contracting",
        "build_villa": "/journeys/build-villa",
    }
    links: list[dict[str, str]] = []
    for journey_type in journey_types:
        path = mapping.get(journey_type)
        if not path:
            continue
        links.append(
            {
                "journey_type": journey_type,
                "path": f"{path}?partner={slug}",
            }
        )
    return links
