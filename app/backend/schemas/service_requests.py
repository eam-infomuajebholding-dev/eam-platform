from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ServiceRequestSummary(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    request_type: str
    status: str
    city: str | None = None
    desired_service: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class ServiceRequestDetail(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    request_type: str
    status: str
    intake_snapshot: dict[str, Any]
    journey_instance_id: int
    source_channel: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ServiceRequestListResponse(BaseModel):
    items: list[ServiceRequestSummary]


def summary_from_model(model: Any) -> ServiceRequestSummary:
    snapshot = model.intake_snapshot or {}
    return ServiceRequestSummary(
        id=model.id,
        reference_code=model.reference_code,
        journey_type=model.journey_type,
        request_type=model.request_type,
        status=model.status,
        city=snapshot.get("city"),
        desired_service=snapshot.get("desired_service"),
        created_at=model.created_at,
    )
