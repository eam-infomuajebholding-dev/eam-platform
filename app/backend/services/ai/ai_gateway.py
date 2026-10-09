"""Single completion seam in front of the OpenAI-compatible hub."""

from __future__ import annotations

import logging
from typing import AsyncGenerator

from schemas.aihub import GenTxtRequest, GenTxtResponse
from services.aihub import AIHubService

logger = logging.getLogger(__name__)


class AIGateway:
    def __init__(self, hub: AIHubService) -> None:
        self.hub = hub

    async def complete_text(self, request: GenTxtRequest) -> GenTxtResponse:
        return await self.hub.gentxt(request)

    async def stream_text(self, request: GenTxtRequest) -> AsyncGenerator[str, None]:
        async for chunk in self.hub.gentxt_stream(request):
            yield chunk

    def record_usage(self, response: GenTxtResponse) -> dict[str, int] | None:
        usage = getattr(response, "usage", None)
        if not isinstance(usage, dict):
            return None
        try:
            return {
                "prompt_tokens": int(usage.get("prompt_tokens") or 0),
                "completion_tokens": int(usage.get("completion_tokens") or 0),
                "total_tokens": int(usage.get("total_tokens") or 0),
            }
        except (TypeError, ValueError):
            logger.debug("AI usage metadata was not numeric")
            return None
