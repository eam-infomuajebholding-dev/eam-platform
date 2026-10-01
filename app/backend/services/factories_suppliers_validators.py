"""Domain validators for Factories & Suppliers journey (#12)."""

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

FACTORIES_SUPPLIERS_JOURNEY_TYPE = "factories_suppliers"

SUPPLIER_ROLES = frozenset({"manufacturer", "distributor", "trader", "contractor_supply", "other"})
QUALITY_STANDARDS = frozenset({"certified", "in_progress", "unknown", "not_required"})
PARTNERSHIP_INTENTS = frozenset({"supply_agreement", "catalog_onboarding", "project_supply", "exploratory", "other"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_factories_suppliers_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "supplier_role":
        return {
            "supplier_role": _require_enum(payload.get("supplier_role"), "supplier_role", SUPPLIER_ROLES)
        }

    if step_key == "product_category":
        return {
            "product_category": _require_string(
                payload.get("product_category"), "product_category", min_len=2, max_len=500
            )
        }

    if step_key == "supply_coverage":
        return {
            "supply_coverage": _require_string(
                payload.get("supply_coverage"), "supply_coverage", min_len=2, max_len=500
            )
        }

    if step_key == "quality_standards":
        return {
            "quality_standards": _require_enum(
                payload.get("quality_standards"), "quality_standards", QUALITY_STANDARDS
            )
        }

    if step_key == "partnership_intent":
        return {
            "partnership_intent": _require_enum(
                payload.get("partnership_intent"), "partnership_intent", PARTNERSHIP_INTENTS
            )
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

    if step_key in {"summary_review", "supplier_readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Factories & Suppliers step: {step_key}")


def assemble_supplier_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("quality_standards") in {None, "unknown"}:
        missing.append("توضيح شهادات/معايير الجودة — REQUIRES_VERIFICATION")

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية مورد/مصنع",
        "understood_request": context.get("partnership_intent"),
        "supply_context": {
            "supplier_role": context.get("supplier_role"),
            "product_category": context.get("product_category"),
            "supply_coverage": context.get("supply_coverage"),
            "quality_standards": context.get("quality_standards"),
        },
        "missing_information": missing,
        "preliminary_considerations": [
            "لا يُعد اعتماداً كمورّد رسمي أو ضماناً لسعر أو توفر.",
            "ربط B2B عبر منصة الشركاء يخضع لتحقق EAM.",
        ],
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق التوريد والخطوة التشغيلية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_factories_suppliers_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_supplier_readiness_brief(context)
    return {
        "journey_type": FACTORIES_SUPPLIERS_JOURNEY_TYPE,
        "sector_slug": "factories-suppliers",
        "supplier_role": context.get("supplier_role"),
        "product_category": context.get("product_category"),
        "supply_coverage": context.get("supply_coverage"),
        "quality_standards": context.get("quality_standards"),
        "partnership_intent": context.get("partnership_intent"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "current_readiness": context.get("current_readiness"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
