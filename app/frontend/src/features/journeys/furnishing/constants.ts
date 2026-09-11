export const STEP_ORDER = [
  'space_type',
  'project_stage',
  'furnishing_goal',
  'style_direction',
  'functional_priorities',
  'room_scope',
  'budget_range',
  'timeline_context',
  'procurement_preference',
  'readiness_context',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  space_type: 'نوع المساحة',
  project_stage: 'مرحلة المشروع',
  furnishing_goal: 'هدف التأثيث',
  style_direction: 'اتجاه التصميم',
  functional_priorities: 'الأولويات الوظيفية',
  room_scope: 'نطاق الغرف',
  budget_range: 'فئة الميزانية',
  timeline_context: 'الجدول الزمني',
  procurement_preference: 'تفضيل التوريد',
  readiness_context: 'الجاهزية الحالية',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const SPACE_TYPE_OPTIONS = [
  { value: 'residential_home', label: 'منزل سكني' },
  { value: 'office', label: 'مكتب' },
  { value: 'villa', label: 'فيلا' },
  { value: 'retail', label: 'تجاري / retail' },
  { value: 'hospitality', label: 'ضيافة / فندقي' },
  { value: 'other', label: 'أخرى' },
];

export const PROJECT_STAGE_OPTIONS = [
  { value: 'new_build', label: 'بناء جديد' },
  { value: 'renovation', label: 'تجديد' },
  { value: 'occupied', label: 'مسكون' },
  { value: 'ready_to_furnish', label: 'جاهز للتأثيث' },
  { value: 'other', label: 'أخرى' },
];

export const FURNISHING_GOAL_OPTIONS = [
  { value: 'full_furnishing', label: 'تأثيث كامل' },
  { value: 'partial', label: 'تأثيث جزئي' },
  { value: 'refresh', label: 'تحديث / refresh' },
  { value: 'office_setup', label: 'تجهيز مكتب' },
  { value: 'hospitality_setup', label: 'تجهيز ضيافة' },
  { value: 'other', label: 'أخرى' },
];

export const STYLE_DIRECTION_OPTIONS = [
  { value: 'modern', label: 'عصري' },
  { value: 'classic', label: 'كلاسيكي' },
  { value: 'minimalist', label: 'بسيط / minimal' },
  { value: 'luxury', label: 'فاخر' },
  { value: 'industrial', label: 'صناعي' },
  { value: 'eclectic', label: 'متنوع' },
  { value: 'undecided', label: 'غير محدد بعد' },
];

export const BUDGET_RANGE_OPTIONS = [
  { value: 'not_defined', label: 'غير محدد' },
  { value: 'economy', label: 'اقتصادي' },
  { value: 'mid_range', label: 'متوسط' },
  { value: 'premium', label: 'مميز' },
  { value: 'luxury', label: 'فاخر' },
  { value: 'confidential', label: 'سري / غير قابل للمشاركة' },
];

export const PROCUREMENT_PREFERENCE_OPTIONS = [
  { value: 'self_sourced', label: 'توريد ذاتي' },
  { value: 'need_guidance', label: 'أحتاج إرشاداً' },
  { value: 'turnkey_preferred', label: 'تفضيل حل متكامل' },
  { value: 'undecided', label: 'غير محدد' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
