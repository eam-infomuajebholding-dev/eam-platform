from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DeliveryShipmentEventSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_status: str
    to_status: str
    actor_role: str
    note: str | None = None
    created_at: datetime | None = None


class DeliveryShipmentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_code: str
    service_request_id: int
    procurement_order_id: int
    status: str
    delivery_address: str | None = None
    carrier_name: str | None = None
    tracking_number: str | None = None
    estimated_delivery_at: datetime | None = None
    delivered_at: datetime | None = None
    partner_org_id: int | None = None
    updated_at: datetime | None = None


class DeliveryShipmentDetail(DeliveryShipmentSummary):
    events: list[DeliveryShipmentEventSummary] = Field(default_factory=list)


class DeliveryShipmentListResponse(BaseModel):
    items: list[DeliveryShipmentSummary]


class UpdateDeliveryShipmentStatusBody(BaseModel):
    status: str
    note: str | None = Field(default=None, max_length=500)
    carrier_name: str | None = Field(default=None, max_length=120)
    tracking_number: str | None = Field(default=None, max_length=120)
    estimated_delivery_at: datetime | None = None
