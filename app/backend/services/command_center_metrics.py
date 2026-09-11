"""Canonical Command Center metric definitions — single source for evidence/lineage."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MetricDefinition:
    metric_id: str
    label_ar: str
    description_ar: str
    source: str
    formula: str
    owner_domain: str
    drill_down_path: str | None = None


METRIC_CATALOG: dict[str, MetricDefinition] = {
    "service_requests_total": MetricDefinition(
        metric_id="service_requests_total",
        label_ar="إجمالي طلبات الخدمة",
        description_ar="عدد طلبات الخدمة الرسمية المسجّلة في سلطة SR",
        source="service_requests",
        formula="COUNT(service_requests)",
        owner_domain="OPERATIONS",
        drill_down_path="/operations/service-requests",
    ),
    "operations_backlog": MetricDefinition(
        metric_id="operations_backlog",
        label_ar="طلبات قيد المعالجة",
        description_ar="طلبات بحالة submitted أو under_review",
        source="service_requests.status",
        formula="COUNT WHERE status IN (submitted, under_review)",
        owner_domain="OPERATIONS",
        drill_down_path="/operations/service-requests?status=submitted",
    ),
    "qualified_requests": MetricDefinition(
        metric_id="qualified_requests",
        label_ar="طلبات مؤهلة",
        description_ar="طلبات أكّدها المراجع المهني",
        source="service_requests.status=qualified",
        formula="COUNT WHERE status=qualified",
        owner_domain="COMMERCIAL",
        drill_down_path="/operations/service-requests?status=qualified",
    ),
    "active_journeys": MetricDefinition(
        metric_id="active_journeys",
        label_ar="رحلات نشطة",
        description_ar="جourney instances بحالة active أو paused",
        source="journey_instances",
        formula="COUNT WHERE status IN (active, paused)",
        owner_domain="JOURNEYS",
    ),
    "real_journeys": MetricDefinition(
        metric_id="real_journeys",
        label_ar="رحلات تشغيلية حقيقية",
        description_ar="عدد أنواع الرحلات في UPSERT_JOURNEY_TYPES",
        source="jos_seed.UPSERT_JOURNEY_TYPES",
        formula="LEN(UPSERT_JOURNEY_TYPES)",
        owner_domain="PRODUCT",
    ),
    "cash_balance": MetricDefinition(
        metric_id="cash_balance",
        label_ar="الرصيد النقدي",
        description_ar="لا يوجد مصدر مالي معتمد",
        source="payment_authority",
        formula="NOT_AVAILABLE",
        owner_domain="FINANCE",
    ),
}
