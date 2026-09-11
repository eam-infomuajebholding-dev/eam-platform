from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from schemas.service_requests import ServiceRequestSummary


class CustomerProfileSummary(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None


class ActiveJourneySummary(BaseModel):
    id: int
    journey_type: str
    current_step_key: str
    status: str
    updated_at: datetime | None = None


class Customer360Response(BaseModel):
    profile: CustomerProfileSummary
    service_requests: list[ServiceRequestSummary] = Field(default_factory=list)
    active_journeys: list[ActiveJourneySummary] = Field(default_factory=list)
    summary: dict[str, Any] = Field(default_factory=dict)
