export const STEP_ORDER = [
  'materials_intake',
  'requester_identity',
  'phone_verification',
  'delivery_location',
  'procurement_invoice',
  'invoice_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  materials_intake: 'قائمة المواد',
  requester_identity: 'بيانات الطالب',
  phone_verification: 'تأكيد الجوال',
  delivery_location: 'موقع التوصيل',
  procurement_invoice: 'الفاتورة',
  invoice_confirm: 'تأكيد الفاتورة',
  intake_complete: 'الدفع والإرسال',
};

/** Legacy intake (v1) — used in operations snapshot labels for older requests. */
export const PROCUREMENT_GOAL_OPTIONS = [
  { value: 'project_supply', label: 'توريد لمشروع' },
  { value: 'maintenance_supply', label: 'توريد صيانة/تشغيل' },
  { value: 'bulk_order', label: 'طلب كميات' },
  { value: 'specification_review', label: 'مراجعة مواصفات أولية' },
  { value: 'other', label: 'هدف آخر' },
];

export const MATERIAL_CATEGORY_OPTIONS = [
  { value: 'structural', label: 'هيكلية' },
  { value: 'finishing', label: 'تشطيب' },
  { value: 'mep', label: 'MEP' },
  { value: 'insulation', label: 'عزل' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'other', label: 'أخرى' },
];

export const QUANTITY_SCOPE_OPTIONS = [
  { value: 'small_batch', label: 'دفعة صغيرة' },
  { value: 'medium', label: 'متوسط' },
  { value: 'large', label: 'كميات كبيرة' },
  { value: 'unknown', label: 'غير محدد' },
];
