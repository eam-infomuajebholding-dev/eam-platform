export const STEP_ORDER = [
  'handover_context',
  'property_location',
  'project_reference',
  'issue_description',
  'documentation_state',
  'owner_objective',
  'timeline_context',
  'summary_review',
  'handover_support_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  handover_context: 'سياق التسليم',
  property_location: 'موقع العقار',
  project_reference: 'مرجع المشروع',
  issue_description: 'وصف الحالة',
  documentation_state: 'المستندات',
  owner_objective: 'هدف المالك',
  timeline_context: 'الجدول',
  summary_review: 'مراجعة',
  handover_support_brief: 'موجز الدعم',
  scope_confirm: 'تأكيد',
  submit_confirm: 'إرسال',
  intake_complete: 'اكتمال',
};

export const HANDOVER_OPTIONS = [
  { value: 'new_delivery', label: 'تسليم جديد' },
  { value: 'warranty_service', label: 'خدمة ضمان' },
  { value: 'snagging', label: 'ملاحظات/عيوب' },
  { value: 'documentation', label: 'مستندات' },
  { value: 'other', label: 'أخرى' },
];

export const DOCUMENTATION_OPTIONS = [
  { value: 'complete', label: 'مكتملة' },
  { value: 'partial', label: 'جزئية' },
  { value: 'missing', label: 'ناقصة' },
  { value: 'unknown', label: 'غير معروف' },
];

export const OWNER_OBJECTIVE_OPTIONS = [
  { value: 'handover_support', label: 'دعم تسليم' },
  { value: 'warranty_claim', label: 'مطالبة ضمان' },
  { value: 'defects_list', label: 'قائمة عيوب' },
  { value: 'owner_manual', label: 'دليل مالك' },
  { value: 'other', label: 'أخرى' },
];
