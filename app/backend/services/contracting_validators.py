"""Domain validators for Contracting journey (#09)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.build_villa_validators import FieldValidationError, _error, _optional_bool, _optional_string, _require_enum, _require_string
from services.jos_validators import JourneyValidationError

CONTRACTING_JOURNEY_TYPE = "contracting"

PROJECT_TYPES = frozenset({"new_build", "renovation", "fit_out", "other"})
PROJECT_STAGES = frozenset({"concept", "planning", "design", "execution", "other"})
DESIGN_READINESS = frozenset(
    {"concept_only", "architectural", "approved_design", "working_drawings", "unknown"}
)
BOQ_READINESS = frozenset({"available", "partial", "not_available", "not_sure"})
SITE_READINESS = frozenset({"accessible", "existing_structure", "needs_demolition", "not_ready", "unknown"})
SCOPE_TYPES = frozenset(
    {
        "general_contracting",
        "structural",
        "finishing",
        "mep",
        "renovation",
        "fit_out",
        "specific_package",
        "other",
    }
)
PROCUREMENT_GOALS = frozenset(
    {
        "readiness_review",
        "scope_preparation",
        "contractor_sourcing",
        "bid_comparison",
        "execution_management",
        "other",
    }
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})
BUDGET_RANGES = frozenset({"under_500k", "500k_1m", "1m_3m", "3m_5m", "over_5m", "undecided"})


def validate_contracting_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "project_context":
        return {
            "project_type": _require_enum(payload.get("project_type"), "project_type", PROJECT_TYPES),
            "project_description": _require_string(
                payload.get("project_description"), "project_description", min_len=10, max_len=2000
            ),
            "current_stage": _require_enum(payload.get("current_stage"), "current_stage", PROJECT_STAGES),
        }

    if step_key == "project_location":
        return {"location": _require_string(payload.get("location"), "location", min_len=2, max_len=120)}

    if step_key == "design_readiness":
        return {
            "design_readiness": _require_enum(
                payload.get("design_readiness"), "design_readiness", DESIGN_READINESS
            )
        }

    if step_key == "boq_readiness":
        return {
            "boq_readiness": _require_enum(payload.get("boq_readiness"), "boq_readiness", BOQ_READINESS)
        }

    if step_key == "site_readiness":
        return {
            "site_readiness": _require_enum(payload.get("site_readiness"), "site_readiness", SITE_READINESS)
        }

    if step_key == "scope_type":
        return {"scope_type": _require_enum(payload.get("scope_type"), "scope_type", SCOPE_TYPES)}

    if step_key == "procurement_goal":
        return {
            "procurement_goal": _require_enum(
                payload.get("procurement_goal"), "procurement_goal", PROCUREMENT_GOALS
            )
        }

    if step_key == "timeline_context":
        result = {
            "desired_start": _require_string(payload.get("desired_start"), "desired_start", min_len=2, max_len=120)
        }
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
        return result

    if step_key == "budget_context":
        return {
            "budget_range": _require_enum(payload.get("budget_range"), "budget_range", BUDGET_RANGES)
        }

    if step_key == "contractor_requirements":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("requirements_notes"), "requirements_notes", max_len=2000)
        if notes is not None:
            result["requirements_notes"] = notes
        experience = _optional_string(payload.get("experience_type"), "experience_type", max_len=200)
        if experience is not None:
            result["experience_type"] = experience
        return result

    if step_key == "documents_context":
        result = {}
        for field in ("drawings_available", "boq_available", "permits_available", "site_photos_available"):
            value = _optional_bool(payload.get(field), field)
            if value is not None:
                result[field] = value
        notes = _optional_string(payload.get("document_notes"), "document_notes", max_len=2000)
        if notes is not None:
            result["document_notes"] = notes
        return result

    if step_key in {"summary_review", "readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError(
                [_error("scope_confirmed", "required", "scope_confirmed must be true before submission")]
            )
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError(
                [_error("submit_confirmed", "required", "submit_confirmed must be true before submission")]
            )
        return {"submit_confirmed": True}

    if step_key == "intake_complete":
        raise FieldValidationError(
            [_error("step", "read_only", "intake_complete is read-only; no further input is accepted")]
        )

    raise JourneyValidationError(f"Unknown Contracting step: {step_key}")


def assemble_contracting_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    design = context.get("design_readiness")
    if design in {None, "concept_only", "unknown"}:
        missing.append("جاهزية التصميم / المخططات")
    boq = context.get("boq_readiness")
    if boq in {None, "not_available", "not_sure"}:
        missing.append("جاهزية BOQ / الكميات")
    site = context.get("site_readiness")
    if site in {None, "not_ready", "unknown"}:
        missing.append("جاهزية الموقع")
    if context.get("procurement_goal") == "contractor_sourcing" and boq in {
        "not_available",
        "not_sure",
        None,
    }:
        missing.append("BOQ أو نطاق واضح قبل البحث عن مقاول")

    considerations = [
        "هذا موجز جاهزية أولي وليس مناقصة نهائية أو ترسية مقاول.",
        "لا يُعد عرضاً سعرياً أو BOQ معتمداً أو التزاماً تعاقدياً.",
        "يلزم مراجعة مهنية قبل أي قرار تنفيذي أو تجاري.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية المقاولات",
        "understood_request": context.get("project_description"),
        "project_context": {
            "project_type": context.get("project_type"),
            "current_stage": context.get("current_stage"),
            "location": context.get("location"),
        },
        "readiness": {
            "design_readiness": design,
            "boq_readiness": boq,
            "site_readiness": site,
            "scope_type": context.get("scope_type"),
            "procurement_goal": context.get("procurement_goal"),
        },
        "commercial_context": {
            "budget_range": context.get("budget_range"),
            "desired_start": context.get("desired_start"),
            "urgency": context.get("urgency"),
        },
        "contractor_requirements": {
            "requirements_notes": context.get("requirements_notes"),
            "experience_type": context.get("experience_type"),
        },
        "documents_context": {
            "drawings_available": context.get("drawings_available"),
            "boq_available": context.get("boq_available"),
            "permits_available": context.get("permits_available"),
            "site_photos_available": context.get("site_photos_available"),
            "document_notes": context.get("document_notes"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتحديد جاهزية التنفيذ والخطوة التجارية التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_contracting_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_contracting_readiness_brief(context)
    return {
        "journey_type": CONTRACTING_JOURNEY_TYPE,
        "sector_slug": "contracting",
        "project_type": context.get("project_type"),
        "project_description": context.get("project_description"),
        "current_stage": context.get("current_stage"),
        "location": context.get("location"),
        "design_readiness": context.get("design_readiness"),
        "boq_readiness": context.get("boq_readiness"),
        "site_readiness": context.get("site_readiness"),
        "scope_type": context.get("scope_type"),
        "procurement_goal": context.get("procurement_goal"),
        "desired_start": context.get("desired_start"),
        "urgency": context.get("urgency"),
        "budget_range": context.get("budget_range"),
        "requirements_notes": context.get("requirements_notes"),
        "experience_type": context.get("experience_type"),
        "drawings_available": context.get("drawings_available"),
        "boq_available": context.get("boq_available"),
        "permits_available": context.get("permits_available"),
        "site_photos_available": context.get("site_photos_available"),
        "document_notes": context.get("document_notes"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
