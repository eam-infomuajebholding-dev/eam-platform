"""Code-level validators for JOS workflow definitions and journey input."""

from __future__ import annotations

from typing import Any


class JourneyValidationError(ValueError):
    """Raised when workflow definitions or journey input fail validation."""


def validate_workflow_definition(workflow: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(workflow, dict):
        raise JourneyValidationError("workflow_definition must be a JSON object")

    initial_step = workflow.get("initial_step")
    steps = workflow.get("steps")

    if not initial_step or not isinstance(initial_step, str):
        raise JourneyValidationError("workflow_definition.initial_step is required")

    if not isinstance(steps, list) or not steps:
        raise JourneyValidationError("workflow_definition.steps must be a non-empty list")

    step_keys: set[str] = set()
    for step in steps:
        if not isinstance(step, dict):
            raise JourneyValidationError("Each workflow step must be an object")

        key = step.get("key")
        if not key or not isinstance(key, str):
            raise JourneyValidationError("Each workflow step requires a string key")

        if key in step_keys:
            raise JourneyValidationError(f"Duplicate workflow step key: {key}")
        step_keys.add(key)

        required_fields = step.get("required_fields", [])
        if required_fields is not None and not isinstance(required_fields, list):
            raise JourneyValidationError(f"Step '{key}' required_fields must be a list")

        if step.get("terminal") is True and step.get("next"):
            raise JourneyValidationError(f"Terminal step '{key}' must not define next")

    if initial_step not in step_keys:
        raise JourneyValidationError(f"initial_step '{initial_step}' is not defined in steps")

    for step in steps:
        next_key = step.get("next")
        if next_key is not None:
            if not isinstance(next_key, str):
                raise JourneyValidationError(f"Step '{step['key']}' next must be a string")
            if next_key not in step_keys:
                raise JourneyValidationError(
                    f"Step '{step['key']}' references unknown next step '{next_key}'"
                )

    return workflow


def get_step_definition(workflow: dict[str, Any], step_key: str) -> dict[str, Any]:
    for step in workflow.get("steps", []):
        if step.get("key") == step_key:
            return step
    raise JourneyValidationError(f"Unknown step '{step_key}'")


def get_next_step_key(workflow: dict[str, Any], current_step_key: str) -> str | None:
    step = get_step_definition(workflow, current_step_key)
    if step.get("terminal") is True:
        return None
    return step.get("next")


def validate_step_input(
    workflow: dict[str, Any],
    step_key: str,
    input_data: dict[str, Any] | None,
) -> dict[str, Any]:
    step = get_step_definition(workflow, step_key)
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise JourneyValidationError("Advance input must be a JSON object")

    required_fields = step.get("required_fields") or []
    missing = [field for field in required_fields if payload.get(field) in (None, "")]
    if missing:
        raise JourneyValidationError(
            f"Missing required fields for step '{step_key}': {', '.join(missing)}"
        )

    return payload
