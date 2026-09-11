export const STEP_ORDER = [
  'procurement_goal',
  'material_category',
  'project_context',
  'delivery_location',
  'quantity_scope',
  'specifications_context',
  'timeline_context',
  'budget_context',
  'supplier_context',
  'summary_review',
  'procurement_readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  procurement_goal: 'هدف التوريد',
  material_category: 'فئة المواد',
  project_context: 'سياق المشروع',
  delivery_location: 'موقع التسليم',
  quantity_scope: 'نطاق الكميات',
  specifications_context: 'المواصفات',
  timeline_context: 'الجدول الزمني',
  budget_context: 'سياق الميزانية',
  supplier_context: 'سياق المورد',
  summary_review: 'مراجعة الملخص',
  procurement_readiness_brief: 'موجز جاهزية التوريد',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const PROCUREMENT_GOAL_OPTIONS = [
  { value: 'project_supply', label: 'توريد لمشروع' },
  { value: 'maintenance_supply', label: 'توريد صيانة/تشغيل' },
  { value: 'bulk_order', label: 'طلب كميات' },
  { value: 'specification_review', label: 'مراجعة مواصفات أولية' },
  { value: 'other', label: 'هدف آخر' },
];

export const MATERIAL_CATEGORY_OPTIONS = [
  { value: 'structural', label: 'هيكلية' },
  { value: 'finishing', label: 'تشطيب' },
  { value: 'mep', label: 'MEP' },
  { value: 'insulation', label: 'عزل' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'other', label: 'أخرى' },
];

export const QUANTITY_SCOPE_OPTIONS = [
  { value: 'small_batch', label: 'دفعة صغيرة' },
  { value: 'medium', label: 'متوسط' },
  { value: 'large', label: 'كميات كبيرة' },
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
