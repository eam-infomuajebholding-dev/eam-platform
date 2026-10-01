"""Partner organizations and sales outlets for platform attribution."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from core.database import Base

PARTNER_STATUS_PROSPECT = "prospect"
PARTNER_STATUS_ONBOARDING = "onboarding"
PARTNER_STATUS_ACTIVE = "active"
PARTNER_STATUS_SUSPENDED = "suspended"

PARTNER_STATUSES = frozenset(
    {
        PARTNER_STATUS_PROSPECT,
        PARTNER_STATUS_ONBOARDING,
        PARTNER_STATUS_ACTIVE,
        PARTNER_STATUS_SUSPENDED,
    }
)


class PartnerOrganization(Base):
    __tablename__ = "partner_organizations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(64), nullable=False, unique=True, index=True)
    legal_name = Column(String(255), nullable=False)
    display_name_ar = Column(String(255), nullable=False)
    display_name_en = Column(String(255), nullable=True)
    status = Column(String(32), nullable=False, default=PARTNER_STATUS_PROSPECT, server_default="prospect")
    journey_types = Column(JSON, nullable=False, default=list, server_default="[]")
    sector_slugs = Column(JSON, nullable=False, default=list, server_default="[]")
    contact_name = Column(String(120), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(32), nullable=True)
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    outlets = relationship("PartnerOutlet", back_populates="organization", cascade="all, delete-orphan")


class PartnerOutlet(Base):
    __tablename__ = "partner_outlets"
    __table_args__ = (UniqueConstraint("partner_org_id", "outlet_code", name="uq_partner_outlet_code"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=False, index=True)
    outlet_code = Column(String(64), nullable=False)
    name_ar = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=True)
    city = Column(String(120), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    organization = relationship("PartnerOrganization", back_populates="outlets")
