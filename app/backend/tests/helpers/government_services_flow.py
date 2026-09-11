"""Helper to advance Government Services journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_government_services_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("service_category", {"service_category": "building_permit"}),
        ("property_location", {"property_location": "الرياض — حي النرجس"}),
        ("property_type", {"property_type": "residential"}),
        (
            "request_summary",
            {"request_summary": "أحتاج استخراج رخصة بناء لفيلا سكنية جديدة في قطعة سكنية"},
        ),
        ("documents_status", {"documents_status": "have_partial"}),
        ("urgency_context", {"urgency": "soon"}),
        ("summary_review", {}),
        ("task_roadmap_brief", {}),
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
