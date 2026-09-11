export const STEP_ORDER = [
  'asset_context',
  'asset_location',
  'development_objective',
  'intended_use',
  'current_status',
  'constraints_context',
  'documents_readiness',
  'timeline_context',
  'summary_review',
  'opportunity_snapshot_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  asset_context: 'سياق الأصل',
  asset_location: 'موقع الأصل',
  development_objective: 'الهدف التطويري',
  intended_use: 'الاستخدام المستهدف',
  current_status: 'الحالة الحالية',
  constraints_context: 'القيود المعروفة',
  documents_readiness: 'جاهزية المستندات',
  timeline_context: 'الجدول الزمني',
  summary_review: 'مراجعة الملخص',
  opportunity_snapshot_brief: 'لقطة الفرصة الأولية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const ASSET_CONTEXT_OPTIONS = [
  { value: 'owned_land', label: 'أرض مملوكة' },
  { value: 'owned_property', label: 'عقار/مبنى مملوك' },
  { value: 'evaluating_opportunity', label: 'تقييم فرصة' },
  { value: 'partnership_interest', label: 'اهتمام بشراكة/مشروع' },
  { value: 'other', label: 'سياق آخر' },
];

export const INTENDED_USE_OPTIONS = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed_use', label: 'استخدام مختلط' },
  { value: 'hospitality', label: 'ضيافة' },
  { value: 'industrial', label: 'صناعي' },
  { value: 'other', label: 'أخرى' },
];

export const CURRENT_STATUS_OPTIONS = [
  { value: 'vacant_land', label: 'أرض خام' },
  { value: 'existing_building', label: 'مبنى قائم' },
  { value: 'partial_development', label: 'تطوير جزئي' },
  { value: 'planning_stage', label: 'مرحلة تخطيط' },
  { value: 'unknown', label: 'غير محدد' },
];

export const DOCUMENTS_READINESS_OPTIONS = [
  { value: 'have_partial', label: 'لدي بعض المستندات' },
  { value: 'none', label: 'لا توجد مستندات حالياً' },
  { value: 'unknown', label: 'غير متأكد' },
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
