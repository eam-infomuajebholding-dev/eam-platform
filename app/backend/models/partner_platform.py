"""Partner portal users, API credentials, and webhooks (B2B integration)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.types import JSON

from core.database import Base

PARTNER_MEMBER_ROLE_OWNER = "owner"
PARTNER_MEMBER_ROLE_MANAGER = "manager"
PARTNER_MEMBER_ROLE_AGENT = "agent"

PARTNER_MEMBER_ROLES = frozenset(
    {PARTNER_MEMBER_ROLE_OWNER, PARTNER_MEMBER_ROLE_MANAGER, PARTNER_MEMBER_ROLE_AGENT}
)

PARTNER_ASSIGNMENT_NONE = "none"
PARTNER_ASSIGNMENT_PENDING = "pending_partner"
PARTNER_ASSIGNMENT_ACCEPTED = "accepted"
PARTNER_ASSIGNMENT_DECLINED = "declined"

PARTNER_ASSIGNMENT_STATUSES = frozenset(
    {
        PARTNER_ASSIGNMENT_NONE,
        PARTNER_ASSIGNMENT_PENDING,
        PARTNER_ASSIGNMENT_ACCEPTED,
        PARTNER_ASSIGNMENT_DECLINED,
    }
)

WEBHOOK_EVENT_SERVICE_REQUEST_CREATED = "service_request.created"
WEBHOOK_EVENT_PARTNER_ACCEPTED = "service_request.partner_accepted"
WEBHOOK_EVENT_PARTNER_DECLINED = "service_request.partner_declined"
WEBHOOK_EVENT_DELIVERY_STATUS_CHANGED = "delivery.status_changed"

PARTNER_WEBHOOK_EVENTS = frozenset(
    {
        WEBHOOK_EVENT_SERVICE_REQUEST_CREATED,
        WEBHOOK_EVENT_PARTNER_ACCEPTED,
        WEBHOOK_EVENT_PARTNER_DECLINED,
        WEBHOOK_EVENT_DELIVERY_STATUS_CHANGED,
    }
)


class PartnerMembership(Base):
    __tablename__ = "partner_memberships"
    __table_args__ = (UniqueConstraint("partner_org_id", "user_id", name="uq_partner_membership"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=False, index=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(32), nullable=False, default=PARTNER_MEMBER_ROLE_AGENT)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    invited_by_user_id = Column(String(255), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class PartnerApiCredential(Base):
    __tablename__ = "partner_api_credentials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    key_prefix = Column(String(16), nullable=False, index=True)
    key_hash = Column(String(64), nullable=False)
    scopes = Column(JSON, nullable=False, default=list, server_default="[]")
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_by_user_id = Column(String(255), ForeignKey("users.id"), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class PartnerWebhookSubscription(Base):
    __tablename__ = "partner_webhook_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    secret = Column(String(128), nullable=False)
    event_types = Column(JSON, nullable=False, default=list, server_default="[]")
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)


class PartnerWebhookDelivery(Base):
    __tablename__ = "partner_webhook_deliveries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subscription_id = Column(Integer, ForeignKey("partner_webhook_subscriptions.id"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)
    payload_json = Column(JSON, nullable=False)
    response_status = Column(Integer, nullable=True)
    success = Column(Boolean, nullable=False, default=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
