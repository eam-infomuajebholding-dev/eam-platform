export const STEP_ORDER = [
  'facility_type',
  'asset_location',
  'facility_scope',
  'operational_challenge',
  'service_maturity',
  'engagement_goal',
  'timeline_context',
  'readiness_context',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  facility_type: 'نوع المنشأة',
  asset_location: 'موقع الأصل',
  facility_scope: 'نطاق المرافق',
  operational_challenge: 'التحدي التشغيلي',
  service_maturity: 'نضج الخدمة',
  engagement_goal: 'هدف التعاقد',
  timeline_context: 'الجدول الزمني',
  readiness_context: 'الجاهزية الحالية',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const FACILITY_TYPE_OPTIONS = [
  { value: 'commercial', label: 'تجاري' },
  { value: 'residential', label: 'سكني' },
  { value: 'mixed_use', label: 'استخدام مختلط' },
  { value: 'industrial', label: 'صناعي' },
  { value: 'hospitality', label: 'ضيافة / فندقي' },
  { value: 'other', label: 'أخرى' },
];

export const FACILITY_SCOPE_OPTIONS = [
  { value: 'full_building', label: 'مبنى كامل' },
  { value: 'floor', label: 'طابق' },
  { value: 'unit', label: 'وحدة' },
  { value: 'campus', label: 'مجمع / campus' },
  { value: 'portfolio', label: 'محفظة أصول' },
  { value: 'other', label: 'أخرى' },
];

export const OPERATIONAL_CHALLENGE_OPTIONS = [
  { value: 'operations_efficiency', label: 'كفاءة التشغيل' },
  { value: 'compliance', label: 'الامتثال' },
  { value: 'cost_control', label: 'ضبط التكلفة' },
  { value: 'tenant_experience', label: 'تجربة المستأجر' },
  { value: 'sustainability', label: 'الاستدامة' },
  { value: 'safety', label: 'السلامة' },
  { value: 'transition', label: 'انتقال / تحول' },
  { value: 'other', label: 'أخرى' },
];

export const SERVICE_MATURITY_OPTIONS = [
  { value: 'reactive', label: 'تفاعلي' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'planned', label: 'مخطط' },
  { value: 'optimized', label: 'محسّن' },
  { value: 'unknown', label: 'غير محدد' },
];

export const ENGAGEMENT_GOAL_OPTIONS = [
  { value: 'readiness_review', label: 'مراجعة جاهزية' },
  { value: 'operations_setup', label: 'إعداد التشغيل' },
  { value: 'contract_review', label: 'مراجعة العقد' },
  { value: 'transition_support', label: 'دعم الانتقال' },
  { value: 'compliance_audit', label: 'تدقيق امتثال' },
  { value: 'cost_optimization', label: 'تحسين التكلفة' },
  { value: 'other', label: 'أخرى' },
];

export const URGENCY_OPTIONS = [
  { value: 'standard', label: 'عادي' },
  { value: 'soon', label: 'قريباً' },
  { value: 'urgent', label: 'عاجل' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
