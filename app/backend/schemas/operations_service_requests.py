from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ServiceRequestTransitionResponse(BaseModel):
    id: int
    from_status: str
    to_status: str
    actor_user_id: str
    actor_role: str
    reason: str | None = None
    customer_message: str | None = None
    internal_note: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class ServiceRequestActivityResponse(BaseModel):
    id: int
    from_status: str
    to_status: str
    customer_message: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class OperationsServiceRequestDetail(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    request_type: str
    status: str
    user_id: str
    intake_snapshot: dict[str, Any]
    journey_instance_id: int
    source_channel: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    transitions: list[ServiceRequestTransitionResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OperationsServiceRequestSummary(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    request_type: str
    status: str
    user_id: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class OperationsServiceRequestListResponse(BaseModel):
    items: list[OperationsServiceRequestSummary]


class StartReviewRequest(BaseModel):
    internal_note: str | None = None


class RequestInformationBody(BaseModel):
    customer_message: str = Field(..., min_length=1)
    internal_note: str | None = None


class QualifyRequestBody(BaseModel):
    reason: str | None = None
    internal_note: str | None = None


class CustomerResponseBody(BaseModel):
    message: str = Field(..., min_length=1)


class InternalNoteBody(BaseModel):
    internal_note: str = Field(..., min_length=1)
