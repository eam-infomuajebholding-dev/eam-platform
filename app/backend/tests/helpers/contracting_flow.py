"""Helper to advance Contracting journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_contracting_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        (
            "project_context",
            {
                "project_type": "new_build",
                "project_description": "مشروع فيلا سكنية جاهزة للتنفيذ في الرياض",
                "current_stage": "design",
            },
        ),
        ("project_location", {"location": "الرياض"}),
        ("design_readiness", {"design_readiness": "architectural"}),
        ("boq_readiness", {"boq_readiness": "partial"}),
        ("site_readiness", {"site_readiness": "accessible"}),
        ("scope_type", {"scope_type": "general_contracting"}),
        ("procurement_goal", {"procurement_goal": "contractor_sourcing"}),
        ("timeline_context", {"desired_start": "خلال 3 أشهر", "urgency": "soon"}),
        ("budget_context", {"budget_range": "1m_3m"}),
        ("contractor_requirements", {"requirements_notes": "خبرة مقاولات سكنية"}),
        ("documents_context", {"drawings_available": True, "boq_available": False}),
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
