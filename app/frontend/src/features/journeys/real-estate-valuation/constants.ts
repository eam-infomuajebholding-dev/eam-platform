export const STEP_ORDER = [
  'valuation_purpose',
  'asset_type',
  'asset_location',
  'asset_description',
  'ownership_context',
  'document_readiness',
  'inspection_readiness',
  'timeline_context',
  'engagement_goal',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  valuation_purpose: 'غرض التقييم',
  asset_type: 'نوع الأصل',
  asset_location: 'موقع الأصل',
  asset_description: 'وصف الأصل',
  ownership_context: 'سياق الملكية',
  document_readiness: 'جاهزية المستندات',
  inspection_readiness: 'جاهزية المعاينة',
  timeline_context: 'الجدول الزمني',
  engagement_goal: 'هدف الخدمة',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const VALUATION_PURPOSE_OPTIONS = [
  { value: 'sale', label: 'بيع' },
  { value: 'purchase', label: 'شراء' },
  { value: 'mortgage', label: 'تمويل / رهن' },
  { value: 'legal', label: 'إجراء قانوني' },
  { value: 'inheritance', label: 'ورث / تقسيم' },
  { value: 'tax', label: 'ضريبة / زكاة' },
  { value: 'investment', label: 'استثمار' },
  { value: 'other', label: 'أخرى' },
];

export const ASSET_TYPE_OPTIONS = [
  { value: 'villa', label: 'فيلا' },
  { value: 'apartment', label: 'شقة' },
  { value: 'land', label: 'أرض' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'industrial', label: 'صناعي' },
  { value: 'mixed_use', label: 'متعدد الاستخدام' },
  { value: 'other', label: 'أخرى' },
];

export const OWNERSHIP_OPTIONS = [
  { value: 'owned', label: 'مالك' },
  { value: 'under_transaction', label: 'تحت معاملة' },
  { value: 'inherited', label: 'ورث' },
  { value: 'leased', label: 'مؤجر' },
  { value: 'other', label: 'أخرى' },
];

export const INSPECTION_OPTIONS = [
  { value: 'accessible', label: 'يمكن المعاينة' },
  { value: 'tenant_occupied', label: 'مشغول بمستأجر' },
  { value: 'remote_only', label: 'عن بُعد فقط' },
  { value: 'not_ready', label: 'غير جاهز' },
  { value: 'unknown', label: 'غير محدد' },
];

export const ENGAGEMENT_GOAL_OPTIONS = [
  { value: 'readiness_review', label: 'مراجعة جاهزية' },
  { value: 'formal_valuation', label: 'تقييم رسمي' },
  { value: 'second_opinion', label: 'رأي ثانٍ' },
  { value: 'portfolio_review', label: 'مراجعة محفظة' },
  { value: 'other', label: 'أخرى' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
