"""Helper to advance Building Materials journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_building_materials_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("procurement_goal", {"procurement_goal": "project_supply"}),
        ("material_category", {"material_category": "structural"}),
        (
            "project_context",
            {"project_context": "توريد حديد وأسمنت لمشروع سكني — موجز أولي قبل أي عرض سعر"},
        ),
        ("delivery_location", {"delivery_location": "الرياض — موقع المشروع"}),
        ("quantity_scope", {"quantity_scope": "medium"}),
        ("specifications_context", {"specifications_context": "مواصفات تقريبية — REQUIRES_VERIFICATION"}),
        ("timeline_context", {"target_timeline": "خلال 6 أسابيع", "urgency": "soon"}),
        ("budget_context", {}),
        ("supplier_context", {"supplier_context": "مورد محلي مفضل إن وُجد"}),
        ("summary_review", {}),
        ("procurement_readiness_brief", {}),
        ("scope_confirm", {"scope_confirmed": True}),
        ("submit_confirm", {"submit_confirmed": True}),
    ]

    for step_key, payload in steps:
        instance = await jos.get_instance(instance_id)
        assert instance is not None
        assert instance.current_step_key == step_key, f"expected {step_key}, got {instance.current_step_key}"
        await jos.advance(
            instance_id,
            input_data=payload,
            anonymous_session_id=anonymous_session_id,
        )
