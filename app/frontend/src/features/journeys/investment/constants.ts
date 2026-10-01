export const STEP_ORDER = [
  'investor_profile',
  'interest_focus',
  'capital_horizon',
  'geography_focus',
  'risk_comfort',
  'compliance_context',
  'documents_readiness',
  'timeline_context',
  'summary_review',
  'investment_interest_brief',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export const STEP_LABELS: Record<string, string> = {
  investor_profile: 'صفة المستثمر',
  interest_focus: 'محور الاهتمام',
  capital_horizon: 'أفق رأس المال',
  geography_focus: 'التركيز الجغرافي',
  risk_comfort: 'الراحة مع المخاطر',
  compliance_context: 'الامتثال',
  documents_readiness: 'جاهزية المستندات',
  timeline_context: 'الجدول الزمني',
  summary_review: 'مراجعة الملخص',
  investment_interest_brief: 'موجز الاهتمام',
  scope_confirm: 'تأكيد النطاق',
  submit_confirm: 'تأكيد الإرسال',
  intake_complete: 'اكتمال الاستلام',
};

export const INVESTOR_PROFILE_OPTIONS = [
  { value: 'individual', label: 'فرد' },
  { value: 'company', label: 'شركة' },
  { value: 'family_office', label: 'مكتب عائلي' },
  { value: 'fund', label: 'صندوق' },
  { value: 'other', label: 'أخرى' },
];

export const INTEREST_FOCUS_OPTIONS = [
  { value: 'real_estate_development', label: 'تطوير عقاري' },
  { value: 'income_assets', label: 'أصول دخل' },
  { value: 'joint_venture', label: 'مشاركة/JV' },
  { value: 'portfolio_review', label: 'مراجعة محفظة' },
  { value: 'other', label: 'أخرى' },
];

export const CAPITAL_HORIZON_OPTIONS = [
  { value: 'short', label: 'قصير' },
  { value: 'medium', label: 'متوسط' },
  { value: 'long', label: 'طويل' },
  { value: 'undecided', label: 'غير محدد' },
];

export const RISK_COMFORT_OPTIONS = [
  { value: 'conservative', label: 'محافظ' },
  { value: 'balanced', label: 'متوازن' },
  { value: 'growth', label: 'نمو' },
  { value: 'not_sure', label: 'غير متأكد' },
];

export const DOCUMENTS_READINESS_OPTIONS = [
  { value: 'have_partial', label: 'جزئياً' },
  { value: 'none', label: 'لا يوجد' },
  { value: 'unknown', label: 'غير معروف' },
];
