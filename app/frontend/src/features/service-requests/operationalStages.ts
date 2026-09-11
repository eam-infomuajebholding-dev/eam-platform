export type OperationalStageKey =
  | 'REQUEST_RECEIVED'
  | 'PROFESSIONAL_REVIEW'
  | 'AWAITING_INFORMATION'
  | 'QUALIFIED'
  | 'SCOPE_PREPARATION'
  | 'UNKNOWN';

export interface OperationalStage {
  key: OperationalStageKey;
  label: string;
  description: string;
}

const STAGE_BY_STATUS: Record<string, OperationalStage> = {
  submitted: {
    key: 'REQUEST_RECEIVED',
    label: 'استلام الطلب',
    description: 'تم استلام طلبك وسيتم مراجعته من الفريق المختص.',
  },
  under_review: {
    key: 'PROFESSIONAL_REVIEW',
    label: 'مراجعة مهنية',
    description: 'يقوم فريق EAM بمراجعة المعلومات الأولية وتحديد الخطوة التالية.',
  },
  awaiting_information: {
    key: 'AWAITING_INFORMATION',
    label: 'مطلوب معلومات إضافية',
    description: 'EAM يحتاج معلومات إضافية منك لمتابعة مراجعة الطلب.',
  },
  qualified: {
    key: 'QUALIFIED',
    label: 'تم تأهيل الطلب',
    description: 'تمت المراجعة الأولية وتأهيل الطلب. سيتم إعداد الخطوة التجارية التالية عند الجاهزية.',
  },
};

export function resolveOperationalStage(status: string): OperationalStage {
  return STAGE_BY_STATUS[status] ?? {
    key: 'UNKNOWN',
    label: status,
    description: 'سيتم تحديث حالة الطلب عند توفر معلومات إضافية.',
  };
}

export const JOURNEY_TYPE_LABELS: Record<string, string> = {
  build_villa: 'بناء فيلا',
  engineering_consulting: 'استشارة هندسية',
  contracting: 'جاهزية المقاولات',
  real_estate_valuation: 'التقييم العقاري',
  smart_maintenance: 'الصيانة الذكية',
  project_management: 'إدارة المشاريع',
  furnishing: 'التأثيث والتجهيز',
  facility_management: 'إدارة المرافق',
  government_services: 'الخدمات الحكومية',
  real_estate_development: 'التطوير العقاري',
  real_estate_marketing: 'التسويق العقاري',
};
