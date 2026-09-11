"""Helper to advance Smart Maintenance journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_smart_maintenance_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("maintenance_category", {"maintenance_category": "hvac"}),
        ("asset_location", {"location": "الرياض - برج مكتبي"}),
        (
            "issue_description",
            {"issue_description": "تكييف مركزي لا يبرد بشكل كافٍ في الطابق الثالث"},
        ),
        ("severity_level", {"severity_level": "high"}),
        ("access_readiness", {"access_readiness": "accessible"}),
        ("system_context", {"system_notes": "نظام VRF عمره 8 سنوات"}),
        ("prior_service_context", {"prior_maintenance": True, "service_notes": "صيانة دورية سنوية"}),
        ("engagement_goal", {"engagement_goal": "corrective_repair"}),
        ("timeline_context", {"desired_timeline": "خلال أسبوع", "urgency": "soon"}),
        ("summary_review", {}),
        ("readiness_brief", {}),
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
