from typing import Any

from pydantic import BaseModel, Field


class PlatformArchitectureResponse(BaseModel):
    schema_version: str
    layer_model: list[str]
    workflow_authority: str
    platform_business_services: list[dict[str, str]]
    sectors: list[dict[str, Any]]
    summary: dict[str, int | str] = Field(default_factory=dict)
