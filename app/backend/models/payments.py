from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String

from core.database import Base

PAYMENT_STATUS_PENDING = "pending"
PAYMENT_STATUS_COMPLETED = "completed"
PAYMENT_STATUS_FAILED = "failed"
PAYMENT_STATUS_EXPIRED = "expired"

PAYMENT_STATUSES = frozenset(
    {
        PAYMENT_STATUS_PENDING,
        PAYMENT_STATUS_COMPLETED,
        PAYMENT_STATUS_FAILED,
        PAYMENT_STATUS_EXPIRED,
    }
)


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    service_request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    stripe_checkout_session_id = Column(String(255), nullable=False, unique=True, index=True)
    stripe_payment_intent_id = Column(String(255), nullable=True, index=True)
    stripe_receipt_url = Column(String(512), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="SAR", server_default="SAR")
    status = Column(String(32), nullable=False, default=PAYMENT_STATUS_PENDING, server_default=PAYMENT_STATUS_PENDING)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
    paid_at = Column(DateTime(timezone=True), nullable=True)
