import type { EngineeringDiscipline, EngineeringProjectType } from './types';

export const DISCIPLINE_OPTIONS: { value: EngineeringDiscipline; label: string }[] = [
  { value: 'architectural', label: 'معماري' },
  { value: 'civil_structural', label: 'إنشائي / مدني' },
  { value: 'mechanical', label: 'ميكانيكي' },
  { value: 'electrical', label: 'كهربائي' },
  { value: 'multidisciplinary', label: 'متعدد التخصصات' },
  { value: 'other', label: 'أخرى' },
];

export const PROJECT_TYPE_OPTIONS: { value: EngineeringProjectType; label: string }[] = [
  { value: 'new_build', label: 'مشروع جديد' },
  { value: 'renovation', label: 'ترميم / تعديل' },
  { value: 'assessment', label: 'تقييم / مراجعة' },
  { value: 'feasibility', label: 'دراسة جدوى أولية' },
  { value: 'other', label: 'أخرى' },
];

export const STEP_ORDER = [
  'intent',
  'discipline',
  'qualification',
  'documents',
  'brief_review',
  'scope_confirm',
  'handoff_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  intent: 'ما الحاجة الهندسية؟',
  discipline: 'ما التخصص المطلوب؟',
  qualification: 'سياق المشروع',
  documents: 'المستندات (اختياري)',
  brief_review: 'الموجز الهندسي الأولي',
  scope_confirm: 'مراجعة النطاق قبل الإرسال',
  handoff_complete: 'تم تجهيز الطلب',
};

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
