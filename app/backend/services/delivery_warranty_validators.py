"""Domain validators for Delivery & Owner Services journey (#16)."""

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

DELIVERY_WARRANTY_JOURNEY_TYPE = "delivery_warranty"

HANDOVER_CONTEXTS = frozenset({"new_delivery", "warranty_service", "snagging", "documentation", "other"})
DOCUMENTATION_STATES = frozenset({"complete", "partial", "missing", "unknown"})
OWNER_OBJECTIVES = frozenset(
    {"handover_support", "warranty_claim", "defects_list", "owner_manual", "other"}
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_delivery_warranty_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "handover_context":
        return {
            "handover_context": _require_enum(
                payload.get("handover_context"), "handover_context", HANDOVER_CONTEXTS
            )
        }

    if step_key == "property_location":
        return {
            "property_location": _require_string(
                payload.get("property_location"), "property_location", min_len=2, max_len=200
            )
        }

    if step_key == "project_reference":
        result: dict[str, Any] = {}
        ref = _optional_string(payload.get("project_reference"), "project_reference", max_len=120)
        if ref is not None:
            result["project_reference"] = ref
        return result

    if step_key == "issue_description":
        return {
            "issue_description": _require_string(
                payload.get("issue_description"), "issue_description", min_len=10, max_len=3000
            )
        }

    if step_key == "documentation_state":
        return {
            "documentation_state": _require_enum(
                payload.get("documentation_state"), "documentation_state", DOCUMENTATION_STATES
            )
        }

    if step_key == "owner_objective":
        return {
            "owner_objective": _require_enum(payload.get("owner_objective"), "owner_objective", OWNER_OBJECTIVES)
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

    if step_key in {"summary_review", "handover_support_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Delivery & Owner Services step: {step_key}")


def assemble_handover_support_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("documentation_state") in {None, "missing", "unknown"}:
        missing.append("مستندات التسليم/الضمان المتاحة")
    if not context.get("project_reference"):
        missing.append("مرجع المشروع أو العقد إن وُجد")

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز دعم تسليم/ملاك",
        "understood_request": context.get("issue_description"),
        "handover_context": {
            "handover_context": context.get("handover_context"),
            "property_location": context.get("property_location"),
            "owner_objective": context.get("owner_objective"),
            "documentation_state": context.get("documentation_state"),
        },
        "missing_information": missing,
        "preliminary_considerations": [
            "لا يُعد هذا قرار ضمان أو التزاماً بإصلاح — يلزم تحقق ميداني.",
            "المشروع التشغيلي يُفتح بعد قبول عرض/عقد عند توفر مسار تجاري.",
        ],
        "recommended_next_step": "مراجعة مهنية لتحديد نطاق التسليم أو الضمان",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_delivery_warranty_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_handover_support_brief(context)
    return {
        "journey_type": DELIVERY_WARRANTY_JOURNEY_TYPE,
        "sector_slug": "delivery-warranty",
        "handover_context": context.get("handover_context"),
        "property_location": context.get("property_location"),
        "project_reference": context.get("project_reference"),
        "issue_description": context.get("issue_description"),
        "documentation_state": context.get("documentation_state"),
        "owner_objective": context.get("owner_objective"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
