from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

QUOTE_STATUS_DRAFT = "draft"
QUOTE_STATUS_PENDING_APPROVAL = "pending_approval"
QUOTE_STATUS_APPROVED = "approved"
QUOTE_STATUS_ISSUED = "issued"
QUOTE_STATUS_CANCELLED = "cancelled"

QUOTE_STATUSES = frozenset(
    {
        QUOTE_STATUS_DRAFT,
        QUOTE_STATUS_PENDING_APPROVAL,
        QUOTE_STATUS_APPROVED,
        QUOTE_STATUS_ISSUED,
        QUOTE_STATUS_CANCELLED,
    }
)

QUOTE_ACTIVE_STATUSES = frozenset(
    {
        QUOTE_STATUS_DRAFT,
        QUOTE_STATUS_PENDING_APPROVAL,
        QUOTE_STATUS_APPROVED,
        QUOTE_STATUS_ISSUED,
    }
)

DEFAULT_CURRENCY = "SAR"
VAT_RATE = 0.15
QUOTE_VALIDITY_DAYS = 30


class Quote(Base):
    __tablename__ = "quotes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    service_request_id = Column(
        Integer,
        ForeignKey("service_requests.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    status = Column(String(32), nullable=False, default=QUOTE_STATUS_DRAFT, server_default=QUOTE_STATUS_DRAFT)
    currency = Column(String(3), nullable=False, default=DEFAULT_CURRENCY, server_default=DEFAULT_CURRENCY)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0, server_default="0")
    vat_rate = Column(Numeric(5, 4), nullable=False, default=VAT_RATE, server_default=str(VAT_RATE))
    vat_amount = Column(Numeric(12, 2), nullable=False, default=0, server_default="0")
    total_amount = Column(Numeric(12, 2), nullable=False, default=0, server_default="0")
    valid_until = Column(DateTime(timezone=True), nullable=True)
    issued_at = Column(DateTime(timezone=True), nullable=True)
    created_by_user_id = Column(String(255), nullable=False)
    approved_by_user_id = Column(String(255), nullable=True)
    internal_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    line_items = relationship(
        "QuoteLineItem",
        back_populates="quote",
        cascade="all, delete-orphan",
        order_by="QuoteLineItem.sort_order",
    )


class QuoteLineItem(Base):
    __tablename__ = "quote_line_items"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    description = Column(String(512), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1, server_default="1")
    unit_price = Column(Numeric(12, 2), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime(timezone=True), default=datetime.now)

    quote = relationship("Quote", back_populates="line_items")
