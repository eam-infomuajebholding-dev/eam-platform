"""Domain validators for the Build Villa discovery journey."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from services.jos_validators import JourneyValidationError

LAND_OWNERSHIP_TYPES = frozenset({"owned", "leased", "planning_to_acquire", "other"})
DESIRED_SERVICES = frozenset({"design_only", "supervision", "execution", "full_service"})

MAX_LAND_AREA_SQM = 100_000
MAX_DOCUMENT_NOTES_LENGTH = 2000
MAX_DOCUMENT_REFS = 10


class FieldValidationError(JourneyValidationError):
    """Structured field-level validation failure."""

    def __init__(self, errors: list[dict[str, str]]):
        self.errors = errors
        super().__init__(_format_errors(errors))


def _format_errors(errors: list[dict[str, str]]) -> str:
    return "; ".join(f"{item['field']}: {item['message']}" for item in errors)


def _error(field: str, code: str, message: str) -> dict[str, str]:
    return {"field": field, "code": code, "message": message}


def _require_string(value: Any, field: str, *, min_len: int, max_len: int) -> str:
    if value is None or not isinstance(value, str):
        raise FieldValidationError([_error(field, "required", f"{field} is required")])
    trimmed = value.strip()
    if len(trimmed) < min_len:
        raise FieldValidationError(
            [_error(field, "too_short", f"{field} must be at least {min_len} characters")]
        )
    if len(trimmed) > max_len:
        raise FieldValidationError(
            [_error(field, "too_long", f"{field} must be at most {max_len} characters")]
        )
    return trimmed


def _require_enum(value: Any, field: str, allowed: frozenset[str]) -> str:
    if value is None or value == "":
        raise FieldValidationError([_error(field, "required", f"{field} is required")])
    if not isinstance(value, str):
        raise FieldValidationError([_error(field, "invalid_type", f"{field} must be a string")])
    if value not in allowed:
        raise FieldValidationError(
            [_error(field, "invalid_value", f"{field} must be one of: {', '.join(sorted(allowed))}")]
        )
    return value


def _require_positive_number(value: Any, field: str, *, max_value: float) -> float:
    if value is None or value == "":
        raise FieldValidationError([_error(field, "required", f"{field} is required")])
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        raise FieldValidationError([_error(field, "invalid_type", f"{field} must be a number")]) from None
    if numeric <= 0:
        raise FieldValidationError([_error(field, "out_of_range", f"{field} must be greater than 0")])
    if numeric > max_value:
        raise FieldValidationError(
            [_error(field, "out_of_range", f"{field} must be at most {int(max_value)}")]
        )
    return numeric


def _optional_bool(value: Any, field: str) -> bool | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return value
    raise FieldValidationError([_error(field, "invalid_type", f"{field} must be a boolean")])


def _optional_string(value: Any, field: str, *, max_len: int) -> str | None:
    if value is None or value == "":
        return None
    if not isinstance(value, str):
        raise FieldValidationError([_error(field, "invalid_type", f"{field} must be a string")])
    trimmed = value.strip()
    if len(trimmed) > max_len:
        raise FieldValidationError(
            [_error(field, "too_long", f"{field} must be at most {max_len} characters")]
        )
    return trimmed


def _validate_document_refs(value: Any) -> list[dict[str, str | None]]:
    if value is None or value == []:
        return []
    if not isinstance(value, list):
        raise FieldValidationError([_error("document_refs", "invalid_type", "document_refs must be an array")])
    if len(value) > MAX_DOCUMENT_REFS:
        raise FieldValidationError(
            [
                _error(
                    "document_refs",
                    "too_many",
                    f"document_refs must contain at most {MAX_DOCUMENT_REFS} items",
                )
            ]
        )

    validated: list[dict[str, str | None]] = []
    for index, item in enumerate(value):
        field = f"document_refs[{index}]"
        if not isinstance(item, dict):
            raise FieldValidationError([_error(field, "invalid_type", "Each document ref must be an object")])
        label = item.get("label")
        url = item.get("url")
        if not label or not isinstance(label, str) or not label.strip():
            raise FieldValidationError([_error(f"{field}.label", "required", "label is required")])
        label = label.strip()
        normalized_url: str | None = None
        if url is not None and url != "":
            if not isinstance(url, str):
                raise FieldValidationError([_error(f"{field}.url", "invalid_type", "url must be a string")])
            normalized_url = url.strip()
            parsed = urlparse(normalized_url)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise FieldValidationError([_error(f"{field}.url", "invalid_url", "url must be a valid http(s) URL")])
        validated.append({"label": label, "url": normalized_url})
    return validated


def validate_build_villa_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "city":
        return {"city": _require_string(payload.get("city"), "city", min_len=2, max_len=100)}

    if step_key == "land_ownership":
        return {
            "land_ownership_type": _require_enum(
                payload.get("land_ownership_type"), "land_ownership_type", LAND_OWNERSHIP_TYPES
            )
        }

    if step_key == "land_area":
        return {"land_area_sqm": _require_positive_number(payload.get("land_area_sqm"), "land_area_sqm", max_value=MAX_LAND_AREA_SQM)}

    if step_key == "documents_context":
        result: dict[str, Any] = {}
        has_documents = _optional_bool(payload.get("has_documents"), "has_documents")
        if has_documents is not None:
            result["has_documents"] = has_documents
        notes = _optional_string(payload.get("document_notes"), "document_notes", max_len=MAX_DOCUMENT_NOTES_LENGTH)
        if notes is not None:
            result["document_notes"] = notes
        refs = _validate_document_refs(payload.get("document_refs"))
        if refs:
            result["document_refs"] = refs
        return result

    if step_key == "desired_service":
        return {
            "desired_service": _require_enum(payload.get("desired_service"), "desired_service", DESIRED_SERVICES)
        }

    if step_key == "intake_complete":
        raise FieldValidationError(
            [_error("step", "read_only", "intake_complete is read-only; no further input is accepted")]
        )

    raise JourneyValidationError(f"Unknown Build Villa step: {step_key}")


def assemble_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    return {
        "journey_type": "build_villa",
        "city": context.get("city"),
        "land_ownership_type": context.get("land_ownership_type"),
        "land_area_sqm": context.get("land_area_sqm"),
        "has_documents": context.get("has_documents"),
        "document_notes": context.get("document_notes"),
        "document_refs": context.get("document_refs", []),
        "desired_service": context.get("desired_service"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
