"""Domain validators for Engineering Consulting journey (Pilot #08)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from services.build_villa_validators import FieldValidationError, _error, _optional_bool, _optional_string, _require_enum, _require_string
from services.jos_validators import JourneyValidationError

ENGINEERING_CONSULTING_JOURNEY_TYPE = "engineering_consulting"

DISCIPLINES = frozenset(
    {"architectural", "civil_structural", "mechanical", "electrical", "multidisciplinary", "other"}
)
PROJECT_TYPES = frozenset({"new_build", "renovation", "assessment", "feasibility", "other"})
PROJECT_STAGES = frozenset({"idea", "planning", "design", "execution", "other"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

MAX_DOCUMENT_REFS = 10
MAX_DOCUMENT_NOTES_LENGTH = 2000

DISCIPLINE_LABELS = {
    "architectural": "معماري",
    "civil_structural": "إنشائي / مدني",
    "mechanical": "ميكانيكي",
    "electrical": "كهربائي",
    "multidisciplinary": "متعدد التخصصات",
    "other": "أخرى",
}


def _validate_document_refs(value: Any) -> list[dict[str, str | None]]:
    if value is None or value == []:
        return []
    if not isinstance(value, list):
        raise FieldValidationError([_error("document_refs", "invalid_type", "document_refs must be an array")])
    if len(value) > MAX_DOCUMENT_REFS:
        raise FieldValidationError(
            [_error("document_refs", "too_many", f"document_refs must contain at most {MAX_DOCUMENT_REFS} items")]
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


def validate_engineering_consulting_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "intent":
        result = {
            "problem_statement": _require_string(
                payload.get("problem_statement"), "problem_statement", min_len=10, max_len=2000
            )
        }
        outcome = _optional_string(payload.get("desired_outcome"), "desired_outcome", max_len=1000)
        if outcome is not None:
            result["desired_outcome"] = outcome
        return result

    if step_key == "discipline":
        return {"discipline": _require_enum(payload.get("discipline"), "discipline", DISCIPLINES)}

    if step_key == "qualification":
        result = {
            "project_type": _require_enum(payload.get("project_type"), "project_type", PROJECT_TYPES),
            "location": _require_string(payload.get("location"), "location", min_len=2, max_len=120),
            "objective": _require_string(payload.get("objective"), "objective", min_len=5, max_len=1000),
        }
        stage = payload.get("current_stage")
        if stage is not None and stage != "":
            result["current_stage"] = _require_enum(stage, "current_stage", PROJECT_STAGES)
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
        return result

    if step_key == "documents":
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

    if step_key == "brief_review":
        return {}

    if step_key == "scope_confirm":
        confirmed = payload.get("scope_confirmed")
        if confirmed is not True:
            raise FieldValidationError(
                [_error("scope_confirmed", "required", "scope_confirmed must be true before submission")]
            )
        return {"scope_confirmed": True}

    if step_key == "handoff_complete":
        raise FieldValidationError(
            [_error("step", "read_only", "handoff_complete is read-only; no further input is accepted")]
        )

    raise JourneyValidationError(f"Unknown Engineering Consulting step: {step_key}")


def assemble_preliminary_brief(context: dict[str, Any]) -> dict[str, Any]:
    discipline = context.get("discipline")
    discipline_label = DISCIPLINE_LABELS.get(discipline, discipline)
    missing: list[str] = []
    if not context.get("document_refs") and context.get("has_documents") is not True:
        missing.append("مرفقات أو مستندات داعمة")
    if not context.get("desired_outcome"):
        missing.append("نتيجة مطلوبة أوضح")

    considerations = [
        "هذا موجز أولي للاستكشاف وليس رأياً هندسياً معتمداً أو تقريراً تنظيمياً.",
        "يلزم مراجعة مهندس مختص قبل أي قرار تنفيذي أو اعتماد رسمي.",
    ]
    if context.get("urgency") == "urgent":
        considerations.append("الاستعجال المذكور قد يتطلب تحديد أولويات المراجعة مع الفريق المختص.")

    return {
        "status": "PRELIMINARY",
        "assistance": "AI-ASSISTED",
        "professional_review_required": True,
        "title": "موجز هندسي أولي",
        "understood_request": context.get("problem_statement"),
        "discipline": discipline,
        "discipline_label": discipline_label,
        "project_context": {
            "project_type": context.get("project_type"),
            "location": context.get("location"),
            "objective": context.get("objective"),
            "current_stage": context.get("current_stage"),
            "urgency": context.get("urgency"),
        },
        "known_constraints": {
            "has_documents": context.get("has_documents"),
            "document_notes": context.get("document_notes"),
            "document_refs": context.get("document_refs") or [],
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية أولية وتحديد نطاق الاستشارة المعتمد",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_preliminary_brief(context)
    return {
        "journey_type": ENGINEERING_CONSULTING_JOURNEY_TYPE,
        "sector_slug": "engineering-consulting",
        "problem_statement": context.get("problem_statement"),
        "desired_outcome": context.get("desired_outcome"),
        "discipline": context.get("discipline"),
        "project_type": context.get("project_type"),
        "location": context.get("location"),
        "objective": context.get("objective"),
        "current_stage": context.get("current_stage"),
        "urgency": context.get("urgency"),
        "has_documents": context.get("has_documents"),
        "document_notes": context.get("document_notes"),
        "document_refs": context.get("document_refs") or [],
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
