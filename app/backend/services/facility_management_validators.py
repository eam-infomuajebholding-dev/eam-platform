"""Domain validators for Facility Management journey (#14)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.build_villa_validators import (
    FieldValidationError,
    _error,
    _optional_string,
    _require_enum,
    _require_string,
)
from services.jos_validators import JourneyValidationError

FACILITY_MANAGEMENT_JOURNEY_TYPE = "facility_management"

FACILITY_TYPES = frozenset(
    {"commercial", "residential", "mixed_use", "industrial", "hospitality", "other"}
)
FACILITY_SCOPES = frozenset(
    {"full_building", "floor", "unit", "campus", "portfolio", "other"}
)
OPERATIONAL_CHALLENGES = frozenset(
    {
        "operations_efficiency",
        "compliance",
        "cost_control",
        "tenant_experience",
        "sustainability",
        "safety",
        "transition",
        "other",
    }
)
SERVICE_MATURITY_LEVELS = frozenset({"reactive", "mixed", "planned", "optimized", "unknown"})
ENGAGEMENT_GOALS = frozenset(
    {
        "readiness_review",
        "operations_setup",
        "contract_review",
        "transition_support",
        "compliance_audit",
        "cost_optimization",
        "other",
    }
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_facility_management_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "facility_type":
        return {"facility_type": _require_enum(payload.get("facility_type"), "facility_type", FACILITY_TYPES)}

    if step_key == "asset_location":
        return {"location": _require_string(payload.get("location"), "location", min_len=2, max_len=120)}

    if step_key == "facility_scope":
        return {
            "facility_scope": _require_enum(payload.get("facility_scope"), "facility_scope", FACILITY_SCOPES)
        }

    if step_key == "operational_challenge":
        return {
            "operational_challenge": _require_enum(
                payload.get("operational_challenge"), "operational_challenge", OPERATIONAL_CHALLENGES
            )
        }

    if step_key == "service_maturity":
        return {
            "service_maturity": _require_enum(
                payload.get("service_maturity"), "service_maturity", SERVICE_MATURITY_LEVELS
            )
        }

    if step_key == "engagement_goal":
        return {
            "engagement_goal": _require_enum(payload.get("engagement_goal"), "engagement_goal", ENGAGEMENT_GOALS)
        }

    if step_key == "timeline_context":
        result = {
            "target_timeline": _require_string(
                payload.get("target_timeline"), "target_timeline", min_len=2, max_len=120
            )
        }
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
        return result

    if step_key == "readiness_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("current_readiness"), "current_readiness", max_len=2000)
        if notes is not None:
            result["current_readiness"] = notes
        return result

    if step_key in {"summary_review", "readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError(
                [_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")]
            )
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError(
                [_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")]
            )
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Facility Management step: {step_key}")


def assemble_facility_management_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("service_maturity") in {None, "unknown"}:
        missing.append("توضيح نضج خدمات إدارة المرافق الحالية")
    if not context.get("current_readiness"):
        missing.append("وصف مختصر لوضع المرافق أو التحديات التشغيلية")

    considerations = [
        "هذا موجز جاهزية أولي وليس خطة تشغيل معتمدة أو عقد إدارة مرافق.",
        "لا يُعد وعداً بمستوى خدمة أو تكلفة أو جدول تنفيذ مضمون.",
        "يلزم مراجعة مهنية لتأكيد الخطوة التشغيلية التالية.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية إدارة المرافق",
        "understood_request": context.get("operational_challenge"),
        "facility_context": {
            "facility_type": context.get("facility_type"),
            "location": context.get("location"),
            "facility_scope": context.get("facility_scope"),
            "service_maturity": context.get("service_maturity"),
        },
        "engagement": {
            "engagement_goal": context.get("engagement_goal"),
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
            "current_readiness": context.get("current_readiness"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق إدارة المرافق والخطوة التشغيلية التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_facility_management_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_facility_management_readiness_brief(context)
    return {
        "journey_type": FACILITY_MANAGEMENT_JOURNEY_TYPE,
        "sector_slug": "facility-management",
        "facility_type": context.get("facility_type"),
        "location": context.get("location"),
        "facility_scope": context.get("facility_scope"),
        "operational_challenge": context.get("operational_challenge"),
        "service_maturity": context.get("service_maturity"),
        "engagement_goal": context.get("engagement_goal"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "current_readiness": context.get("current_readiness"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
