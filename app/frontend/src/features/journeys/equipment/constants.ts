export const STEP_ORDER = [
  'equipment_need',
  'equipment_category',
  'usage_context',
  'location',
  'engagement_type',
  'specifications_context',
  'timeline_context',
  'budget_context',
  'readiness_context',
  'summary_review',
  'equipment_readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  equipment_need: 'حاجة المعدات',
  equipment_category: 'فئة المعدات',
  usage_context: 'سياق الاستخدام',
  location: 'الموقع',
  engagement_type: 'نوع التعاقد',
  specifications_context: 'المواصفات',
  timeline_context: 'الجدول الزمني',
  budget_context: 'سياق الميزانية',
  readiness_context: 'سياق الجاهزية',
  summary_review: 'مراجعة الملخص',
  equipment_readiness_brief: 'موجز جاهزية المعدات',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const EQUIPMENT_NEED_OPTIONS = [
  { value: 'purchase', label: 'شراء معدات' },
  { value: 'rental', label: 'استئجار معدات' },
  { value: 'maintenance_support', label: 'دعم/صيانة معدات' },
  { value: 'specification_review', label: 'مراجعة مواصفات أولية' },
  { value: 'other', label: 'حاجة أخرى' },
];

export const EQUIPMENT_CATEGORY_OPTIONS = [
  { value: 'heavy_machinery', label: 'آلات ثقيلة' },
  { value: 'lifting', label: 'رفع وتحميل' },
  { value: 'power_tools', label: 'أدوات كهربائية' },
  { value: 'vehicles', label: 'مركبات' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'other', label: 'أخرى' },
];

export const ENGAGEMENT_TYPE_OPTIONS = [
  { value: 'buy', label: 'شراء' },
  { value: 'rent', label: 'إيجار' },
  { value: 'lease', label: 'تأجير طويل' },
  { value: 'service_only', label: 'خدمة فقط' },
  { value: 'unknown', label: 'غير محدد' },
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
