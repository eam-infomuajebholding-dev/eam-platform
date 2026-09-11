"""Helper to advance Project Management journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_project_management_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("project_type", {"project_type": "commercial"}),
        ("project_stage", {"project_stage": "delayed"}),
        (
            "project_context",
            {
                "project_objective": "تنظيم وإنقاذ مشروع تجاري متعثر",
                "current_status": "المشروع متأخر عن الجدول مع تعثر في التنسيق",
            },
        ),
        ("scope_clarity", {"scope_clarity": "partial"}),
        ("timeline_context", {"desired_timeline": "خلال شهر", "urgency": "urgent"}),
        ("budget_context", {"budget_state": "rough_estimate"}),
        (
            "challenges_context",
            {
                "main_challenges": "تأخر المقاول وتعارض قرارات أصحاب المصلحة",
                "top_risks": "تصاعد التكلفة وتأخر التسليم",
            },
        ),
        ("stakeholder_context", {"stakeholder_notes": "مالك + مقاول + استشاري"}),
        ("engagement_goal", {"engagement_goal": "recovery_plan"}),
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
