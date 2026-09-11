export const STEP_ORDER = [
  'service_category',
  'property_location',
  'property_type',
  'request_summary',
  'documents_status',
  'urgency_context',
  'summary_review',
  'task_roadmap_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  service_category: 'نوع الخدمة',
  property_location: 'موقع العقار',
  property_type: 'نوع العقار',
  request_summary: 'وصف الطلب',
  documents_status: 'حالة المستندات',
  urgency_context: 'الأولوية',
  summary_review: 'مراجعة الملخص',
  task_roadmap_brief: 'خارطة المهام الأولية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const SERVICE_CATEGORY_OPTIONS = [
  { value: 'deed_update', label: 'تحديث صكوك' },
  { value: 'survey_croquis', label: 'كروكيات إرشادية/تنظيمية' },
  { value: 'building_permit', label: 'رخص بناء' },
  { value: 'subdivision_merge', label: 'فرز/دمج عقاري' },
  { value: 'demolition_renovation', label: 'رخص هدم/ترميم' },
  { value: 'violation_correction', label: 'تصحيح مخالفات' },
  { value: 'occupancy_certificate', label: 'شهادات إشغال' },
  { value: 'legacy_permit', label: 'إضافة رخص قديمة' },
  { value: 'lift_ban', label: 'رفع حضر' },
  { value: 'collective_housing', label: 'رخص سكن جماعي' },
  { value: 'building_insurance', label: 'تأمين مباني' },
  { value: 'other', label: 'أخرى' },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'administrative', label: 'إداري' },
  { value: 'land', label: 'أرض' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'other', label: 'أخرى' },
];

export const DOCUMENTS_STATUS_OPTIONS = [
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
