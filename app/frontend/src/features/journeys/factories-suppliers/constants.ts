export const STEP_ORDER = [
  'supplier_role',
  'product_category',
  'supply_coverage',
  'quality_standards',
  'partnership_intent',
  'timeline_context',
  'readiness_context',
  'summary_review',
  'supplier_readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  supplier_role: 'دور المورد',
  product_category: 'فئة المنتج',
  supply_coverage: 'نطاق التوريد',
  quality_standards: 'معايير الجودة',
  partnership_intent: 'نية الشراكة',
  timeline_context: 'الجدول',
  readiness_context: 'الجاهزية',
  summary_review: 'مراجعة',
  supplier_readiness_brief: 'موجز المورد',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال',
};

export const SUPPLIER_ROLE_OPTIONS = [
  { value: 'manufacturer', label: 'مصنع' },
  { value: 'distributor', label: 'موزّع' },
  { value: 'trader', label: 'تاجر' },
  { value: 'contractor_supply', label: 'توريد مقاولات' },
  { value: 'other', label: 'أخرى' },
];

export const QUALITY_OPTIONS = [
  { value: 'certified', label: 'معتمد' },
  { value: 'in_progress', label: 'قيد الاعتماد' },
  { value: 'unknown', label: 'غير معروف' },
  { value: 'not_required', label: 'غير مطلوب' },
];

export const PARTNERSHIP_OPTIONS = [
  { value: 'supply_agreement', label: 'اتفاق توريد' },
  { value: 'catalog_onboarding', label: 'إدراج كatalog' },
  { value: 'project_supply', label: 'توريد مشروع' },
  { value: 'exploratory', label: 'استكشافي' },
  { value: 'other', label: 'أخرى' },
];
