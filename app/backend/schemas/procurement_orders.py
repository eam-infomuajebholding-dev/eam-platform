from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class ProcurementOrderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_code: str
    service_request_id: int
    journey_type: str
    status: str
    currency: str
    total_amount: Decimal | None = None
    delivery_location: str | None = None
    partner_org_id: int | None = None
    created_at: datetime | None = None


class ProcurementOrderDetail(ProcurementOrderSummary):
    line_items: list[dict[str, Any]] = []
    invoice_snapshot: dict[str, Any] = {}


class ProcurementOrderListResponse(BaseModel):
    items: list[ProcurementOrderSummary]
