"""Helper to advance Equipment journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_equipment_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("equipment_need", {"equipment_need": "rental"}),
        ("equipment_category", {"equipment_category": "heavy_machinery"}),
        (
            "usage_context",
            {"usage_context": "حاجة لرافعة/معدات ثقيلة لمرحلة إنشاء — موجز أولي قبل أي تسعير"},
        ),
        ("location", {"location": "جدة — موقع المشروع"}),
        ("engagement_type", {"engagement_type": "rent"}),
        ("specifications_context", {"specifications_context": "قدرة/ارتفاع تقريبي — REQUIRES_VERIFICATION"}),
        ("timeline_context", {"target_timeline": "خلال شهر", "urgency": "urgent"}),
        ("budget_context", {}),
        ("readiness_context", {"readiness_context": "الموقع جاهز للتشغيل جزئياً"}),
        ("summary_review", {}),
        ("equipment_readiness_brief", {}),
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
