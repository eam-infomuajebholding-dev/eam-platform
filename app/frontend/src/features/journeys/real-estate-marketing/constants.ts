export const STEP_ORDER = [
  'marketing_goal',
  'property_description',
  'property_location',
  'target_audience',
  'marketing_stage',
  'existing_assets',
  'channels_context',
  'timeline_context',
  'budget_context',
  'summary_review',
  'marketing_readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  marketing_goal: 'هدف التسويق',
  property_description: 'وصف العقار',
  property_location: 'موقع العقار',
  target_audience: 'الجمهور المستهدف',
  marketing_stage: 'مرحلة التسويق',
  existing_assets: 'الأصول التسويقية',
  channels_context: 'القنوات والاهتمامات',
  timeline_context: 'الجدول الزمني',
  budget_context: 'سياق الميزانية',
  summary_review: 'مراجعة الملخص',
  marketing_readiness_brief: 'موجز جاهزية التسويق',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const MARKETING_GOAL_OPTIONS = [
  { value: 'sell_property', label: 'بيع عقار' },
  { value: 'rent_property', label: 'تسويق للإيجار' },
  { value: 'launch_project', label: 'إطلاق/تسويق مشروع' },
  { value: 'brand_visibility', label: 'ظهور/هوية/marketing' },
  { value: 'other', label: 'هدف آخر' },
];

export const TARGET_AUDIENCE_OPTIONS = [
  { value: 'end_buyers', label: 'مشترون نهائيون' },
  { value: 'investors', label: 'مستثمرون' },
  { value: 'tenants', label: 'مستأجرون' },
  { value: 'brokers', label: 'وسطاء' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'other', label: 'أخرى' },
];

export const MARKETING_STAGE_OPTIONS = [
  { value: 'planning', label: 'تخطيط' },
  { value: 'pre_launch', label: 'ما قبل الإطلاق' },
  { value: 'active_listing', label: 'إعلان نشط' },
  { value: 'relaunch', label: 'إعادة إطلاق' },
  { value: 'unknown', label: 'غير محدد' },
];

export const EXISTING_ASSETS_OPTIONS = [
  { value: 'have_branding', label: 'لدي هوية/برanding' },
  { value: 'have_media', label: 'لدي صور/وسائط' },
  { value: 'partial', label: 'جزئي' },
  { value: 'none', label: 'لا يوجد' },
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
