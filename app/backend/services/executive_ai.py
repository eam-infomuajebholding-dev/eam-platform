"""Executive AI orchestration — permission-filtered context via AI Core only."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from schemas.ai_core import WorkspaceClientHints
from schemas.auth import UserResponse
from schemas.operations_dashboard import CommandCenterOverviewResponse, ExecutiveBriefResponse
from services.ai.ai_trace import ai_trace
from services.ai.context_engine import ContextEngine, actor_binding
from services.ai.prompt_registry import EXECUTIVE_BRIEF
from services.ai.response_builder import new_trace_id
from services.ai_core import AICoreService, _apply_context_trace

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
        *,
        db=None,
        user: UserResponse | None = None,
        locale: str = "ar",
        route: str = "/command-center",
    ) -> ExecutiveBriefResponse:
        safe_locale = "en" if locale == "en" else "ar"
        ai_context = await ContextEngine(db).build(
            actor_binding(user, None),
            WorkspaceClientHints(
                surface="command_center",
                route=route or "/command-center",
                locale=safe_locale,
            ),
        )
        trace_id = new_trace_id()
        with ai_trace(trace_id, "executive.brief") as trace:
            _apply_context_trace(trace, ai_context)
            if ai_context.forbidden:
                trace.error_code = "AI_CONTEXT_FORBIDDEN"
                rule_brief.limitations = [*rule_brief.limitations, "AI_CONTEXT_FORBIDDEN"]
                return rule_brief
            if not self.ai_core.is_ai_available():
                trace.fallback = True
                trace.error_code = "AI_NOT_CONFIGURED"
                rule_brief.limitations = [
                    *rule_brief.limitations,
                    "AI_DEGRADED — provider unavailable; RULE_ASSISTED fallback active",
                ]
                return rule_brief

            context = self._build_safe_context(overview)
            try:
                payload = await self.ai_core.generate_executive_analysis(
                    context,
                    question,
                    ai_context=ai_context,
                )
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
