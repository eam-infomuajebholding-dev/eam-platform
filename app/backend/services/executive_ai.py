"""Executive AI orchestration — permission-filtered context via AI Core only."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone

from schemas.operations_dashboard import CommandCenterOverviewResponse, ExecutiveBriefResponse
from services.ai.prompt_registry import EXECUTIVE_BRIEF
from services.ai_core import AICoreService
from services.operations_dashboard import OperationsDashboardService

logger = logging.getLogger(__name__)


class ExecutiveAIService:
    """Augments rule-assisted brief with AI Core when provider is available."""

    def __init__(self) -> None:
        self.ai_core = AICoreService()

    async def enhance_brief(
        self,
        overview: CommandCenterOverviewResponse,
        rule_brief: ExecutiveBriefResponse,
        question: str | None = None,
    ) -> ExecutiveBriefResponse:
        if not self.ai_core.is_ai_available():
            rule_brief.limitations = [
                *rule_brief.limitations,
                "AI_DEGRADED — provider unavailable; RULE_ASSISTED fallback active",
            ]
            return rule_brief

        context = self._build_safe_context(overview)
        try:
            payload = await self.ai_core.generate_executive_analysis(context, question)
            return self._merge_ai_response(rule_brief, payload)
        except Exception as exc:
            logger.warning("Executive AI failed; using rule-assisted fallback: %s", type(exc).__name__)
            rule_brief.limitations = [
                *rule_brief.limitations,
                f"AI_DEGRADED — analysis failed ({type(exc).__name__})",
            ]
            return rule_brief

    def _build_safe_context(self, overview: CommandCenterOverviewResponse) -> dict:
        """Aggregate-only context — no customer PII, no secrets."""
        return {
            "generated_at": overview.generated_at.isoformat(),
            "real_journey_count": overview.real_journey_count,
            "service_request_status_counts": overview.service_request_status_counts,
            "journey_status_counts": overview.journey_status_counts,
            "executive_kpis": [
                {
                    "metric_id": k.metric_id,
                    "label_ar": k.label_ar,
                    "value": k.value,
                    "truth_state": k.truth_state,
                    "source": k.source,
                }
                for k in overview.executive_kpis
            ],
            "strategic_scorecard": [s.model_dump() for s in overview.strategic_scorecard],
            "risk_items": [r.model_dump() for r in overview.risk_items],
            "what_changed": [c.model_dump() for c in overview.what_changed],
            "commercial_funnel": [f.model_dump() for f in overview.commercial_funnel],
            "platform_health": [h.model_dump() for h in overview.platform_health],
            "attention_count": len(overview.attention_items),
            "blockers": [
                "QUOTE=BLOCKED_BUSINESS_DECISION",
                "OIDC=BLOCKED_EXTERNAL",
            ],
        }

    def _merge_ai_response(
        self,
        rule_brief: ExecutiveBriefResponse,
        payload: dict,
    ) -> ExecutiveBriefResponse:
        return ExecutiveBriefResponse(
            generated_at=datetime.now(timezone.utc),
            ai_assistance="AI_ASSISTED",
            ai_enhanced=True,
            facts=_merge_unique(rule_brief.facts, payload.get("facts", [])),
            recommendations=_merge_unique(rule_brief.recommendations, payload.get("recommendations", [])),
            decisions_needed=_merge_unique(rule_brief.decisions_needed, payload.get("decisions_needed", [])),
            watch_next=_merge_unique(rule_brief.watch_next, payload.get("watch_next", [])),
            what_changed=_merge_unique(rule_brief.what_changed, payload.get("what_changed", [])),
            what_matters=_merge_unique(rule_brief.what_matters, payload.get("what_matters", [])),
            why=_merge_unique(rule_brief.why, payload.get("why", [])),
            limitations=_merge_unique(
                rule_brief.limitations,
                payload.get("limitations", []) + ["AI insights require evidence_refs review"],
            ),
            assistant_message=payload.get("brief_summary") or payload.get("assistant_message"),
        )


def _merge_unique(base: list[str], extra: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in [*base, *extra]:
        if item and item not in seen:
            seen.add(item)
            out.append(item)
    return out
