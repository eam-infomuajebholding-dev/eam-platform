export const STEP_ORDER = [
  'maintenance_category',
  'asset_location',
  'issue_description',
  'severity_level',
  'access_readiness',
  'system_context',
  'prior_service_context',
  'engagement_goal',
  'timeline_context',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  maintenance_category: 'نوع الصيانة',
  asset_location: 'موقع الأصل',
  issue_description: 'وصف المشكلة',
  severity_level: 'درجة الأولوية',
  access_readiness: 'جاهزية الوصول',
  system_context: 'سياق النظام',
  prior_service_context: 'سياق الصيانة السابقة',
  engagement_goal: 'هدف الخدمة',
  timeline_context: 'الجدول الزمني',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const MAINTENANCE_CATEGORY_OPTIONS = [
  { value: 'hvac', label: 'تكييف / HVAC' },
  { value: 'electrical', label: 'كهرباء' },
  { value: 'plumbing', label: 'سباكة' },
  { value: 'building', label: 'صيانة مبنى' },
  { value: 'elevator', label: 'مصاعد' },
  { value: 'fire_safety', label: 'سلامة / إطفاء' },
  { value: 'general', label: 'صيانة عامة' },
  { value: 'other', label: 'أخرى' },
];

export const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'حرج / طارئ' },
  { value: 'high', label: 'عالي' },
  { value: 'moderate', label: 'متوسط' },
  { value: 'low', label: 'منخفض' },
];

export const ACCESS_OPTIONS = [
  { value: 'accessible', label: 'يمكن الوصول' },
  { value: 'restricted', label: 'وصول مقيد' },
  { value: 'tenant_occupied', label: 'مشغول بمستأجر' },
  { value: 'after_hours_only', label: 'خارج أوقات العمل فقط' },
  { value: 'unknown', label: 'غير محدد' },
];

export const ENGAGEMENT_GOAL_OPTIONS = [
  { value: 'emergency_response', label: 'استجابة طارئة' },
  { value: 'corrective_repair', label: 'إصلاح تصحيحي' },
  { value: 'preventive_plan', label: 'خطة صيانة وقائية' },
  { value: 'readiness_review', label: 'مراجعة جاهزية' },
  { value: 'contract_review', label: 'مراجعة عقد صيانة' },
  { value: 'other', label: 'أخرى' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
