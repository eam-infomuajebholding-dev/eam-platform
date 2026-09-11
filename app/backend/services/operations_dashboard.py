"""Owner Command Center aggregation — read model, not business authority."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.consultations import Consultations
from models.contact_messages import Contact_messages
from models.journey_instances import JourneyInstance
from models.service_requests import ServiceRequest
from schemas.operations_dashboard import (
    AttentionItem,
    ChangeItem,
    CommandCenterOverviewResponse,
    CommercialFunnelStage,
    CommercialReadinessItem,
    ControlAssuranceItem,
    EvidenceResponse,
    ExecutiveBriefResponse,
    JourneyMetricRow,
    MetricValue,
    OperatingPulseItem,
    PlatformHealthDomain,
    RecentServiceRequestRow,
    RiskItem,
    ScorecardItem,
)
from services.command_center_metrics import METRIC_CATALOG
from services.jos_seed import UPSERT_JOURNEY_TYPES

REAL_JOURNEY_LABELS_AR: dict[str, str] = {
    "build_villa": "بناء فيلا",
    "engineering_consulting": "استشارة هندسية",
    "contracting": "جاهزية المقاولات",
    "real_estate_valuation": "التقييم العقاري",
    "smart_maintenance": "الصيانة الذكية",
    "project_management": "إدارة المشاريع",
    "furnishing": "التأثيث والتجهيز",
    "facility_management": "إدارة المرافق",
    "government_services": "الخدمات الحكومية",
    "real_estate_development": "التطوير العقاري",
    "real_estate_marketing": "التسويق العقاري",
}


class OperationsDashboardService:
    """Platform-wide executive read model for authorized owner/admin users."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self) -> CommandCenterOverviewResponse:
        now = datetime.now(timezone.utc)
        sr_status = await self._count_grouped(ServiceRequest.status)
        sr_journey = await self._count_grouped(ServiceRequest.journey_type)
        ji_status = await self._count_grouped(JourneyInstance.status)
        journey_rows = await self._journey_metrics(sr_journey)
        lead_counts = await self._lead_counts()
        attention = self._attention_items(sr_status, lead_counts)
        kpis = self._executive_kpis(sr_status, ji_status, lead_counts)
        financial = self._financial_pulse(sr_status)
        commercial = self._commercial_readiness()
        recent = await self._recent_service_requests()
        what_changed = await self._what_changed()
        scorecard = self._strategic_scorecard(len(UPSERT_JOURNEY_TYPES), sr_status)
        pulse = self._operating_pulse(sr_status, ji_status, lead_counts)
        risks = self._risk_items()
        controls = self._control_assurance()
        funnel = self._commercial_funnel(sr_status)

        return CommandCenterOverviewResponse(
            generated_at=now,
            real_journey_count=len(UPSERT_JOURNEY_TYPES),
            service_request_status_counts=sr_status,
            service_request_journey_counts=sr_journey,
            journey_status_counts=ji_status,
            journey_metrics=journey_rows,
            lead_counts=lead_counts,
            attention_items=attention,
            platform_health=self._platform_health(),
            commercial_readiness=commercial,
            executive_kpis=kpis,
            recent_service_requests=recent,
            financial_pulse=financial,
            strategic_scorecard=scorecard,
            operating_pulse=pulse,
            what_changed=what_changed,
            risk_items=risks,
            control_assurance=controls,
            commercial_funnel=funnel,
        )

    async def _count_grouped(self, column) -> dict[str, int]:
        result = await self.db.execute(
            select(column, func.count()).group_by(column)
        )
        return {str(row[0]): int(row[1]) for row in result.all() if row[0] is not None}

    async def _journey_metrics(self, sr_by_journey: dict[str, int]) -> list[JourneyMetricRow]:
        active_result = await self.db.execute(
            select(JourneyInstance.journey_type, func.count())
            .where(JourneyInstance.status.in_(("active", "paused")))
            .group_by(JourneyInstance.journey_type)
        )
        active_map = {str(r[0]): int(r[1]) for r in active_result.all()}

        completed_result = await self.db.execute(
            select(JourneyInstance.journey_type, func.count())
            .where(JourneyInstance.status == "completed")
            .group_by(JourneyInstance.journey_type)
        )
        completed_map = {str(r[0]): int(r[1]) for r in completed_result.all()}

        rows: list[JourneyMetricRow] = []
        for journey_type in sorted(UPSERT_JOURNEY_TYPES):
            rows.append(
                JourneyMetricRow(
                    journey_type=journey_type,
                    label_ar=REAL_JOURNEY_LABELS_AR.get(journey_type, journey_type),
                    classification="REAL_CREDENTIAL_FREE",
                    active_count=active_map.get(journey_type, 0),
                    completed_count=completed_map.get(journey_type, 0),
                    service_request_count=sr_by_journey.get(journey_type, 0),
                )
            )
        return rows

    async def _lead_counts(self) -> dict[str, int]:
        unread = await self.db.execute(
            select(func.count()).select_from(Contact_messages).where(Contact_messages.status == "unread")
        )
        pending = await self.db.execute(
            select(func.count()).select_from(Consultations).where(Consultations.status == "pending")
        )
        return {
            "contact_messages_unread": int(unread.scalar_one() or 0),
            "consultations_pending": int(pending.scalar_one() or 0),
        }

    async def _recent_service_requests(self, limit: int = 8) -> list[RecentServiceRequestRow]:
        result = await self.db.execute(
            select(ServiceRequest)
            .order_by(ServiceRequest.created_at.desc())
            .limit(limit)
        )
        return [
            RecentServiceRequestRow(
                id=item.id,
                reference_code=item.reference_code,
                journey_type=item.journey_type,
                status=item.status,
                created_at=item.created_at,
            )
            for item in result.scalars().all()
        ]

    def _executive_kpis(
        self,
        sr_status: dict[str, int],
        ji_status: dict[str, int],
        leads: dict[str, int],
    ) -> list[MetricValue]:
        total_sr = sum(sr_status.values())
        backlog = sr_status.get("submitted", 0) + sr_status.get("under_review", 0)
        awaiting = sr_status.get("awaiting_information", 0)
        qualified = sr_status.get("qualified", 0)
        active_journeys = ji_status.get("active", 0) + ji_status.get("paused", 0)

        return [
            MetricValue(
                metric_id="service_requests_total",
                label_ar="إجمالي طلبات الخدمة",
                value=total_sr,
                source="service_requests",
                drill_down_path="/operations/service-requests",
            ),
            MetricValue(
                metric_id="operations_backlog",
                label_ar="طلبات قيد المعالجة",
                value=backlog,
                source="service_requests",
                drill_down_path="/operations/service-requests?status=submitted",
            ),
            MetricValue(
                metric_id="awaiting_information",
                label_ar="بانتظار معلومات العميل",
                value=awaiting,
                source="service_requests",
                drill_down_path="/operations/service-requests?status=awaiting_information",
            ),
            MetricValue(
                metric_id="qualified_requests",
                label_ar="طلبات مؤهلة",
                value=qualified,
                source="service_requests",
                drill_down_path="/operations/service-requests?status=qualified",
            ),
            MetricValue(
                metric_id="active_journeys",
                label_ar="رحلات نشطة",
                value=active_journeys,
                source="journey_instances",
            ),
            MetricValue(
                metric_id="real_journeys",
                label_ar="رحلات تشغيلية حقيقية",
                value=len(UPSERT_JOURNEY_TYPES),
                source="jos_seed.UPSERT_JOURNEY_TYPES",
            ),
            MetricValue(
                metric_id="unread_leads",
                label_ar="رسائل/استشارات جديدة",
                value=leads.get("contact_messages_unread", 0) + leads.get("consultations_pending", 0),
                source="contact_messages+consultations",
            ),
        ]

    async def _what_changed(self) -> list[ChangeItem]:
        now = datetime.now(timezone.utc)
        current_start = now - timedelta(days=7)
        previous_start = now - timedelta(days=14)

        async def count_sr_since(since: datetime, until: datetime | None = None) -> int:
            query = select(func.count()).select_from(ServiceRequest).where(ServiceRequest.created_at >= since)
            if until is not None:
                query = query.where(ServiceRequest.created_at < until)
            result = await self.db.execute(query)
            return int(result.scalar_one() or 0)

        current_sr = await count_sr_since(current_start)
        previous_sr = await count_sr_since(previous_start, current_start)
        direction = "flat"
        if current_sr > previous_sr:
            direction = "up"
        elif current_sr < previous_sr:
            direction = "down"

        items: list[ChangeItem] = [
            ChangeItem(
                metric_id="sr_created_7d",
                label_ar="طلبات خدمة جديدة (7 أيام)",
                baseline=previous_sr,
                current=current_sr,
                direction=direction,
                domain="OPERATIONS",
                evidence="service_requests.created_at",
            )
        ]
        return items

    def _strategic_scorecard(self, journey_count: int, sr_status: dict[str, int]) -> list[ScorecardItem]:
        qualified = sr_status.get("qualified", 0)
        return [
            ScorecardItem(
                domain="JOURNEYS",
                label_ar="رحلات تشغيلية حقيقية",
                current_value=journey_count,
                target_value=16,
                status="LIVE",
                evidence="jos_seed.UPSERT_JOURNEY_TYPES",
            ),
            ScorecardItem(
                domain="COMMERCIAL",
                label_ar="طلبات مؤهلة",
                current_value=qualified,
                status="LIVE",
                evidence="service_requests.status=qualified",
            ),
            ScorecardItem(
                domain="COMMERCIAL",
                label_ar="مسار العروض",
                current_value="BLOCKED",
                status="BLOCKED",
                evidence="QUOTE=BLOCKED_BUSINESS_DECISION",
            ),
            ScorecardItem(
                domain="PRODUCTION_READINESS",
                label_ar="OIDC للقبول المصادق",
                current_value="BLOCKED_EXTERNAL",
                status="BLOCKED",
            ),
            ScorecardItem(
                domain="PRODUCT",
                label_ar="موافقة بصرية للصفحة الرئيسية",
                current_value="AWAITING_USER",
                status="PARTIAL",
            ),
        ]

    def _operating_pulse(
        self,
        sr_status: dict[str, int],
        ji_status: dict[str, int],
        leads: dict[str, int],
    ) -> list[OperatingPulseItem]:
        backlog = sr_status.get("submitted", 0) + sr_status.get("under_review", 0)
        return [
            OperatingPulseItem(
                domain="OPERATIONS",
                label_ar="طابور المراجعة",
                metric_id="operations_backlog",
                value=backlog,
                source="service_requests",
                drill_down_path="/operations/service-requests?status=submitted",
            ),
            OperatingPulseItem(
                domain="JOURNEYS",
                label_ar="رحلات نشطة",
                metric_id="active_journeys",
                value=ji_status.get("active", 0) + ji_status.get("paused", 0),
                source="journey_instances",
            ),
            OperatingPulseItem(
                domain="CUSTOMERS",
                label_ar="رسائل/استشارات جديدة",
                metric_id="unread_leads",
                value=leads.get("contact_messages_unread", 0) + leads.get("consultations_pending", 0),
                source="contact_messages+consultations",
            ),
            OperatingPulseItem(
                domain="FINANCE",
                label_ar="الإيرادات",
                metric_id="revenue",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="commercial_authority",
            ),
            OperatingPulseItem(
                domain="AI",
                label_ar="تيليمتري AI",
                metric_id="ai_telemetry",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="ai_runtime",
            ),
            OperatingPulseItem(
                domain="PLATFORM",
                label_ar="OIDC",
                metric_id="oidc",
                value="BLOCKED_EXTERNAL",
                truth_state="BLOCKED",
                source="runtime_config",
            ),
        ]

    def _risk_items(self) -> list[RiskItem]:
        return [
            RiskItem(
                risk_id="quote-blocked",
                title_ar="قرارات العروض السعرية معلّقة",
                domain="COMMERCIAL",
                severity="DECISION",
                urgency="PLANNING",
                affected_capability="Quote → Contract → Payment",
                evidence="QUOTE=BLOCKED_BUSINESS_DECISION",
                decision_required=True,
            ),
            RiskItem(
                risk_id="oidc-blocked",
                title_ar="OIDC غير مفعّل",
                domain="PLATFORM",
                severity="WATCH",
                urgency="NEAR",
                affected_capability="Authenticated customer flows",
                evidence="BLOCKED_EXTERNAL",
            ),
            RiskItem(
                risk_id="git-identity",
                title_ar="هوية Git غير مهيأة",
                domain="ENGINEERING",
                severity="WATCH",
                urgency="NEAR",
                affected_capability="Release commits",
                evidence="GIT_COMMIT_CAPABILITY=BLOCKED_GIT_IDENTITY",
            ),
        ]

    def _control_assurance(self) -> list[ControlAssuranceItem]:
        return [
            ControlAssuranceItem(
                control_id="cross_customer_isolation",
                label_ar="عزل بيانات العملاء",
                verification="TEST_VERIFIED",
                source="test_service_request_customer_privacy",
            ),
            ControlAssuranceItem(
                control_id="frozen_intake_snapshot",
                label_ar="لقطة intake مجمدة",
                verification="TEST_VERIFIED",
                source="test_service_requests",
            ),
            ControlAssuranceItem(
                control_id="jos_authority",
                label_ar="JOS سلطة واحدة",
                verification="TEST_VERIFIED",
                source="test_jos_*",
            ),
            ControlAssuranceItem(
                control_id="ai_no_state_ownership",
                label_ar="AI لا يملك حالة",
                verification="PARTIAL",
                source="architecture_review",
                limitations="Executive AI via AI Core not yet wired",
            ),
        ]

    def _commercial_funnel(self, sr_status: dict[str, int]) -> list[CommercialFunnelStage]:
        qualified = sr_status.get("qualified", 0)
        submitted = sum(sr_status.values())
        return [
            CommercialFunnelStage(stage_id="discover", label_ar="اكتشاف", status="LIVE"),
            CommercialFunnelStage(stage_id="qualify", label_ar="تأهيل", status="LIVE"),
            CommercialFunnelStage(stage_id="sr", label_ar="طلب خدمة", status="LIVE", detail_ar=f"{submitted} إجمالي"),
            CommercialFunnelStage(stage_id="review", label_ar="مراجعة مهنية", status="LIVE"),
            CommercialFunnelStage(
                stage_id="qualified",
                label_ar="مؤهل",
                status="LIVE",
                detail_ar=str(qualified),
            ),
            CommercialFunnelStage(
                stage_id="quote",
                label_ar="عرض سعر",
                status="BLOCKED",
                detail_ar="BLOCKED_BUSINESS_DECISION",
            ),
            CommercialFunnelStage(stage_id="contract", label_ar="عقد", status="NOT_YET_OPERATIONAL"),
            CommercialFunnelStage(stage_id="payment", label_ar="دفع", status="NOT_YET_OPERATIONAL"),
            CommercialFunnelStage(
                stage_id="operational_project",
                label_ar="مشروع تشغيلي",
                status="NOT_YET_OPERATIONAL",
                detail_ar="BLOCKED_UPSTREAM_COMMERCIAL_TRIGGER",
            ),
        ]

    def build_executive_brief(self, overview: CommandCenterOverviewResponse) -> ExecutiveBriefResponse:
        """Rule-assisted leadership brief — no AI Core dependency in V1."""
        sr = overview.service_request_status_counts
        total_sr = sum(sr.values())
        backlog = sr.get("submitted", 0) + sr.get("under_review", 0)
        qualified = sr.get("qualified", 0)
        awaiting = sr.get("awaiting_information", 0)

        facts = [
            f"عدد الرحلات التشغيلية الحقيقية: {overview.real_journey_count}",
            f"إجمالي طلبات الخدمة: {total_sr}",
            f"طلبات قيد المعالجة: {backlog}",
            f"طلبات مؤهلة: {qualified}",
        ]

        what_changed: list[str] = [
            f"{item.label_ar}: {item.baseline} → {item.current}"
            for item in overview.what_changed
        ]
        if total_sr > 0:
            what_changed.append(f"يوجد {total_sr} طلب(ات) خدمة مسجّلة في المنصة")
        if backlog > 0:
            what_changed.append(f"الطابور التشغيلي: {backlog} طلب(ات) قيد المراجعة أو التقديم")

        decisions_needed = [
            "قرارات العروض السعرية (QUOTE) — BLOCKED_BUSINESS_DECISION",
            "موافقة بصرية للصفحة الرئيسية — USER_VISUAL_ACCEPTANCE=AWAITING_USER",
        ]
        watch_next = [
            "OIDC للقبول المصادق — BLOCKED_EXTERNAL",
            "متابعة طلبات بانتظار معلومات العميل" if awaiting else "لا طلبات بانتظار معلومات حالياً",
        ]

        what_matters = [
            "الطلب المؤهل يمثل جاهزية تجارية حقيقية دون تسعير معتمد",
            f"الرحلات النشطة: {overview.journey_status_counts.get('active', 0)}",
        ]
        why = [
            "لا مصدر مالي معتمد — Financial Pulse يعرض NOT_AVAILABLE/ BLOCKED",
            "Command Center read model فقط — لا سلطة تجارية جديدة",
        ]
        recommendations = [
            *what_matters,
            "راجع طابور المراجعة المهنية قبل توسيع الرحلات الجديدة" if backlog else "الطابور التشغيلي هادئ حالياً",
        ]

        return ExecutiveBriefResponse(
            generated_at=overview.generated_at,
            ai_assistance="RULE_ASSISTED",
            ai_enhanced=False,
            what_changed=what_changed,
            what_matters=what_matters,
            why=why,
            recommendations=recommendations,
            decisions_needed=decisions_needed,
            watch_next=watch_next,
            facts=facts,
            limitations=[
                "RULE_ASSISTED — ليس تحليل AI Core",
                "Since My Last Visit غير متاح بدون سجل زيارات مالك",
            ],
        )

    def _financial_pulse(self, sr_status: dict[str, int]) -> list[MetricValue]:
        qualified = sr_status.get("qualified", 0)
        return [
            MetricValue(
                metric_id="cash_balance",
                label_ar="الرصيد النقدي",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="payment_authority",
                context="لا يوجد مصدر مالي معتمد بعد",
            ),
            MetricValue(
                metric_id="revenue",
                label_ar="الإيرادات",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="commercial_authority",
            ),
            MetricValue(
                metric_id="quote_pipeline",
                label_ar="مسار العروض",
                value=None,
                truth_state="BLOCKED",
                source="business_lab",
                context="QUOTE=BLOCKED_BUSINESS_DECISION",
            ),
            MetricValue(
                metric_id="qualified_commercial_demand",
                label_ar="طلب مؤهل (جاهزية تجارية)",
                value=qualified,
                truth_state="LIVE",
                source="service_requests",
                drill_down_path="/operations/service-requests?status=qualified",
            ),
        ]

    def _commercial_readiness(self) -> list[CommercialReadinessItem]:
        return [
            CommercialReadinessItem(
                item_id="quote",
                label_ar="العروض السعرية",
                status="BLOCKED",
                blocker="QUOTE_PRICING_AUTHORITY — Business Lab",
            ),
            CommercialReadinessItem(
                item_id="contract",
                label_ar="العقود",
                status="NOT_YET_OPERATIONAL",
                blocker="DEFERRED — upstream commercial acceptance",
            ),
            CommercialReadinessItem(
                item_id="payment",
                label_ar="المدفوعات",
                status="NOT_YET_OPERATIONAL",
                blocker="BLOCKED_BUSINESS_DECISION",
            ),
            CommercialReadinessItem(
                item_id="operational_project",
                label_ar="المشروع التشغيلي",
                status="NOT_YET_OPERATIONAL",
                blocker="BLOCKED_UPSTREAM_COMMERCIAL_TRIGGER",
            ),
        ]

    def _platform_health(self) -> list[PlatformHealthDomain]:
        return [
            PlatformHealthDomain(
                domain="application",
                label_ar="التطبيق",
                status="healthy",
                detail_ar="Backend process responding",
            ),
            PlatformHealthDomain(
                domain="database",
                label_ar="قاعدة البيانات",
                status="healthy",
                detail_ar="Aggregations succeeded",
            ),
            PlatformHealthDomain(
                domain="jos",
                label_ar="JOS",
                status="healthy",
                detail_ar="Single authority — journey definitions loaded",
            ),
            PlatformHealthDomain(
                domain="ai",
                label_ar="الذكاء الاصطناعي",
                status="degraded",
                detail_ar="Runtime telemetry NOT_AVAILABLE — provider may degrade independently",
            ),
            PlatformHealthDomain(
                domain="auth",
                label_ar="المصادقة",
                status="degraded",
                detail_ar="OIDC=BLOCKED_EXTERNAL for authenticated acceptance",
            ),
        ]

    def _attention_items(
        self,
        sr_status: dict[str, int],
        leads: dict[str, int],
    ) -> list[AttentionItem]:
        items: list[AttentionItem] = []

        submitted = sr_status.get("submitted", 0)
        if submitted > 0:
            items.append(
                AttentionItem(
                    id="sr-submitted-backlog",
                    title_ar=f"{submitted} طلب(ات) بانتظار بدء المراجعة",
                    why_ar="طلبات جديدة تحتاج متابعة مهنية",
                    severity="ACTION" if submitted >= 3 else "WATCH",
                    domain="OPERATIONS",
                    source="service_requests",
                    drill_down_path="/operations/service-requests?status=submitted",
                )
            )

        awaiting = sr_status.get("awaiting_information", 0)
        if awaiting > 0:
            items.append(
                AttentionItem(
                    id="sr-awaiting-info",
                    title_ar=f"{awaiting} طلب(ات) بانتظار رد العميل",
                    why_ar="تأخر الرد قد يبطئ التأهيل",
                    severity="WATCH",
                    domain="OPERATIONS",
                    source="service_requests",
                    drill_down_path="/operations/service-requests?status=awaiting_information",
                )
            )

        unread = leads.get("contact_messages_unread", 0)
        if unread > 0:
            items.append(
                AttentionItem(
                    id="contact-unread",
                    title_ar=f"{unread} رسالة تواصل غير مقروءة",
                    why_ar="طلبات تواصل جديدة من الموقع",
                    severity="FYI",
                    domain="CUSTOMERS",
                    source="contact_messages",
                )
            )

        items.extend(
            [
                AttentionItem(
                    id="blocker-quote",
                    title_ar="قرارات العروض السعرية معلّقة",
                    why_ar="QUOTE=BLOCKED_BUSINESS_DECISION — لا تسعير معتمد",
                    severity="DECISION",
                    domain="COMMERCIAL",
                    source="business_lab",
                ),
                AttentionItem(
                    id="blocker-oidc",
                    title_ar="OIDC غير مفعّل للقبول المصادق",
                    why_ar="BLOCKED_EXTERNAL — لا يؤثر على الرحلات credential-free",
                    severity="WATCH",
                    domain="PLATFORM",
                    source="runtime_config",
                ),
                AttentionItem(
                    id="visual-approval",
                    title_ar="موافقة بصرية للصفحة الرئيسية",
                    why_ar="USER_VISUAL_ACCEPTANCE=AWAITING_USER",
                    severity="DECISION",
                    domain="PRODUCT",
                    source="wo011_homepage",
                ),
            ]
        )
        return items

    async def get_metric_evidence(self, metric_id: str) -> EvidenceResponse | None:
        definition = METRIC_CATALOG.get(metric_id)
        if definition is None:
            return None

        overview = await self.get_overview()
        kpi = next((k for k in overview.executive_kpis if k.metric_id == metric_id), None)
        truth_state = kpi.truth_state if kpi else "UNKNOWN"
        limitations: list[str] = []
        if truth_state in {"NOT_AVAILABLE", "BLOCKED", "NOT_YET_OPERATIONAL"}:
            limitations.append(f"Metric truth_state={truth_state}")

        return EvidenceResponse(
            metric_id=definition.metric_id,
            label_ar=definition.label_ar,
            description_ar=definition.description_ar,
            source=definition.source,
            formula=definition.formula,
            owner_domain=definition.owner_domain,
            period=overview.comparison_period_label,
            freshness="LIVE at overview generation",
            truth_state=truth_state,
            last_successful_calculation=overview.generated_at,
            limitations=limitations,
            drill_down_path=definition.drill_down_path,
            trace_id=f"cc-evidence-{metric_id}",
        )
