import type {
  AttentionItem,
  ChangeItem,
  CommandCenterOverview,
  JourneyMetricRow,
  MetricValue,
  PlatformTrendPoint,
} from '@/features/command-center/types';

/** Agreed mock KPI row — used when API overview is unavailable (dev / open access). */
export const SHOWCASE_KPIS: MetricValue[] = [
  {
    metric_id: 'kpi.active_projects',
    label_ar: 'مشاريع نشطة',
    value: '250+',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+12%',
  },
  {
    metric_id: 'kpi.active_users',
    label_ar: 'مستخدمون نشطون',
    value: '12.5K',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+28%',
  },
  {
    metric_id: 'kpi.partners',
    label_ar: 'شركاء ومستثمرون',
    value: '120+',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+48%',
  },
  {
    metric_id: 'kpi.satisfaction',
    label_ar: 'رضا العملاء',
    value: '98%',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+5%',
  },
  {
    metric_id: 'kpi.opportunities',
    label_ar: 'فرص حالية',
    value: '45',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+22%',
  },
  {
    metric_id: 'kpi.project_value',
    label_ar: 'قيمة المشاريع',
    value: '+320M',
    truth_state: 'LIVE',
    source: 'showcase',
    context: '+15%',
  },
];

export const SHOWCASE_CHANGES: ChangeItem[] = SHOWCASE_KPIS.map((kpi) => ({
  metric_id: kpi.metric_id,
  label_ar: kpi.label_ar,
  baseline: '—',
  current: kpi.value ?? '—',
  direction: 'up',
  domain: 'showcase',
}));

export const SHOWCASE_JOURNEY_METRICS: JourneyMetricRow[] = [
  { journey_type: 'real-estate-development', label_ar: 'التطوير العقاري', classification: 'REAL_CREDENTIAL_FREE', active_count: 18, completed_count: 6, service_request_count: 24 },
  { journey_type: 'investment', label_ar: 'الاستثمار العقاري', classification: 'REAL_CREDENTIAL_FREE', active_count: 12, completed_count: 4, service_request_count: 16 },
  { journey_type: 'government-services', label_ar: 'مشاريع حكومية', classification: 'REAL_CREDENTIAL_FREE', active_count: 8, completed_count: 3, service_request_count: 11 },
  { journey_type: 'engineering-consulting', label_ar: 'استشارات هندسية', classification: 'REAL_CREDENTIAL_FREE', active_count: 10, completed_count: 5, service_request_count: 15 },
  { journey_type: 'contracting', label_ar: 'مقاولات', classification: 'REAL_CREDENTIAL_FREE', active_count: 7, completed_count: 2, service_request_count: 9 },
];

function buildTrendPoints(): PlatformTrendPoint[] {
  const base = new Date('2026-09-10T00:00:00Z');
  const volumes = [
    { sr: 42, qr: 28 },
    { sr: 48, qr: 31 },
    { sr: 51, qr: 34 },
    { sr: 55, qr: 36 },
    { sr: 58, qr: 39 },
    { sr: 62, qr: 41 },
    { sr: 66, qr: 44 },
    { sr: 70, qr: 47 },
  ];
  return volumes.map((row, index) => {
    const d = new Date(base);
    d.setDate(d.getDate() + index * 2);
    return {
      period_start: d.toISOString(),
      period_label: d.toISOString().slice(0, 10),
      service_requests: row.sr,
      qualified_requests: row.qr,
    };
  });
}

const SHOWCASE_ATTENTION: AttentionItem[] = [
  {
    id: 'showcase-1',
    title_ar: 'مستثمر جديد',
    why_ar: 'تمت إضافة مستثمر إلى المنصة',
    severity: 'FYI',
    domain: 'investment',
    source: 'showcase',
  },
  {
    id: 'showcase-2',
    title_ar: 'طلب استشارة جديد',
    why_ar: 'طلب استشارة هندسية بانتظار المراجعة',
    severity: 'ACTION',
    domain: 'operations',
    source: 'showcase',
  },
  {
    id: 'showcase-3',
    title_ar: 'تحديث حالة مشروع',
    why_ar: 'تم تحديث حالة مشروع سكني فاخر',
    severity: 'WATCH',
    domain: 'projects',
    source: 'showcase',
  },
];

export function buildShowcaseOverview(): CommandCenterOverview {
  return {
    generated_at: new Date().toISOString(),
    real_journey_count: 16,
    service_request_status_counts: {},
    service_request_journey_counts: {},
    journey_status_counts: {},
    journey_metrics: SHOWCASE_JOURNEY_METRICS,
    lead_counts: {},
    attention_items: SHOWCASE_ATTENTION,
    platform_health: [],
    commercial_readiness: [],
    executive_kpis: SHOWCASE_KPIS,
    recent_service_requests: [],
    financial_pulse: [],
    platform_trends: buildTrendPoints(),
    what_changed: SHOWCASE_CHANGES,
  };
}
