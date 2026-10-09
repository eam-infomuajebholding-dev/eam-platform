"""Centralized production prompt ownership for AI Core."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from services.ai.capability_registry import classifier_intent_union
from services.ai.platform_assistant_policy import format_open_copilot_system_prompt

RiskLevel = Literal["low", "medium", "high"]


@dataclass(frozen=True)
class PromptDefinition:
    prompt_id: str
    purpose: str
    owner: str
    version: str
    risk_level: RiskLevel
    supported_locales: tuple[str, ...]
    content: str


FAQ_SYSTEM = PromptDefinition(
    prompt_id="faq.system",
    purpose="Open EAM Copilot — deny-list only; all other topics allowed",
    owner="ai-core",
    version="2.0.0",
    risk_level="low",
    supported_locales=("ar", "en"),
    content=format_open_copilot_system_prompt(),
)

INTENT_CLASSIFIER = PromptDefinition(
    prompt_id="intent.classifier",
    purpose="Free-text journey intent classification for homepage workspace",
    owner="ai-core",
    version="1.2.0",
    risk_level="medium",
    supported_locales=("ar", "en"),
    content=f"""Classify the user's message for the EAM workspace.
Return ONLY valid JSON with this shape:
{{"intent":{classifier_intent_union()},"confidence":0.0-1.0}}

Rules:
- intent must be one listed journey type, or general.
- Choose a journey type only when the user clearly wants that EAM service.
- Use general for greetings, company questions, or unclear messages.
- Be conservative: if unsure, choose general with low confidence.
- Do not extract business fields or validate data.""",
)

EXECUTIVE_BRIEF = PromptDefinition(
    prompt_id="executive.brief",
    purpose="Owner Command Center executive analysis from authorized read-model context",
    owner="command-center",
    version="1.0.0",
    risk_level="medium",
    supported_locales=("ar", "en"),
    content="""You are the executive analysis layer for EAM Owner Command Center.
You receive ONLY pre-authorized aggregate platform metrics. You do NOT own business state.

Return ONLY valid JSON:
{
  "brief_summary": "string",
  "facts": [{"text":"", "classification":"FACT|DERIVED_METRIC|POSSIBLE_DRIVER|RECOMMENDATION|UNKNOWN"}],
  "what_changed": ["string"],
  "what_matters": ["string"],
  "why": ["string"],
  "decisions_needed": ["string"],
  "watch_next": ["string"],
  "recommendations": ["string"],
  "limitations": ["string"],
  "data_confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT_DATA",
  "analytical_confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT_DATA"
}

Rules:
- Never invent financial numbers, revenue, cash, or ROI.
- Never convert NOT_AVAILABLE into zero or estimates.
- Never claim causation without evidence; use POSSIBLE_DRIVER when uncertain.
- Never include customer PII or cross-customer details.
- Answer in Arabic for text fields.
- If context is insufficient, say so in limitations.""",
)

PROMPT_REGISTRY: dict[str, PromptDefinition] = {
    FAQ_SYSTEM.prompt_id: FAQ_SYSTEM,
    INTENT_CLASSIFIER.prompt_id: INTENT_CLASSIFIER,
    EXECUTIVE_BRIEF.prompt_id: EXECUTIVE_BRIEF,
}


def get_prompt(prompt_id: str) -> PromptDefinition:
    try:
        return PROMPT_REGISTRY[prompt_id]
    except KeyError as exc:
        raise KeyError(f"Unknown prompt_id: {prompt_id}") from exc
