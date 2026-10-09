from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from schemas.ai_contract import (
    AIActionProposal,
    AIError,
    AIMessage,
    AIUsageMetadata,
    ResponseIntent,
)

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


WorkspaceMode = Literal["workspace", "faq"]
WorkspaceSurface = Literal["home", "journey", "command_center", "site_editor"]
WorkspaceLocale = Literal["ar", "en"]


class WorkspaceClientHints(BaseModel):
    """Presentation hints. The server builds authority in the Context Engine."""

    model_config = {"extra": "ignore"}

    surface: WorkspaceSurface = "home"
    route: str | None = Field(default=None, max_length=300)
    locale: WorkspaceLocale = "ar"
    journey_instance_id: int | None = None

ConversationRole = Literal["user", "assistant"]


class ConversationMessage(BaseModel):
    role: ConversationRole
    content: str = Field(..., min_length=1, max_length=4000)


class WorkspaceTurnRequest(BaseModel):
    model_config = {"extra": "ignore"}

    message: str = Field(..., min_length=1, max_length=4000)
    intent_hint: str | None = None
    journey_snapshot: JourneySnapshot | None = None
    conversation_history: list[ConversationMessage] = Field(default_factory=list, max_length=24)
    stream: bool = False
    mode: WorkspaceMode = "workspace"
    client_hints: WorkspaceClientHints | None = None
    conversation_id: str | None = Field(default=None, max_length=36)

    @field_validator("conversation_history")
    @classmethod
    def trim_history(cls, value: list[ConversationMessage]) -> list[ConversationMessage]:
        return value[-24:]


class WorkspaceTurnResponse(BaseModel):
    """Backward-compatible workspace turn with v1.1 structured extensions."""

    action: WorkspaceAction
    journey_type: str | None = None
    assistant_message: str
    ai_available: bool = True
    stream: bool = False
    contract_version: str | None = None
    trace_id: str | None = None
    message: AIMessage | None = None
    intent: ResponseIntent | None = None
    actions: list[AIActionProposal] = Field(default_factory=list)
    requires_confirmation: bool = False
    handoff: dict[str, Any] | None = None
    error: AIError | None = None
    usage: AIUsageMetadata | None = None
    capability_id: str | None = None
    conversation_id: str | None = None
    citations: list[str] = Field(default_factory=list)
