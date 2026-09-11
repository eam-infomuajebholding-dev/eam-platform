export const STEP_ORDER = [
  'project_context',
  'project_location',
  'design_readiness',
  'boq_readiness',
  'site_readiness',
  'scope_type',
  'procurement_goal',
  'timeline_context',
  'budget_context',
  'contractor_requirements',
  'documents_context',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  project_context: 'سياق المشروع',
  project_location: 'موقع المشروع',
  design_readiness: 'جاهزية التصميم',
  boq_readiness: 'جاهزية BOQ',
  site_readiness: 'جاهزية الموقع',
  scope_type: 'نوع النطاق',
  procurement_goal: 'هدف الشراء/التنفيذ',
  timeline_context: 'الجدول الزمني',
  budget_context: 'سياق الميزانية',
  contractor_requirements: 'متطلبات المقاول',
  documents_context: 'المستندات المتاحة',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const PROJECT_TYPE_OPTIONS = [
  { value: 'new_build', label: 'بناء جديد' },
  { value: 'renovation', label: 'ترميم' },
  { value: 'fit_out', label: 'تشطيب / Fit-out' },
  { value: 'other', label: 'أخرى' },
];

export const STAGE_OPTIONS = [
  { value: 'concept', label: 'فكرة' },
  { value: 'planning', label: 'تخطيط' },
  { value: 'design', label: 'تصميم' },
  { value: 'execution', label: 'تنفيذ' },
  { value: 'other', label: 'أخرى' },
];

export const DESIGN_READINESS_OPTIONS = [
  { value: 'concept_only', label: 'فكرة فقط' },
  { value: 'architectural', label: 'مخططات معمارية' },
  { value: 'approved_design', label: 'تصميم معتمد' },
  { value: 'working_drawings', label: 'مخططات تنفيذية' },
  { value: 'unknown', label: 'غير محدد' },
];

export const BOQ_READINESS_OPTIONS = [
  { value: 'available', label: 'BOQ متوفر' },
  { value: 'partial', label: 'جزئي' },
  { value: 'not_available', label: 'غير متوفر' },
  { value: 'not_sure', label: 'غير متأكد' },
];

export const SITE_READINESS_OPTIONS = [
  { value: 'accessible', label: 'الموقع جاهز/متاح' },
  { value: 'existing_structure', label: 'يوجد مبنى قائم' },
  { value: 'needs_demolition', label: 'يتطلب هدم/تجهيز' },
  { value: 'not_ready', label: 'غير جاهز' },
  { value: 'unknown', label: 'غير محدد' },
];

export const SCOPE_TYPE_OPTIONS = [
  { value: 'general_contracting', label: 'مقاول عام' },
  { value: 'structural', label: 'أعمال إنشائية' },
  { value: 'finishing', label: 'تشطيبات' },
  { value: 'mep', label: 'MEP' },
  { value: 'renovation', label: 'ترميم' },
  { value: 'fit_out', label: 'Fit-out' },
  { value: 'specific_package', label: 'حزمة محددة' },
  { value: 'other', label: 'أخرى' },
];

export const PROCUREMENT_GOAL_OPTIONS = [
  { value: 'readiness_review', label: 'مراجعة جاهزية' },
  { value: 'scope_preparation', label: 'إعداد النطاق' },
  { value: 'contractor_sourcing', label: 'البحث عن مقاول' },
  { value: 'bid_comparison', label: 'مقارنة عروض' },
  { value: 'execution_management', label: 'إدارة تنفيذ' },
  { value: 'other', label: 'أخرى' },
];

export const BUDGET_OPTIONS = [
  { value: 'under_500k', label: 'أقل من 500 ألف' },
  { value: '500k_1m', label: '500 ألف – 1 مليون' },
  { value: '1m_3m', label: '1 – 3 مليون' },
  { value: '3m_5m', label: '3 – 5 مليون' },
  { value: 'over_5m', label: 'أكثر من 5 مليون' },
  { value: 'undecided', label: 'غير محدد بعد' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
