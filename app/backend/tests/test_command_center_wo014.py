"""WO-014 Command Center: Executive AI fallback, evidence, search."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch

from schemas.operations_dashboard import CommandCenterOverviewResponse, ExecutiveBriefResponse
from datetime import datetime, timezone

from services.command_center_search import search_command_center
from services.executive_ai import ExecutiveAIService


@pytest.mark.asyncio
async def test_executive_ai_degraded_when_provider_unavailable():
    overview = CommandCenterOverviewResponse(
        generated_at=datetime.now(timezone.utc),
        real_journey_count=9,
        service_request_status_counts={},
        service_request_journey_counts={},
        journey_status_counts={},
        journey_metrics=[],
        lead_counts={},
        attention_items=[],
        platform_health=[],
        commercial_readiness=[],
        executive_kpis=[],
        recent_service_requests=[],
        financial_pulse=[],
    )
    rule_brief = ExecutiveBriefResponse(
        generated_at=overview.generated_at,
        facts=["test fact"],
    )
    service = ExecutiveAIService()
    with patch.object(service.ai_core, "is_ai_available", return_value=False):
        result = await service.enhance_brief(overview, rule_brief)
    assert result.ai_assistance == "RULE_ASSISTED"
    assert any("AI_DEGRADED" in item for item in result.limitations)


def test_command_search_qualified_requests():
    result = search_command_center("اعرض الطلبات المؤهلة")
    assert any(r.result_type == "SERVICE_REQUEST" for r in result.results)


def test_command_search_oidc_capability():
    result = search_command_center("ما حالة OIDC؟")
    assert any(r.id == "oidc" for r in result.results)


def test_command_search_government_services_journey():
    result = search_command_center("الخدمات الحكومية")
    assert any(r.id == "government_services" for r in result.results)
