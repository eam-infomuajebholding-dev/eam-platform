"""Procurement order (أمر شراء / أمر توريد) — authority for building-materials fulfillment."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.types import JSON

from core.database import Base

PO_STATUS_PROVISIONAL = "provisional"
PO_STATUS_AWAITING_PARTNER = "awaiting_partner"
PO_STATUS_PARTNER_ACCEPTED = "partner_accepted"
PO_STATUS_PARTNER_DECLINED = "partner_declined"
PO_STATUS_CLOSED = "closed"

PO_STATUSES = frozenset(
    {
        PO_STATUS_PROVISIONAL,
        PO_STATUS_AWAITING_PARTNER,
        PO_STATUS_PARTNER_ACCEPTED,
        PO_STATUS_PARTNER_DECLINED,
        PO_STATUS_CLOSED,
    }
)


class ProcurementOrder(Base):
    __tablename__ = "procurement_orders"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    service_request_id = Column(
        Integer,
        ForeignKey("service_requests.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    journey_type = Column(String(64), nullable=False, index=True)
    status = Column(String(32), nullable=False, default=PO_STATUS_PROVISIONAL, server_default=PO_STATUS_PROVISIONAL)
    currency = Column(String(8), nullable=False, default="SAR", server_default="SAR")
    total_amount = Column(Numeric(14, 2), nullable=True)
    line_items = Column(JSON, nullable=False, default=list)
    delivery_location = Column(String(500), nullable=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=True, index=True)
    invoice_snapshot = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
