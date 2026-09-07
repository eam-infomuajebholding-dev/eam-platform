import type { DesiredService, LandOwnershipType } from './types';

export const LAND_OWNERSHIP_OPTIONS: { value: LandOwnershipType; label: string }[] = [
  { value: 'owned', label: 'أملك الأرض' },
  { value: 'leased', label: 'الأرض مؤجرة' },
  { value: 'planning_to_acquire', label: 'أخطط للشراء' },
  { value: 'other', label: 'أخرى' },
];

export const DESIRED_SERVICE_OPTIONS: { value: DesiredService; label: string }[] = [
  { value: 'design_only', label: 'تصميم فقط' },
  { value: 'supervision', label: 'إشراف' },
  { value: 'execution', label: 'تنفيذ' },
  { value: 'full_service', label: 'خدمة متكاملة' },
];

export const STEP_LABELS: Record<string, string> = {
  city: 'في أي مدينة يقع المشروع؟',
  land_ownership: 'ما هي حالة الأرض؟',
  land_area: 'ما مساحة الأرض (م²)؟',
  documents_context: 'هل لديك مستندات أو ملاحظات إضافية؟',
  desired_service: 'ما الخدمة المطلوبة؟',
  intake_complete: 'اكتملت مرحلة جمع المعلومات',
};

export const STEP_DESCRIPTIONS: Record<string, string> = {
  city: 'أدخل اسم المدينة بحرية (مثال: الرياض، جدة).',
  land_ownership: 'اختر الحالة الأقرب لوضع الأرض الحالي.',
  land_area: 'أدخل مساحة الأرض بالمتر المربع.',
  documents_context: 'يمكنك تخطي هذه الخطوة أو إضافة ملاحظات وروابط.',
  desired_service: 'اختر نطاق الخدمة الذي تبحث عنه.',
  intake_complete: 'تم تجميع مسودة الطلب الأولية. يمكنك إنهاء الرحلة الآن.',
};

export const STEP_ORDER = [
  'city',
  'land_ownership',
  'land_area',
  'documents_context',
  'desired_service',
  'intake_complete',
] as const;

export function getStepIndex(stepKey: string): number {
  return STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
}

export function getStepNumber(stepKey: string): number {
  const index = getStepIndex(stepKey);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
