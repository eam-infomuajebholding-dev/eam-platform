"""Owner Command Center read-model schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

TruthState = Literal[
    "LIVE",
    "STALE",
    "PARTIAL",
    "ESTIMATED",
    "NOT_AVAILABLE",
    "NOT_YET_OPERATIONAL",
    "BLOCKED",
    "UNKNOWN",
]

AttentionSeverity = Literal["NORMAL", "FYI", "WATCH", "ACTION", "DECISION", "CRITICAL"]


class MetricValue(BaseModel):
    metric_id: str
    label_ar: str
    value: int | str | None = None
    truth_state: TruthState = "LIVE"
    source: str
    drill_down_path: str | None = None
    context: str | None = None


class JourneyMetricRow(BaseModel):
    journey_type: str
    label_ar: str
    classification: Literal["REAL_CREDENTIAL_FREE", "NOT_IMPLEMENTED", "PLACEHOLDER"]
    active_count: int = 0
    completed_count: int = 0
    service_request_count: int = 0


class AttentionItem(BaseModel):
    id: str
    title_ar: str
    why_ar: str
    severity: AttentionSeverity
    domain: str
    source: str
    drill_down_path: str | None = None
    truth_state: TruthState = "LIVE"


class PlatformHealthDomain(BaseModel):
    domain: str
    label_ar: str
    status: Literal["healthy", "degraded", "unavailable", "unknown"]
    detail_ar: str | None = None


class CommercialReadinessItem(BaseModel):
    item_id: str
    label_ar: str
    status: TruthState
    blocker: str | None = None


class RecentServiceRequestRow(BaseModel):
    id: int
    reference_code: str
    journey_type: str
    status: str
    created_at: datetime | None = None


class ExecutiveBriefResponse(BaseModel):
    generated_at: datetime
    ai_assistance: Literal["RULE_ASSISTED", "AI_ASSISTED", "UNAVAILABLE"] = "RULE_ASSISTED"
    ai_enhanced: bool = False
    facts: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    decisions_needed: list[str] = Field(default_factory=list)
    watch_next: list[str] = Field(default_factory=list)
    what_changed: list[str] = Field(default_factory=list)
    what_matters: list[str] = Field(default_factory=list)
    why: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    assistant_message: str | None = None


class ScorecardItem(BaseModel):
    domain: str
    label_ar: str
    current_value: int | str
    target_value: int | str | None = None
    status: TruthState = "LIVE"
    evidence: str | None = None


class OperatingPulseItem(BaseModel):
    domain: str
    label_ar: str
    metric_id: str
    value: int | str | None = None
    truth_state: TruthState = "LIVE"
    source: str
    drill_down_path: str | None = None


class ChangeItem(BaseModel):
    metric_id: str
    label_ar: str
    baseline: int | str
    current: int | str
    direction: Literal["up", "down", "flat", "unknown"]
    significance: Literal["RELATED_EVENT", "POSSIBLE_DRIVER", "CONFIRMED_DRIVER", "UNKNOWN"] = "RELATED_EVENT"
    domain: str
    evidence: str | None = None


class RiskItem(BaseModel):
    risk_id: str
    title_ar: str
    domain: str
    severity: AttentionSeverity
    urgency: Literal["NOW", "NEAR", "PLANNING", "STRATEGIC"] = "NEAR"
    affected_capability: str
    evidence: str
    status: TruthState = "LIVE"
    mitigation: str | None = None
    decision_required: bool = False


class ControlAssuranceItem(BaseModel):
    control_id: str
    label_ar: str
    verification: Literal["TEST_VERIFIED", "RUNTIME_VERIFIED", "PARTIAL", "NOT_VERIFIED"]
    source: str
    limitations: str | None = None


class CommercialFunnelStage(BaseModel):
    stage_id: str
    label_ar: str
    status: TruthState
    detail_ar: str | None = None


InsightClassification = Literal[
    "FACT",
    "DERIVED_METRIC",
    "POSSIBLE_DRIVER",
    "RECOMMENDATION",
    "UNKNOWN",
]

ConfidenceLevel = Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT_DATA"]


class EvidenceResponse(BaseModel):
    metric_id: str
    label_ar: str
    description_ar: str
    source: str
    formula: str
    owner_domain: str
    period: str | None = None
    freshness: str | None = None
    truth_state: TruthState = "LIVE"
    last_successful_calculation: datetime | None = None
    limitations: list[str] = Field(default_factory=list)
    drill_down_path: str | None = None
    trace_id: str | None = None


CommandSearchResultType = Literal[
    "JOURNEY",
    "SERVICE_REQUEST",
    "METRIC",
    "RISK",
    "DECISION_ITEM",
    "CAPABILITY",
    "COMMAND_CENTER_VIEW",
]


class CommandSearchResult(BaseModel):
    result_type: CommandSearchResultType
    id: str
    label_ar: str
    description_ar: str | None = None
    navigation_path: str | None = None
    truth_state: TruthState = "LIVE"


class CommandSearchResponse(BaseModel):
    query: str
    mode: Literal["SEARCH", "ASK", "NAVIGATE", "INVESTIGATE"] = "SEARCH"
    results: list[CommandSearchResult] = Field(default_factory=list)
    ai_answer: str | None = None
    limitations: list[str] = Field(default_factory=list)


class CommandCenterOverviewResponse(BaseModel):
    generated_at: datetime
    authority_note: str = Field(
        default="Read model only — business truth remains in domain authorities."
    )
    owner_role_mapping: str = Field(
        default="V1 maps platform admin JWT role to OWNER authority."
    )
    real_journey_count: int
    service_request_status_counts: dict[str, int]
    service_request_journey_counts: dict[str, int]
    journey_status_counts: dict[str, int]
    journey_metrics: list[JourneyMetricRow]
    lead_counts: dict[str, int]
    attention_items: list[AttentionItem]
    platform_health: list[PlatformHealthDomain]
    commercial_readiness: list[CommercialReadinessItem]
    executive_kpis: list[MetricValue]
    recent_service_requests: list[RecentServiceRequestRow]
    financial_pulse: list[MetricValue]
    strategic_scorecard: list[ScorecardItem] = Field(default_factory=list)
    operating_pulse: list[OperatingPulseItem] = Field(default_factory=list)
    what_changed: list[ChangeItem] = Field(default_factory=list)
    comparison_period_label: str = "آخر 7 أيام مقابل 7 أيام سابقة"
    risk_items: list[RiskItem] = Field(default_factory=list)
    control_assurance: list[ControlAssuranceItem] = Field(default_factory=list)
    commercial_funnel: list[CommercialFunnelStage] = Field(default_factory=list)
