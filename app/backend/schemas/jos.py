from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorkflowStepSchema(BaseModel):
    key: str
    label: str
    required_fields: list[str] = Field(default_factory=list)
    next: str | None = None
    terminal: bool = False


class WorkflowDefinitionSchema(BaseModel):
    initial_step: str
    steps: list[WorkflowStepSchema]


class JourneyDefinitionResponse(BaseModel):
    id: int
    journey_type: str
    name: str
    description: str | None = None
    workflow_definition: dict[str, Any]
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class JourneyDefinitionListResponse(BaseModel):
    items: list[JourneyDefinitionResponse]


class StartJourneyRequest(BaseModel):
    journey_type: str
    anonymous_session_id: str | None = None
    initial_context: dict[str, Any] = Field(default_factory=dict)


class AdvanceJourneyRequest(BaseModel):
    input: dict[str, Any] = Field(default_factory=dict)


class RecordEventRequest(BaseModel):
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)


class JourneyInstanceResponse(BaseModel):
    id: int
    journey_definition_id: int
    journey_type: str
    status: str
    current_step_key: str
    context: dict[str, Any]
    user_id: str | None = None
    anonymous_session_id: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    completed_at: datetime | None = None
    service_request_id: int | None = None

    class Config:
        from_attributes = True


class JourneyEventResponse(BaseModel):
    id: int
    journey_instance_id: int
    event_type: str
    from_step: str | None = None
    to_step: str | None = None
    payload: dict[str, Any] | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class JourneyEventListResponse(BaseModel):
    items: list[JourneyEventResponse]


class JourneyInstanceListResponse(BaseModel):
    items: list[JourneyInstanceResponse]


class DuplicateActiveJourneyErrorDetail(BaseModel):
    message: str
    existing_instance_id: int
