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

export const BUDGET_RANGE_OPTIONS = [
  { value: 'under_1m', label: 'أقل من 1 مليون' },
  { value: '1m_2m', label: '1 – 2 مليون' },
  { value: '2m_5m', label: '2 – 5 مليون' },
  { value: '5m_10m', label: '5 – 10 مليون' },
  { value: 'over_10m', label: 'أكثر من 10 مليون' },
  { value: 'prefer_not_say', label: 'أفضل عدم التحديد الآن' },
] as const;

export const DESIRED_START_OPTIONS = [
  { value: 'asap', label: 'في أقرب وقت' },
  { value: 'within_3_months', label: 'خلال 3 أشهر' },
  { value: 'within_6_months', label: 'خلال 6 أشهر' },
  { value: 'within_1_year', label: 'خلال سنة' },
  { value: 'flexible', label: 'مرن' },
] as const;

export const DESIGN_STYLE_OPTIONS = [
  { value: 'modern', label: 'حديث' },
  { value: 'contemporary', label: 'معاصر' },
  { value: 'classic', label: 'كلاسيكي' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'traditional_local', label: 'تقليدي/محلي' },
  { value: 'unsure', label: 'غير متأكد' },
  { value: 'need_help', label: 'أحتاج مساعدة في الاختيار' },
] as const;

export const SPACE_OPTIONS = [
  { value: 'guest_majlis', label: 'مجلس ضيوف' },
  { value: 'family_living', label: 'صالة عائلية' },
  { value: 'dining', label: 'غرفة طعام' },
  { value: 'kitchen', label: 'مطبخ' },
  { value: 'office', label: 'مكتب' },
  { value: 'parking', label: 'مواقف' },
  { value: 'garden', label: 'حديقة' },
  { value: 'roof', label: 'استخدام السطح' },
  { value: 'service_rooms', label: 'غرف خدم' },
  { value: 'special', label: 'مساحات خاصة' },
] as const;

export const STEP_LABELS: Record<string, string> = {
  project_intent: 'ما هدف مشروع الفيلا؟',
  city: 'في أي مدينة يقع المشروع؟',
  land_ownership: 'ما هي حالة الأرض؟',
  land_area: 'ما مساحة الأرض (م²)؟',
  household_needs: 'احتياجات الأسرة والاستخدام',
  space_program: 'برنامج المساحات',
  budget_context: 'نطاق الميزانية التقريبي',
  timeline_context: 'الجدول الزمني',
  design_direction: 'تفضيلات التصميم',
  documents_context: 'هل لديك مستندات أو ملاحظات إضافية؟',
  desired_service: 'ما الخدمة المطلوبة من EAM؟',
  summary_review: 'مراجعة ملخص المشروع',
  brief_review: 'الموجز الأولي للمشروع',
  scope_confirm: 'تأكيد صحة المعلومات',
  submit_confirm: 'تأكيد إرسال الطلب',
  intake_complete: 'اكتملت مرحلة جمع المعلومات',
};

export const STEP_DESCRIPTIONS: Record<string, string> = {
  project_intent: 'صف باختصار ما تريد تحقيقه من المشروع.',
  city: 'أدخل اسم المدينة (مثال: الرياض، جدة).',
  land_ownership: 'اختر الحالة الأقرب لوضع الأرض.',
  land_area: 'أدخل مساحة الأرض بالمتر المربع.',
  household_needs: 'ساعدنا على فهم احتياجات السكن والاستخدام.',
  space_program: 'ما المساحات المهمة لكم؟ (اختياري: عدد الأدوار/الغرف)',
  budget_context: 'نطاق تقريبي يساعد على تجهيز الخطوة المهنية التالية — ليس عرض سعر.',
  timeline_context: 'متى تفضل البدء؟',
  design_direction: 'تفضيلات أولية فقط — ليست تصميماً معمارياً.',
  documents_context: 'يمكنك تخطي هذه الخطوة أو إضافة ملاحظات وروابط.',
  desired_service: 'اختر نطاق الخدمة الذي تبحث عنه.',
  summary_review: 'راجع الملخص وعدّل أي قسم قبل المتابعة.',
  brief_review: 'موجز استكشافي — ليس تصميماً معمارياً أو عرضاً تعاقدياً.',
  scope_confirm: 'أؤكد أن المعلومات صحيحة ضمن نطاق الاستكشاف.',
  submit_confirm: 'أؤكد رغبتي في إرسال الطلب لمراجعة EAM المهنية.',
  intake_complete: 'تم تجميع مسودة الطلب. يمكنك إنهاء الرحلة الآن.',
};

export const STEP_ORDER = [
  'project_intent',
  'city',
  'land_ownership',
  'land_area',
  'household_needs',
  'space_program',
  'budget_context',
  'timeline_context',
  'design_direction',
  'documents_context',
  'desired_service',
  'summary_review',
  'brief_review',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const EDITABLE_STEPS = [
  'project_intent',
  'city',
  'land_ownership',
  'land_area',
  'household_needs',
  'space_program',
  'budget_context',
  'timeline_context',
  'design_direction',
  'documents_context',
  'desired_service',
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
