"""Helper to advance Furnishing journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_furnishing_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("space_type", {"space_type": "villa"}),
        ("project_stage", {"project_stage": "ready_to_furnish"}),
        ("furnishing_goal", {"furnishing_goal": "full_furnishing"}),
        ("style_direction", {"style_direction": "modern"}),
        (
            "functional_priorities",
            {"functional_priorities": "راحة العائلة ومساحات تخزين عملية"},
        ),
        ("room_scope", {"room_scope": "غرف نوم، مجلس، مطبخ، غرفة طعام"}),
        ("budget_range", {"budget_range": "mid_range"}),
        ("timeline_context", {"target_timeline": "خلال 3 أشهر", "urgency": "soon"}),
        ("procurement_preference", {"procurement_preference": "need_guidance"}),
        ("readiness_context", {"current_readiness": "المساحة جاهزة للتأثيث"}),
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
