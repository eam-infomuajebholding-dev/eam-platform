"""Domain validators for the Build Villa discovery journey."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from services.build_villa_schema import (
    BRIEF_DISCLAIMER,
    BRIEF_REVIEW_STEP,
    BUDGET_RANGE_LABELS,
    BUDGET_RANGES,
    DESIRED_SERVICE_LABELS,
    DESIRED_SERVICES,
    DESIRED_START_LABELS,
    DESIRED_START_OPTIONS,
    DESIGN_STYLE_LABELS,
    DESIGN_STYLES,
    LAND_OWNERSHIP_LABELS,
    LAND_OWNERSHIP_TYPES,
    SPACE_OPTION_LABELS,
    SPACE_OPTIONS,
    URGENCY_LEVELS,
)
from services.jos_validators import JourneyValidationError

MAX_LAND_AREA_SQM = 100_000
MAX_DOCUMENT_NOTES_LENGTH = 2000
MAX_DOCUMENT_REFS = 10
MAX_HOUSEHOLD_SIZE = 50
MAX_FLOORS = 10


class FieldValidationError(JourneyValidationError):
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
        raise FieldValidationError([_error(field, "too_short", f"{field} must be at least {min_len} characters")])
    if len(trimmed) > max_len:
        raise FieldValidationError([_error(field, "too_long", f"{field} must be at most {max_len} characters")])
    return trimmed


def _require_enum(value: Any, field: str, allowed: frozenset[str]) -> str:
    if value is None or value == "":
        raise FieldValidationError([_error(field, "required", f"{field} is required")])
    if not isinstance(value, str):
        raise FieldValidationError([_error(field, "invalid_type", f"{field} must be a string")])
    if value not in allowed:
        raise FieldValidationError([_error(field, "invalid_value", f"{field} must be one of: {', '.join(sorted(allowed))}")])
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
        raise FieldValidationError([_error(field, "out_of_range", f"{field} must be at most {int(max_value)}")])
    return numeric


def _optional_positive_int(value: Any, field: str, *, max_value: int) -> int | None:
    if value is None or value == "":
        return None
    try:
        numeric = int(value)
    except (TypeError, ValueError):
        raise FieldValidationError([_error(field, "invalid_type", f"{field} must be an integer")]) from None
    if numeric <= 0 or numeric > max_value:
        raise FieldValidationError([_error(field, "out_of_range", f"{field} must be between 1 and {max_value}")])
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
        raise FieldValidationError([_error(field, "too_long", f"{field} must be at most {max_len} characters")])
    return trimmed


def _validate_document_refs(value: Any) -> list[dict[str, str | None]]:
    if value is None or value == []:
        return []
    if not isinstance(value, list):
        raise FieldValidationError([_error("document_refs", "invalid_type", "document_refs must be an array")])
    if len(value) > MAX_DOCUMENT_REFS:
        raise FieldValidationError([_error("document_refs", "too_many", f"document_refs must contain at most {MAX_DOCUMENT_REFS} items")])
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


def _validate_space_selection(value: Any) -> list[str]:
    if value is None or value == []:
        return []
    if not isinstance(value, list):
        raise FieldValidationError([_error("selected_spaces", "invalid_type", "selected_spaces must be an array")])
    validated: list[str] = []
    for index, item in enumerate(value):
        if not isinstance(item, str) or item not in SPACE_OPTIONS:
            raise FieldValidationError([_error(f"selected_spaces[{index}]", "invalid_value", "invalid space option")])
        if item not in validated:
            validated.append(item)
    return validated


def validate_build_villa_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "project_intent":
        return {"project_objective": _require_string(payload.get("project_objective"), "project_objective", min_len=10, max_len=2000)}

    if step_key == "city":
        return {"city": _require_string(payload.get("city"), "city", min_len=2, max_len=100)}

    if step_key == "land_ownership":
        return {"land_ownership_type": _require_enum(payload.get("land_ownership_type"), "land_ownership_type", LAND_OWNERSHIP_TYPES)}

    if step_key == "land_area":
        return {"land_area_sqm": _require_positive_number(payload.get("land_area_sqm"), "land_area_sqm", max_value=MAX_LAND_AREA_SQM)}

    if step_key == "household_needs":
        result: dict[str, Any] = {}
        household_size = _optional_positive_int(payload.get("household_size"), "household_size", max_value=MAX_HOUSEHOLD_SIZE)
        use_summary = _optional_string(payload.get("use_summary"), "use_summary", max_len=1500)
        if household_size is not None:
            result["household_size"] = household_size
        if use_summary is not None:
            result["use_summary"] = use_summary
        if not result:
            raise FieldValidationError([_error("use_summary", "required", "Provide household size or use summary")])
        for optional in ("accessibility_needs", "staff_areas_needed", "future_expansion_notes"):
            val = _optional_string(payload.get(optional), optional, max_len=500)
            if val is not None:
                result[optional] = val
        return result

    if step_key == "space_program":
        result = {}
        floors = _optional_positive_int(payload.get("floors"), "floors", max_value=MAX_FLOORS)
        bedrooms = _optional_positive_int(payload.get("bedrooms"), "bedrooms", max_value=30)
        selected = _validate_space_selection(payload.get("selected_spaces"))
        notes = _optional_string(payload.get("space_notes"), "space_notes", max_len=1500)
        if floors is not None:
            result["floors"] = floors
        if bedrooms is not None:
            result["bedrooms"] = bedrooms
        if selected:
            result["selected_spaces"] = selected
        if notes is not None:
            result["space_notes"] = notes
        if not result:
            raise FieldValidationError([_error("space_notes", "required", "Provide space selections or notes")])
        return result

    if step_key == "budget_context":
        return {"budget_range": _require_enum(payload.get("budget_range"), "budget_range", BUDGET_RANGES)}

    if step_key == "timeline_context":
        result = {"desired_start": _require_enum(payload.get("desired_start"), "desired_start", DESIRED_START_OPTIONS)}
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
        return result

    if step_key == "design_direction":
        result = {"design_style": _require_enum(payload.get("design_style"), "design_style", DESIGN_STYLES)}
        notes = _optional_string(payload.get("design_notes"), "design_notes", max_len=1000)
        if notes is not None:
            result["design_notes"] = notes
        return result

    if step_key == "documents_context":
        result = {}
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
        return {"desired_service": _require_enum(payload.get("desired_service"), "desired_service", DESIRED_SERVICES)}

    if step_key == "summary_review":
        return {}

    if step_key == "brief_review":
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "scope_confirmed must be true")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "submit_confirmed must be true")])
        return {"submit_confirmed": True}

    if step_key == "intake_complete":
        raise FieldValidationError([_error("step", "read_only", "intake_complete is read-only")])

    raise JourneyValidationError(f"Unknown Build Villa step: {step_key}")


def assemble_preliminary_villa_brief(context: dict[str, Any]) -> dict[str, Any]:
    service = context.get("desired_service")
    ownership = context.get("land_ownership_type")
    selected_spaces = context.get("selected_spaces") or []
    missing: list[str] = []
    if not context.get("document_refs") and context.get("has_documents") is not True:
        missing.append("مستندات الأرض أو المخططات إن وُجدت")

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE-ASSISTED",
        "professional_review_required": True,
        "title": "موجز مشروع فيلا أولي",
        "disclaimer": BRIEF_DISCLAIMER,
        "project_objective": context.get("project_objective"),
        "location": {"city": context.get("city")},
        "land_summary": {
            "ownership_type": ownership,
            "ownership_label": LAND_OWNERSHIP_LABELS.get(ownership, ownership),
            "area_sqm": context.get("land_area_sqm"),
            "has_documents": context.get("has_documents"),
            "document_notes": context.get("document_notes"),
            "document_refs": context.get("document_refs") or [],
        },
        "household_summary": {
            "household_size": context.get("household_size"),
            "use_summary": context.get("use_summary"),
            "accessibility_needs": context.get("accessibility_needs"),
            "staff_areas_needed": context.get("staff_areas_needed"),
            "future_expansion_notes": context.get("future_expansion_notes"),
        },
        "space_program_summary": {
            "floors": context.get("floors"),
            "bedrooms": context.get("bedrooms"),
            "selected_spaces": [SPACE_OPTION_LABELS.get(s, s) for s in selected_spaces],
            "space_notes": context.get("space_notes"),
        },
        "budget_context": {
            "budget_range": context.get("budget_range"),
            "budget_range_label": BUDGET_RANGE_LABELS.get(context.get("budget_range"), context.get("budget_range")),
        },
        "timeline_context": {
            "desired_start": context.get("desired_start"),
            "desired_start_label": DESIRED_START_LABELS.get(context.get("desired_start"), context.get("desired_start")),
            "urgency": context.get("urgency"),
        },
        "design_direction": {
            "design_style": context.get("design_style"),
            "design_style_label": DESIGN_STYLE_LABELS.get(context.get("design_style"), context.get("design_style")),
            "design_notes": context.get("design_notes"),
        },
        "requested_eam_scope": {
            "desired_service": service,
            "desired_service_label": DESIRED_SERVICE_LABELS.get(service, service),
        },
        "known_constraints": {
            "land_ownership_type": ownership,
            "land_area_sqm": context.get("land_area_sqm"),
        },
        "missing_information": missing,
        "preliminary_considerations": [
            BRIEF_DISCLAIMER,
            "يلزم مراجعة مهندس/استشاري مختص قبل أي قرار تنفيذي أو اعتماد رسمي.",
        ],
        "recommended_next_step": "مراجعة مهنية أولية وتحديد نطاق الخدمات والخطوة التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_preliminary_villa_brief(context)
    return {
        "journey_type": "build_villa",
        "project_objective": context.get("project_objective"),
        "city": context.get("city"),
        "land_ownership_type": context.get("land_ownership_type"),
        "land_area_sqm": context.get("land_area_sqm"),
        "household_size": context.get("household_size"),
        "use_summary": context.get("use_summary"),
        "accessibility_needs": context.get("accessibility_needs"),
        "staff_areas_needed": context.get("staff_areas_needed"),
        "future_expansion_notes": context.get("future_expansion_notes"),
        "floors": context.get("floors"),
        "bedrooms": context.get("bedrooms"),
        "selected_spaces": context.get("selected_spaces") or [],
        "space_notes": context.get("space_notes"),
        "budget_range": context.get("budget_range"),
        "desired_start": context.get("desired_start"),
        "urgency": context.get("urgency"),
        "design_style": context.get("design_style"),
        "design_notes": context.get("design_notes"),
        "has_documents": context.get("has_documents"),
        "document_notes": context.get("document_notes"),
        "document_refs": context.get("document_refs", []),
        "desired_service": context.get("desired_service"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
