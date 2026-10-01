"""Owner Command Center aggregation — read model, not business authority."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.consultations import Consultations
from models.contact_messages import Contact_messages
from models.journey_instances import JourneyInstance
from models.payments import (
    PAYMENT_STATUS_COMPLETED,
    PAYMENT_STATUS_EXPIRED,
    PAYMENT_STATUS_FAILED,
    PAYMENT_STATUS_PENDING,
    Payment,
)
from models.logistics import DeliveryShipment
from models.partner_platform import PARTNER_ASSIGNMENT_PENDING
from models.procurement_orders import ProcurementOrder
from models.service_requests import ServiceRequest
from services.payment_config import is_checkout_ready, is_stripe_configured, is_stripe_webhook_configured
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
    PlatformTrendPoint,
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
    "building_materials": "مواد البناء",
    "equipment": "المعدات والآلات",
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
        fulfillment_counts = await self._fulfillment_counts()
        attention = self._attention_items(sr_status, lead_counts, fulfillment_counts)
        kpis = self._executive_kpis(sr_status, ji_status, lead_counts)
        payment_summary = await self._payment_summary()
        financial = self._financial_pulse(sr_status, payment_summary)
        commercial = self._commercial_readiness(payment_summary)
        recent = await self._recent_service_requests()
        what_changed = await self._what_changed(sr_status, ji_status, lead_counts)
        platform_trends = await self._platform_trends()
        scorecard = self._strategic_scorecard(len(UPSERT_JOURNEY_TYPES), sr_status)
        pulse = self._operating_pulse(sr_status, ji_status, lead_counts)
        risks = self._risk_items()
        controls = self._control_assurance()
        funnel = self._commercial_funnel(sr_status, payment_summary)

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
            platform_trends=platform_trends,
        )

    async def _fulfillment_counts(self) -> dict[str, int]:
        pending_partner = await self.db.scalar(
            select(func.count())
            .select_from(ServiceRequest)
            .where(ServiceRequest.partner_assignment_status == PARTNER_ASSIGNMENT_PENDING)
        )
        awaiting_dispatch = await self.db.scalar(
            select(func.count())
            .select_from(DeliveryShipment)
            .where(DeliveryShipment.status == "awaiting_dispatch")
        )
        open_po = await self.db.scalar(
            select(func.count())
            .select_from(ProcurementOrder)
            .where(ProcurementOrder.status.in_(("provisional", "awaiting_partner", "partner_accepted")))
        )
        return {
            "pending_partner": int(pending_partner or 0),
            "shipments_awaiting_dispatch": int(awaiting_dispatch or 0),
            "open_procurement_orders": int(open_po or 0),
        }

    async def _payment_summary(self) -> dict[str, float | int]:
        result = await self.db.execute(
            select(func.count(Payment.id), func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == PAYMENT_STATUS_COMPLETED
            )
        )
        row = result.one()
        status_counts = await self._count_grouped(Payment.status)
        return {
            "count": int(row[0]),
            "total": float(row[1]),
            "pending": status_counts.get(PAYMENT_STATUS_PENDING, 0),
            "failed": status_counts.get(PAYMENT_STATUS_FAILED, 0),
            "expired": status_counts.get(PAYMENT_STATUS_EXPIRED, 0),
        }

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

    async def _count_sr_between(
        self,
        since: datetime,
        until: datetime,
        *,
        status: str | None = None,
    ) -> int:
        query = select(func.count()).select_from(ServiceRequest).where(
            ServiceRequest.created_at >= since,
            ServiceRequest.created_at < until,
        )
        if status is not None:
            query = query.where(ServiceRequest.status == status)
        result = await self.db.execute(query)
        return int(result.scalar_one() or 0)

    @staticmethod
    def _direction(current: int, previous: int) -> str:
        if current > previous:
            return "up"
        if current < previous:
            return "down"
        return "flat"

    async def _what_changed(
        self,
        _sr_status: dict[str, int],
        _ji_status: dict[str, int],
        _lead_counts: dict[str, int],
    ) -> list[ChangeItem]:
        now = datetime.now(timezone.utc)
        current_start = now - timedelta(days=7)
        previous_start = now - timedelta(days=14)

        current_sr = await self._count_sr_between(current_start, now)
        previous_sr = await self._count_sr_between(previous_start, current_start)
        current_qualified = await self._count_sr_between(current_start, now, status="qualified")
        previous_qualified = await self._count_sr_between(previous_start, current_start, status="qualified")

        return [
            ChangeItem(
                metric_id="service_requests_total",
                label_ar="طلبات خدمة جديدة (7 أيام)",
                baseline=previous_sr,
                current=current_sr,
                direction=self._direction(current_sr, previous_sr),
                domain="OPERATIONS",
                evidence="service_requests.created_at",
            ),
            ChangeItem(
                metric_id="qualified_requests",
                label_ar="طلبات مؤهلة (7 أيام)",
                baseline=previous_qualified,
                current=current_qualified,
                direction=self._direction(current_qualified, previous_qualified),
                domain="COMMERCIAL",
                evidence="service_requests.status=qualified",
            ),
        ]

    async def _platform_trends(self, weeks: int = 8) -> list[PlatformTrendPoint]:
        now = datetime.now(timezone.utc)
        points: list[PlatformTrendPoint] = []

        for index in range(weeks - 1, -1, -1):
            period_end = now - timedelta(days=index * 7)
            period_start = period_end - timedelta(days=7)
            service_requests = await self._count_sr_between(period_start, period_end)
            qualified_requests = await self._count_sr_between(
                period_start, period_end, status="qualified"
            )
            points.append(
                PlatformTrendPoint(
                    period_start=period_start,
                    period_label=period_start.strftime("%Y-%m-%d"),
                    service_requests=service_requests,
                    qualified_requests=qualified_requests,
                )
            )

        return points

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
                current_value="LIVE",
                status="LIVE",
                evidence="WO-018 Quote BO — draft to issued",
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

    def _commercial_funnel(
        self,
        sr_status: dict[str, int],
        payment_summary: dict[str, float | int],
    ) -> list[CommercialFunnelStage]:
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
                status="LIVE",
                detail_ar="WO-018 Quote BO",
            ),
            CommercialFunnelStage(stage_id="contract", label_ar="عقد", status="NOT_YET_OPERATIONAL"),
            CommercialFunnelStage(
                stage_id="payment",
                label_ar="دفع",
                status="LIVE" if is_stripe_configured() else "NOT_YET_OPERATIONAL",
                detail_ar=(
                    f"Stripe Checkout — {payment_summary['count']} مدفوعة"
                    if payment_summary["count"]
                    else "Stripe Checkout — quote payments"
                ),
            ),
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
            "موافقة بصرية للصفحة الرئيسية — USER_VISUAL_ACCEPTANCE=AWAITING_USER",
        ]
        watch_next = [
            "Contract BO — deferred until accepted proposal",
            "OIDC للقبول المصادق — BLOCKED_EXTERNAL",
            "متابعة طلبات بانتظار معلومات العميل" if awaiting else "لا طلبات بانتظار معلومات حالياً",
        ]

        paid_count = next(
            (m.value for m in overview.financial_pulse if m.metric_id == "payments_collected_count"),
            None,
        )
        what_matters = [
            "الطلب المؤهل يمكن إصدار عرض سعر له — Quote BO نشط (WO-018)",
            "الدفع الإلكتروني عبر Stripe Checkout — issued quote → pay",
            f"الرحلات النشطة: {overview.journey_status_counts.get('active', 0)}",
        ]
        if paid_count:
            what_matters.append(f"مدفوعات محصّلة: {int(paid_count)} عملية")
        why = [
            "Financial Pulse يعرض مدفوعات Stripe المحصّلة — الرصيد البنكي يتطلب تسوية",
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

    def _financial_pulse(
        self,
        sr_status: dict[str, int],
        payment_summary: dict[str, float | int],
    ) -> list[MetricValue]:
        qualified = sr_status.get("qualified", 0)
        paid_count = int(payment_summary["count"])
        paid_total = float(payment_summary["total"])
        paid_total_display = f"{paid_total:,.2f} SAR" if paid_count else None
        return [
            MetricValue(
                metric_id="cash_balance",
                label_ar="الرصيد النقدي",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="payment_authority",
                context="تسوية بنكية / Stripe payouts — غير متصل بعد",
            ),
            MetricValue(
                metric_id="payments_collected_total",
                label_ar="مدفوعات محصّلة",
                value=paid_total_display,
                truth_state="LIVE" if paid_count else "NOT_AVAILABLE",
                source="stripe_payments",
                context=f"{paid_count} عملية دفع مكتملة" if paid_count else "لا مدفوعات بعد",
            ),
            MetricValue(
                metric_id="payments_collected_count",
                label_ar="عدد المدفوعات",
                value=paid_count if paid_count else None,
                truth_state="LIVE" if paid_count else "NOT_AVAILABLE",
                source="stripe_payments",
                context=f"معلّقة: {payment_summary['pending']} · فاشلة: {payment_summary['failed']}"
                if payment_summary.get("pending") or payment_summary.get("failed")
                else None,
            ),
            MetricValue(
                metric_id="payments_pending_count",
                label_ar="مدفوعات معلّقة",
                value=int(payment_summary["pending"]) if payment_summary.get("pending") else None,
                truth_state="LIVE" if payment_summary.get("pending") else "NOT_AVAILABLE",
                source="stripe_payments",
            ),
            MetricValue(
                metric_id="revenue",
                label_ar="الإيرادات المعترف بها",
                value=None,
                truth_state="NOT_AVAILABLE",
                source="commercial_authority",
                context="سياسة الاعتراف بالإيراد — خارج نطاق M1",
            ),
            MetricValue(
                metric_id="quote_pipeline",
                label_ar="مسار العروض",
                value=None,
                truth_state="LIVE",
                source="quotes",
                context="WO-018 Quote BO — draft to issued lifecycle",
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

    def _commercial_readiness(self, payment_summary: dict[str, float | int]) -> list[CommercialReadinessItem]:
        stripe_live = is_stripe_configured()
        webhook_ready = is_stripe_webhook_configured()
        checkout_ready = is_checkout_ready()

        if not stripe_live:
            payment_blocker = "STRIPE_SECRET_KEY غير مُعدّ"
        elif not webhook_ready:
            payment_blocker = "STRIPE_WEBHOOK_SECRET غير مُعدّ — الدفع قد لا يُؤكَّد تلقائياً"
        elif payment_summary["count"]:
            payment_blocker = None
        else:
            payment_blocker = "جاهز — بانتظار أول دفعة"

        return [
            CommercialReadinessItem(
                item_id="quote",
                label_ar="العروض السعرية",
                status="LIVE",
                blocker=None,
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
                status="LIVE" if checkout_ready else ("NOT_YET_OPERATIONAL" if not stripe_live else "PARTIAL"),
                blocker=payment_blocker,
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
            PlatformHealthDomain(
                domain="partner_platform",
                label_ar="منصة الشركاء B2B",
                status="healthy",
                detail_ar="إسناد، بوابة /partner، API keys، Webhooks",
            ),
            PlatformHealthDomain(
                domain="procurement_orders",
                label_ar="أوامر الشراء (مواد البناء)",
                status="healthy",
                detail_ar="ProcurementOrder authority — PO من الفاتورة الأولية",
            ),
            PlatformHealthDomain(
                domain="logistics",
                label_ar="التوصيل والشحنات",
                status="healthy",
                detail_ar="DeliveryShipment — شريك + ops + snapshot عميل",
            ),
        ]

    def _attention_items(
        self,
        sr_status: dict[str, int],
        leads: dict[str, int],
        fulfillment: dict[str, int] | None = None,
    ) -> list[AttentionItem]:
        fulfillment = fulfillment or {}
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

        pending_partner = fulfillment.get("pending_partner", 0)
        if pending_partner > 0:
            items.append(
                AttentionItem(
                    id="partner-pending-accept",
                    title_ar=f"{pending_partner} طلب(ات) بانتظار قبول الشريك",
                    why_ar="تأخر القبول يؤخر التوريد والشحن",
                    severity="ACTION" if pending_partner >= 2 else "WATCH",
                    domain="PARTNERS",
                    source="service_requests",
                    drill_down_path="/operations/service-requests?partner_assignment_status=pending_partner",
                )
            )

        awaiting_ship = fulfillment.get("shipments_awaiting_dispatch", 0)
        if awaiting_ship > 0:
            items.append(
                AttentionItem(
                    id="shipments-awaiting-dispatch",
                    title_ar=f"{awaiting_ship} شحنة(ات) بانتظار التجهيز",
                    why_ar="الشريك لم يسجّل الشحن بعد",
                    severity="WATCH",
                    domain="LOGISTICS",
                    source="delivery_shipments",
                    drill_down_path="/operations/service-requests",
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
        if kpi is None:
            kpi = next((k for k in overview.financial_pulse if k.metric_id == metric_id), None)
        truth_state = kpi.truth_state if kpi else "UNKNOWN"
        limitations: list[str] = []
        if truth_state in {"NOT_AVAILABLE", "BLOCKED", "NOT_YET_OPERATIONAL"}:
            limitations.append(f"Metric truth_state={truth_state}")

        contributing_record_count = None
        data_quality = None
        if kpi is not None and kpi.value is not None and truth_state == "LIVE":
            if isinstance(kpi.value, (int, float)) or (
                isinstance(kpi.value, str) and kpi.value.replace(",", "").replace(".", "", 1).isdigit()
            ):
                try:
                    contributing_record_count = int(float(str(kpi.value).replace(",", "").split()[0]))
                except ValueError:
                    contributing_record_count = None
            else:
                contributing_record_count = None
            data_quality = "AUTHORITATIVE_COUNT" if contributing_record_count is not None else "PARTIAL_OR_UNKNOWN"
        elif truth_state in {"NOT_AVAILABLE", "BLOCKED", "NOT_YET_OPERATIONAL"}:
            data_quality = "NOT_APPLICABLE"
        else:
            data_quality = "PARTIAL_OR_UNKNOWN"

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
            contributing_record_count=contributing_record_count,
            data_quality=data_quality,
            limitations=limitations,
            drill_down_path=definition.drill_down_path,
            trace_id=f"cc-evidence-{metric_id}",
        )
