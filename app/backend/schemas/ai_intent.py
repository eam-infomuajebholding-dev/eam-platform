"""Structured AI intent routing contracts."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

IntentName = Literal[
    "build_villa",
    "engineering_consulting",
    "contracting",
    "real_estate_valuation",
    "smart_maintenance",
    "project_management",
    "furnishing",
    "facility_management",
    "government_services",
    "real_estate_development",
    "real_estate_marketing",
    "building_materials",
    "equipment",
    "general",
]
IntentAction = Literal["start_journey", "general_answer", "clarify", "journey_guidance", "ai_unavailable"]


class IntentDecision(BaseModel):
    intent: IntentName
    confidence: float = Field(ge=0.0, le=1.0)
    candidate_journey: str | None = None
    action: IntentAction
    required_confirmation: bool = False
    assistant_message: str | None = None
