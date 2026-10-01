from typing import Any, Literal

from pydantic import BaseModel, Field


class ReadinessItem(BaseModel):
    id: str
    label_ar: str
    detail_ar: str
    env_keys: str | None = None


class PlatformReadinessResponse(BaseModel):
    generated_at: str
    overall: Literal["READY", "DEGRADED", "BLOCKED"]
    core_operational: bool
    credential_free_journeys: bool
    live_journey_count: int
    alembic: dict[str, Any]
    auth: dict[str, Any]
    payments: dict[str, Any]
    frontend_url_configured: bool
    blockers: list[ReadinessItem] = Field(default_factory=list)
    pending_external: list[ReadinessItem] = Field(default_factory=list)
    pending_business: list[ReadinessItem] = Field(default_factory=list)
    next_commands: list[str] = Field(default_factory=list)
