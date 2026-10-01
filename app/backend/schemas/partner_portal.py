from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PartnerMeResponse(BaseModel):
    partner_org_id: int
    partner_slug: str
    display_name_ar: str
    role: str


class PartnerServiceRequestSummary(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    status: str
    partner_assignment_status: str
    source_channel: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class PartnerServiceRequestListResponse(BaseModel):
    items: list[PartnerServiceRequestSummary]


class PartnerServiceRequestDetail(PartnerServiceRequestSummary):
    intake_snapshot: dict[str, Any]


class PartnerRespondBody(BaseModel):
    accept: bool
    decline_reason: str | None = Field(default=None, max_length=500)


class CreatePartnerMembershipBody(BaseModel):
    user_email: str
    role: str = "agent"


class CreatePartnerApiKeyBody(BaseModel):
    name: str
    scopes: list[str] = Field(default_factory=lambda: ["orders:read", "orders:write"])


class PartnerApiKeyCreatedResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    scopes: list[str]
    api_key: str
    message: str = "Store this key securely — it will not be shown again."


class PartnerApiKeySummary(BaseModel):
    id: int
    name: str
    key_prefix: str
    scopes: list[str]
    is_active: bool
    last_used_at: datetime | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class CreatePartnerWebhookBody(BaseModel):
    url: str
    description: str | None = None
    event_types: list[str] = Field(
        default_factory=lambda: [
            "service_request.created",
            "service_request.partner_accepted",
            "service_request.partner_declined",
        ]
    )


class PartnerWebhookCreatedResponse(BaseModel):
    id: int
    url: str
    event_types: list[str]
    signing_secret: str
    message: str = "Store the signing secret to verify X-EAM-Signature."


class PartnerWebhookSummary(BaseModel):
    id: int
    url: str
    event_types: list[str]
    is_active: bool
    description: str | None = None

    class Config:
        from_attributes = True


class PartnerWebhookDeliverySummary(BaseModel):
    id: int
    subscription_id: int
    event_type: str
    response_status: int | None = None
    success: bool
    error_message: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
