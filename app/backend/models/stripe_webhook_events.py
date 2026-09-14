from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base


class StripeWebhookEvent(Base):
    """Processed Stripe webhook events — idempotency guard (best practice)."""

    __tablename__ = "stripe_webhook_events"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    stripe_event_id = Column(String(255), nullable=False, unique=True, index=True)
    event_type = Column(String(128), nullable=False)
    processed_at = Column(DateTime(timezone=True), default=datetime.now)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
