"""Intent → capability → journey. The six tools stay the execution seed."""

from __future__ import annotations

from dataclasses import dataclass

from services.ai_core_intents import M1_JOURNEY_INTENTS


@dataclass(frozen=True)
class CapabilityDefinition:
    capability_id: str
    journey_type: str
    tool_id: str
    description: str


def _definitions() -> dict[str, CapabilityDefinition]:
    return {
        journey_type: CapabilityDefinition(
            capability_id=f"journey.{journey_type}",
            journey_type=journey_type,
            tool_id="journey.start",
            description=f"Start the {journey_type} journey through JOS",
        )
        for journey_type in sorted(M1_JOURNEY_INTENTS)
    }


CAPABILITIES: dict[str, CapabilityDefinition] = _definitions()


def capability_for_intent(intent: str | None) -> CapabilityDefinition | None:
    if not intent:
        return None
    return CAPABILITIES.get(intent)


def classifier_intent_union() -> str:
    names = sorted([*M1_JOURNEY_INTENTS, "general"])
    return "|".join(f'"{name}"' for name in names)
