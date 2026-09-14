export const JOURNEY_SECTOR_IDS = [
  'build-villa',
  'engineering-consulting',
  'contracting',
  'real-estate-valuation',
  'smart-maintenance',
  'project-management',
  'furnishing',
  'facility-management',
  'government-services',
  'real-estate-development',
  'real-estate-marketing',
  'building-materials',
  'equipment',
] as const;

export type JourneySectorId = (typeof JOURNEY_SECTOR_IDS)[number];

type SectorField =
  | 'title'
  | 'description'
  | 'startLabel'
  | 'startError'
  | 'completedMessage'
  | 'scopeConfirmLabel'
  | 'submitPreamble'
  | 'intakeCompleteMessage';

export type JourneySectorMessageKey =
  | 'journey.error.advance'
  | 'journey.error.complete'
  | `journey.sector.${JourneySectorId}.${SectorField}`
  | 'journey.sector.build-villa.advanceError';

function sectorKey(sectorId: JourneySectorId, field: SectorField | 'advanceError'): JourneySectorMessageKey {
  if (field === 'advanceError') {
    return 'journey.sector.build-villa.advanceError';
  }
  return `journey.sector.${sectorId}.${field}`;
}

const DEFAULT_SCOPE_AR = 'أؤكد أن المعلومات المقدمة صحيحة إلى أفضل علمي.';
const SUPPLY_SCOPE_AR =
  'أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذا موجز أولي وليس عرض سعر أو التزام توريد.';
const SUBMIT_PREAMBLE_AR =
  'تم تجهيز موجز جاهزية {sector}. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.';

const SECTOR_STEP_AR: Record<
  JourneySectorId,
  Pick<Record<SectorField, string>, 'scopeConfirmLabel' | 'submitPreamble' | 'intakeCompleteMessage'>
> = {
  'build-villa': {
    scopeConfirmLabel: 'أؤكد أن المعلومات والموجز الأولي صحيحة ضمن نطاق الاستكشاف.',
    submitPreamble: '',
    intakeCompleteMessage: '',
  },
  'engineering-consulting': {
    scopeConfirmLabel:
      'أؤكد أن المعلومات والموجز الأولي صحيحة ضمن نطاق الاستكشاف، وأرغب في إرسال طلب الاستشارة.',
    submitPreamble: '',
    intakeCompleteMessage: '',
  },
  contracting: {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'المقاولات'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية المقاولات.',
  },
  'real-estate-valuation': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'التقييم العقاري'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية التقييم العقاري.',
  },
  'smart-maintenance': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'الصيانة الذكية'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية الصيانة الذكية.',
  },
  'project-management': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'إدارة المشروع'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية إدارة المشروع.',
  },
  furnishing: {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'التأثيث'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية التأثيث.',
  },
  'facility-management': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'إدارة المرافق'),
    intakeCompleteMessage: 'تم إكمال رحلة جاهزية إدارة المرافق.',
  },
  'government-services': {
    scopeConfirmLabel:
      'أؤكد أن المعلومات المقدّمة دقيقة على قدر علمي — هذه خارطة أولية وليست استنتاجاً نظامياً.',
    submitPreamble: '',
    intakeCompleteMessage: 'اكتملت خطوات الاستلام.',
  },
  'real-estate-development': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'التطوير العقاري'),
    intakeCompleteMessage: 'تم إكمال رحلة التطوير العقاري.',
  },
  'real-estate-marketing': {
    scopeConfirmLabel: DEFAULT_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'التسويق العقاري'),
    intakeCompleteMessage: 'تم إكمال رحلة التسويق العقاري.',
  },
  'building-materials': {
    scopeConfirmLabel: SUPPLY_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'توريد مواد البناء'),
    intakeCompleteMessage: 'تم إكمال رحلة مواد البناء.',
  },
  equipment: {
    scopeConfirmLabel: SUPPLY_SCOPE_AR,
    submitPreamble: SUBMIT_PREAMBLE_AR.replace('{sector}', 'المعدات والآلات'),
    intakeCompleteMessage: 'تم إكمال رحلة المعدات والآلات.',
  },
};

const DEFAULT_SCOPE_EN = 'I confirm the information provided is accurate to the best of my knowledge.';
const SUPPLY_SCOPE_EN =
  'I confirm the information is accurate to the best of my knowledge — this is a preliminary brief, not a quote or supply commitment.';
const SUBMIT_PREAMBLE_EN =
  'Your {sector} readiness brief is ready. Sign in to submit and track the request in your workspace.';

const SECTOR_STEP_EN: Record<
  JourneySectorId,
  Pick<Record<SectorField, string>, 'scopeConfirmLabel' | 'submitPreamble' | 'intakeCompleteMessage'>
> = {
  'build-villa': {
    scopeConfirmLabel: 'I confirm the information and preliminary brief are correct within the exploration scope.',
    submitPreamble: '',
    intakeCompleteMessage: '',
  },
  'engineering-consulting': {
    scopeConfirmLabel:
      'I confirm the information and preliminary brief are correct within the exploration scope, and I want to submit a consulting request.',
    submitPreamble: '',
    intakeCompleteMessage: '',
  },
  contracting: {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'contracting'),
    intakeCompleteMessage: 'Contracting readiness journey completed.',
  },
  'real-estate-valuation': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'valuation'),
    intakeCompleteMessage: 'Valuation readiness journey completed.',
  },
  'smart-maintenance': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'maintenance'),
    intakeCompleteMessage: 'Smart maintenance readiness journey completed.',
  },
  'project-management': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'project management'),
    intakeCompleteMessage: 'Project management readiness journey completed.',
  },
  furnishing: {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'furnishing'),
    intakeCompleteMessage: 'Furnishing readiness journey completed.',
  },
  'facility-management': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'facility management'),
    intakeCompleteMessage: 'Facility management readiness journey completed.',
  },
  'government-services': {
    scopeConfirmLabel:
      'I confirm the information is accurate to the best of my knowledge — this is an initial roadmap, not a system determination.',
    submitPreamble: '',
    intakeCompleteMessage: 'Intake steps completed.',
  },
  'real-estate-development': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'real estate development'),
    intakeCompleteMessage: 'Real estate development journey completed.',
  },
  'real-estate-marketing': {
    scopeConfirmLabel: DEFAULT_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'real estate marketing'),
    intakeCompleteMessage: 'Real estate marketing journey completed.',
  },
  'building-materials': {
    scopeConfirmLabel: SUPPLY_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'building materials supply'),
    intakeCompleteMessage: 'Building materials journey completed.',
  },
  equipment: {
    scopeConfirmLabel: SUPPLY_SCOPE_EN,
    submitPreamble: SUBMIT_PREAMBLE_EN.replace('{sector}', 'equipment'),
    intakeCompleteMessage: 'Equipment journey completed.',
  },
};

const SECTOR_AR: Record<JourneySectorId, Record<SectorField, string>> = {
  'build-villa': {
    title: 'بناء الفيلا',
    description: 'رحلة استكشافية لجمع معلومات مشروعك قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة بناء الفيلا',
    startError: 'تعذر بدء الرحلة. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إكمال رحلة جمع المعلومات بنجاح.',
  },
  'engineering-consulting': {
    title: 'الاستشارات الهندسية',
    description: 'من الفهم الأولي إلى موجز هندسي أولي — ثم طلب استشارة مهنية.',
    startLabel: 'ابدأ الاستشارة الهندسية',
    startError: 'تعذر بدء رحلة الاستشارة. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب الاستشارة بنجاح.',
  },
  contracting: {
    title: 'المقاولات والتشييد',
    description: 'رحلة جاهزية المقاولات — من فهم المشروع إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية المقاولات',
    startError: 'تعذر بدء رحلة المقاولات. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب المقاولات بنجاح.',
  },
  'real-estate-valuation': {
    title: 'التقييم العقاري',
    description: 'رحلة جاهزية التقييم — من فهم الأصل إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية التقييم العقاري',
    startError: 'تعذر بدء رحلة التقييم العقاري. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب التقييم العقاري بنجاح.',
  },
  'smart-maintenance': {
    title: 'التشغيل والصيانة الذكية',
    description: 'رحلة جاهزية الصيانة — من فهم المشكلة إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية الصيانة الذكية',
    startError: 'تعذر بدء رحلة الصيانة الذكية. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب الصيانة بنجاح.',
  },
  'project-management': {
    title: 'إدارة المشاريع',
    description: 'رحلة جاهزية إدارة المشروع — من فهم الوضع الحالي إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية إدارة المشروع',
    startError: 'تعذر بدء رحلة إدارة المشروع. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب إدارة المشروع بنجاح.',
  },
  furnishing: {
    title: 'التأثيث والتجهيز',
    description: 'رحلة جاهزية التأثيث — من فهم المساحة والاحتياجات إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية التأثيث',
    startError: 'تعذر بدء رحلة التأثيث. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب التأثيث بنجاح.',
  },
  'facility-management': {
    title: 'إدارة المرافق',
    description:
      'رحلة جاهزية إدارة المرافق — من فهم المنشأة والتحديات التشغيلية إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة جاهزية إدارة المرافق',
    startError: 'تعذر بدء رحلة إدارة المرافق. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب إدارة المرافق بنجاح.',
  },
  'government-services': {
    title: 'الخدمات الحكومية',
    description: 'رحلة الخدمات الحكومية — من تحديد نوع الخدمة إلى خارطة مهام أولية قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة الخدمات الحكومية',
    startError: 'تعذر بدء رحلة الخدمات الحكومية. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب الخدمة الحكومية للمراجعة المهنية.',
  },
  'real-estate-development': {
    title: 'التطوير العقاري',
    description:
      'رحلة فرصة التطوير العقاري — من فهم سياق الأصل والهدف التطويري إلى لقطة أولية قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة التطوير العقاري',
    startError: 'تعذر بدء رحلة التطوير العقاري. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب التطوير العقاري بنجاح.',
  },
  'real-estate-marketing': {
    title: 'التسويق العقاري',
    description:
      'رحلة جاهزية التسويق العقاري — من فهم الهدف التسويقي والجمهور إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة التسويق العقاري',
    startError: 'تعذر بدء رحلة التسويق العقاري. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب التسويق العقاري بنجاح.',
  },
  'building-materials': {
    title: 'مواد البناء',
    description:
      'رحلة جاهزية توريد مواد البناء — من فهم احتياج التوريد والمواصفات إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة مواد البناء',
    startError: 'تعذر بدء رحلة مواد البناء. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب مواد البناء بنجاح.',
  },
  equipment: {
    title: 'المعدات والآلات',
    description:
      'رحلة جاهزية المعدات والآلات — من فهم احتياج التشغيل والمواصفات إلى موجز أولي قبل المراجعة المهنية.',
    startLabel: 'ابدأ رحلة المعدات والآلات',
    startError: 'تعذر بدء رحلة المعدات والآلات. يرجى المحاولة مرة أخرى.',
    completedMessage: 'تم إرسال طلب المعدات والآلات بنجاح.',
  },
};

const SECTOR_EN: Record<JourneySectorId, Record<SectorField, string>> = {
  'build-villa': {
    title: 'Build a villa',
    description: 'An exploratory journey to capture your project details before professional review.',
    startLabel: 'Start villa build journey',
    startError: 'Could not start the journey. Please try again.',
    completedMessage: 'Your intake journey was completed successfully.',
  },
  'engineering-consulting': {
    title: 'Engineering consulting',
    description: 'From initial understanding to a preliminary engineering brief — then a professional request.',
    startLabel: 'Start engineering consultation',
    startError: 'Could not start the consultation journey. Please try again.',
    completedMessage: 'Your consulting request was submitted successfully.',
  },
  contracting: {
    title: 'Contracting & construction',
    description: 'Contracting readiness — from project understanding to a preliminary brief before review.',
    startLabel: 'Start contracting readiness journey',
    startError: 'Could not start the contracting journey. Please try again.',
    completedMessage: 'Your contracting request was submitted successfully.',
  },
  'real-estate-valuation': {
    title: 'Real estate valuation',
    description: 'Valuation readiness — from asset understanding to a preliminary brief before review.',
    startLabel: 'Start valuation readiness journey',
    startError: 'Could not start the valuation journey. Please try again.',
    completedMessage: 'Your valuation request was submitted successfully.',
  },
  'smart-maintenance': {
    title: 'Smart operations & maintenance',
    description: 'Maintenance readiness — from issue understanding to a preliminary brief before review.',
    startLabel: 'Start smart maintenance readiness journey',
    startError: 'Could not start the maintenance journey. Please try again.',
    completedMessage: 'Your maintenance request was submitted successfully.',
  },
  'project-management': {
    title: 'Project management',
    description: 'Project management readiness — from current state to a preliminary brief before review.',
    startLabel: 'Start project management readiness journey',
    startError: 'Could not start the project management journey. Please try again.',
    completedMessage: 'Your project management request was submitted successfully.',
  },
  furnishing: {
    title: 'Furnishing & fit-out',
    description: 'Furnishing readiness — from space and needs to a preliminary brief before review.',
    startLabel: 'Start furnishing readiness journey',
    startError: 'Could not start the furnishing journey. Please try again.',
    completedMessage: 'Your furnishing request was submitted successfully.',
  },
  'facility-management': {
    title: 'Facility management',
    description: 'Facility readiness — from asset context to a preliminary brief before review.',
    startLabel: 'Start facility management readiness journey',
    startError: 'Could not start the facility management journey. Please try again.',
    completedMessage: 'Your facility management request was submitted successfully.',
  },
  'government-services': {
    title: 'Government services',
    description: 'Government services — from service type to an initial task roadmap before review.',
    startLabel: 'Start government services journey',
    startError: 'Could not start the government services journey. Please try again.',
    completedMessage: 'Your government services request was sent for professional review.',
  },
  'real-estate-development': {
    title: 'Real estate development',
    description: 'Development opportunity — from asset context to an initial snapshot before review.',
    startLabel: 'Start real estate development journey',
    startError: 'Could not start the development journey. Please try again.',
    completedMessage: 'Your development request was submitted successfully.',
  },
  'real-estate-marketing': {
    title: 'Real estate marketing',
    description: 'Marketing readiness — from goals and audience to a preliminary brief before review.',
    startLabel: 'Start real estate marketing journey',
    startError: 'Could not start the marketing journey. Please try again.',
    completedMessage: 'Your marketing request was submitted successfully.',
  },
  'building-materials': {
    title: 'Building materials',
    description: 'Materials readiness — from supply needs to a preliminary brief before review.',
    startLabel: 'Start building materials journey',
    startError: 'Could not start the building materials journey. Please try again.',
    completedMessage: 'Your building materials request was submitted successfully.',
  },
  equipment: {
    title: 'Equipment & machinery',
    description: 'Equipment readiness — from operational needs to a preliminary brief before review.',
    startLabel: 'Start equipment journey',
    startError: 'Could not start the equipment journey. Please try again.',
    completedMessage: 'Your equipment request was submitted successfully.',
  },
};

function flattenSectorMessages(
  sectors: Record<JourneySectorId, Record<SectorField, string>>,
  stepCopy: Record<
    JourneySectorId,
    Pick<Record<SectorField, string>, 'scopeConfirmLabel' | 'submitPreamble' | 'intakeCompleteMessage'>
  >,
): Record<JourneySectorMessageKey, string> {
  const out = {} as Record<JourneySectorMessageKey, string>;
  for (const sectorId of JOURNEY_SECTOR_IDS) {
    for (const field of [
      'title',
      'description',
      'startLabel',
      'startError',
      'completedMessage',
      'scopeConfirmLabel',
      'submitPreamble',
      'intakeCompleteMessage',
    ] as const) {
      if (field in sectors[sectorId]) {
        out[sectorKey(sectorId, field)] = sectors[sectorId][field as SectorField];
      } else {
        out[sectorKey(sectorId, field)] = stepCopy[sectorId][field];
      }
    }
  }
  out['journey.sector.build-villa.advanceError'] =
    'تعذر إرسال هذه الخطوة. يرجى مراجعة البيانات.';
  return out;
}

export const JOURNEY_SECTOR_MESSAGES_AR: Record<JourneySectorMessageKey, string> = {
  'journey.error.advance': 'تعذر إرسال هذه الخطوة.',
  'journey.error.complete': 'تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.',
  ...flattenSectorMessages(SECTOR_AR, SECTOR_STEP_AR),
};

export const JOURNEY_SECTOR_MESSAGES_EN: Record<JourneySectorMessageKey, string> = {
  'journey.error.advance': 'Could not submit this step.',
  'journey.error.complete': 'Could not complete the journey. Please try again.',
  ...flattenSectorMessages(SECTOR_EN, SECTOR_STEP_EN),
  'journey.sector.build-villa.advanceError': 'Could not submit this step. Please review your inputs.',
};

export function journeySectorMessageKey(
  sectorId: JourneySectorId,
  field: SectorField | 'advanceError',
): JourneySectorMessageKey {
  return sectorKey(sectorId, field);
}
