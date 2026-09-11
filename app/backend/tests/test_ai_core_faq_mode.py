"""FAQ mode must never start journeys (B001/B003)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from schemas.ai_core import WorkspaceTurnRequest
from services.ai_core import AICoreService


@pytest.mark.asyncio
async def test_faq_mode_never_starts_journey():
    service = AICoreService()
    with patch.object(service, "is_ai_available", return_value=True):
        with patch.object(service, "_general_answer", AsyncMock(return_value="خدماتنا الهندسية متنوعة.")):
            response = await service.handle_turn(
                WorkspaceTurnRequest(message="أريد بناء فيلا في الرياض", mode="faq")
            )
    assert response.action == "general_answer"
    assert response.journey_type is None


@pytest.mark.asyncio
async def test_faq_mode_unavailable_when_ai_not_configured():
    service = AICoreService()
    with patch.object(service, "is_ai_available", return_value=False):
        response = await service.handle_turn(
            WorkspaceTurnRequest(message="ما هي ساعات العمل؟", mode="faq")
        )
    assert response.action == "ai_unavailable"
    assert response.journey_type is None
