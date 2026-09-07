from typing import Any, Literal

from pydantic import BaseModel, Field

WorkspaceAction = Literal[
    "start_journey",
    "general_answer",
    "journey_guidance",
    "ai_unavailable",
]


class JourneySnapshot(BaseModel):
    """Read-only JOS state passed to AI Core for guidance."""

    journey_instance_id: int
    journey_type: str
    current_step_key: str
    status: str
    context: dict[str, Any] = Field(default_factory=dict)


class WorkspaceTurnRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    intent_hint: str | None = None
    journey_snapshot: JourneySnapshot | None = None
    stream: bool = False


class WorkspaceTurnResponse(BaseModel):
    action: WorkspaceAction
    journey_type: str | None = None
    assistant_message: str
    ai_available: bool = True
    stream: bool = False
