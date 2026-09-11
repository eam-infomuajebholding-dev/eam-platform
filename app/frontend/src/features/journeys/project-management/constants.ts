export const STEP_ORDER = [
  'project_type',
  'project_stage',
  'project_context',
  'scope_clarity',
  'timeline_context',
  'budget_context',
  'challenges_context',
  'stakeholder_context',
  'engagement_goal',
  'summary_review',
  'readiness_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  project_type: 'نوع المشروع',
  project_stage: 'مرحلة المشروع',
  project_context: 'سياق المشروع',
  scope_clarity: 'وضوح النطاق',
  timeline_context: 'الجدول الزمني',
  budget_context: 'إطار الميزانية',
  challenges_context: 'التحديات',
  stakeholder_context: 'أصحاب المصلحة',
  engagement_goal: 'هدف الخدمة',
  summary_review: 'مراجعة الملخص',
  readiness_brief: 'موجز الجاهزية',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const PROJECT_TYPE_OPTIONS = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed_use', label: 'متعدد الاستخدام' },
  { value: 'infrastructure', label: 'بنية تحتية' },
  { value: 'renovation', label: 'تجديد / ترميم' },
  { value: 'other', label: 'أخرى' },
];

export const PROJECT_STAGE_OPTIONS = [
  { value: 'concept', label: 'فكرة / مفهوم' },
  { value: 'planning', label: 'تخطيط' },
  { value: 'design', label: 'تصميم' },
  { value: 'procurement', label: 'مشتريات' },
  { value: 'execution', label: 'تنفيذ' },
  { value: 'delayed', label: 'متعثر / متأخر' },
  { value: 'closeout', label: 'إغلاق / تسليم' },
  { value: 'other', label: 'أخرى' },
];

export const SCOPE_CLARITY_OPTIONS = [
  { value: 'clear', label: 'واضح' },
  { value: 'partial', label: 'جزئي' },
  { value: 'unclear', label: 'غير واضح' },
  { value: 'evolving', label: 'متغير / قيد التطور' },
];

export const BUDGET_STATE_OPTIONS = [
  { value: 'not_defined', label: 'غير محدد' },
  { value: 'rough_estimate', label: 'تقدير تقريبي' },
  { value: 'approved_budget', label: 'ميزانية معتمدة' },
  { value: 'constrained', label: 'مقيّد' },
  { value: 'confidential', label: 'سري / غير قابل للمشاركة' },
];

export const ENGAGEMENT_GOAL_OPTIONS = [
  { value: 'pm_setup', label: 'إعداد خط أساس إداري' },
  { value: 'recovery_plan', label: 'خطة تعافي / إنقاذ' },
  { value: 'governance_review', label: 'مراجعة حوكمة' },
  { value: 'schedule_review', label: 'مراجعة جدول' },
  { value: 'stakeholder_alignment', label: 'مواءمة أصحاب المصلحة' },
  { value: 'execution_support', label: 'دعم تنفيذ' },
  { value: 'other', label: 'أخرى' },
];

export function getStepNumber(stepKey: string): number {
  const index = STEP_ORDER.indexOf(stepKey as (typeof STEP_ORDER)[number]);
  return index >= 0 ? index + 1 : 0;
}

export function getTotalSteps(): number {
  return STEP_ORDER.length - 1;
}
