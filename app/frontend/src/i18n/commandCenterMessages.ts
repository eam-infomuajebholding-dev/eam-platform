/** Command Center (لوحة القيادة) copy — owner/delegate access shell. */

export type CommandCenterMessageKey =
  | 'commandCenter.title'
  | 'commandCenter.eyebrow'
  | 'commandCenter.lastUpdated'
  | 'commandCenter.refresh'
  | 'commandCenter.notifications'
  | 'commandCenter.notificationsTitle'
  | 'commandCenter.notificationsSubtitle'
  | 'commandCenter.viewDetails'
  | 'commandCenter.loadError'
  | 'commandCenter.loading'
  | 'commandCenter.hero.eyebrow'
  | 'commandCenter.hero.subtitle'
  | 'commandCenter.hero.greeting'
  | 'commandCenter.hero.greetingNamed'
  | 'commandCenter.hero.platformTagline'
  | 'commandCenter.hero.platformTaglineBody'
  | 'commandCenter.hero.weather'
  | 'commandCenter.hero.quoteTitle'
  | 'commandCenter.hero.quoteBody'
  | 'commandCenter.modules.engineeringDesign'
  | 'commandCenter.nav.main'
  | 'commandCenter.nav.internal'
  | 'commandCenter.nav.dashboard'
  | 'commandCenter.nav.review'
  | 'commandCenter.nav.delegations'
  | 'commandCenter.nav.settings'
  | 'commandCenter.nav.users'
  | 'commandCenter.nav.content'
  | 'commandCenter.nav.analytics'
  | 'commandCenter.nav.help'
  | 'commandCenter.sidebar.slogan'
  | 'commandCenter.values.aria'
  | 'commandCenter.values.trust'
  | 'commandCenter.values.customer'
  | 'commandCenter.values.innovation'
  | 'commandCenter.values.partnerships'
  | 'commandCenter.values.growth'
  | 'commandCenter.values.vision'
  | 'commandCenter.advanced.title'
  | 'commandCenter.search.shortcutHint'
  | 'commandCenter.role.owner'
  | 'commandCenter.role.projectOwner'
  | 'commandCenter.role.delegate'
  | 'commandCenter.sectors.title'
  | 'commandCenter.sectors.subtitle'
  | 'commandCenter.delegations.title'
  | 'commandCenter.delegations.subtitle'
  | 'commandCenter.delegations.emailPlaceholder'
  | 'commandCenter.delegations.notePlaceholder'
  | 'commandCenter.delegations.grant'
  | 'commandCenter.delegations.revoke'
  | 'commandCenter.delegations.error'
  | 'commandCenter.access.verifying'
  | 'commandCenter.access.deniedTitle'
  | 'commandCenter.access.deniedBody'
  | 'commandCenter.access.currentRole'
  | 'commandCenter.access.switchAccount'
  | 'commandCenter.access.goBack'
  | 'commandCenter.sections.leadership'
  | 'commandCenter.sections.attention'
  | 'commandCenter.sections.operations'
  | 'commandCenter.sections.journeys'
  | 'commandCenter.sections.finance'
  | 'commandCenter.sections.platform'
  | 'commandCenter.sections.aria'
  | 'commandCenter.leadership.title'
  | 'commandCenter.leadership.briefTitle'
  | 'commandCenter.leadership.briefFacts'
  | 'commandCenter.leadership.briefRecommendations'
  | 'commandCenter.leadership.decisionsTitle'
  | 'commandCenter.leadership.decisionsNeeded'
  | 'commandCenter.leadership.watchNext'
  | 'commandCenter.leadership.scorecard'
  | 'commandCenter.leadership.operatingPulse'
  | 'commandCenter.leadership.whatChanged'
  | 'commandCenter.leadership.comparisonDefault'
  | 'commandCenter.attention.title'
  | 'commandCenter.operations.title'
  | 'commandCenter.operations.byStatus'
  | 'commandCenter.operations.recent'
  | 'commandCenter.journeys.title'
  | 'commandCenter.journeys.col.journey'
  | 'commandCenter.journeys.col.active'
  | 'commandCenter.journeys.col.completed'
  | 'commandCenter.journeys.col.requests'
  | 'commandCenter.finance.title'
  | 'commandCenter.finance.note'
  | 'commandCenter.finance.funnel'
  | 'commandCenter.finance.readiness'
  | 'commandCenter.platform.title'
  | 'commandCenter.platform.riskCenter'
  | 'commandCenter.platform.controls'
  | 'commandCenter.platform.footerNote'
  | 'commandCenter.mobile.title'
  | 'commandCenter.mobile.subtitle'
  | 'commandCenter.decisionInbox.title'
  | 'commandCenter.decisionInbox.empty'
  | 'commandCenter.decisionInbox.footer'
  | 'commandCenter.decisionInbox.source'
  | 'commandCenter.metric.evidence'
  | 'commandCenter.search.label'
  | 'commandCenter.search.placeholder'
  | 'commandCenter.search.submit'
  | 'commandCenter.chart.performanceTitle'
  | 'commandCenter.chart.performanceSubtitle'
  | 'commandCenter.chart.distributionTitle'
  | 'commandCenter.chart.distributionSubtitle'
  | 'commandCenter.chart.requests'
  | 'commandCenter.chart.active'
  | 'commandCenter.chart.completed'
  | 'commandCenter.chart.other'
  | 'commandCenter.chart.noPerformanceData'
  | 'commandCenter.chart.noDistributionData'
  | 'commandCenter.chart.opportunitiesCenter'
  | 'commandCenter.chart.trendTitle'
  | 'commandCenter.chart.trendSubtitle'
  | 'commandCenter.chart.qualified'
  | 'commandCenter.chart.noTrendData'
  | 'commandCenter.truthState.LIVE'
  | 'commandCenter.truthState.STALE'
  | 'commandCenter.truthState.PARTIAL'
  | 'commandCenter.truthState.ESTIMATED'
  | 'commandCenter.truthState.NOT_AVAILABLE'
  | 'commandCenter.truthState.NOT_YET_OPERATIONAL'
  | 'commandCenter.truthState.BLOCKED'
  | 'commandCenter.truthState.UNKNOWN'
  | 'commandCenter.activity.title'
  | 'commandCenter.activity.empty'
  | 'commandCenter.featured.title'
  | 'commandCenter.featured.inProgress'
  | 'commandCenter.featured.completed'
  | 'commandCenter.assistant.title'
  | 'commandCenter.assistant.subtitle'
  | 'commandCenter.assistant.intro'
  | 'commandCenter.assistant.placeholder'
  | 'commandCenter.assistant.ask'
  | 'commandCenter.assistant.error'
  | 'commandCenter.assistant.prompt.performance'
  | 'commandCenter.assistant.prompt.risks'
  | 'commandCenter.assistant.prompt.backlog'
  | 'commandCenter.assistant.prompt.decisions'
  | 'commandCenter.quickActions.title'
  | 'commandCenter.quickActions.review'
  | 'commandCenter.quickActions.report'
  | 'commandCenter.quickActions.delegations'
  | 'commandCenter.quickActions.notify'
  | 'commandCenter.quickActions.newProject'
  | 'commandCenter.quickActions.opportunity'
  | 'commandCenter.quickActions.analytics'
  | 'commandCenter.quickActions.users';

const AR: Record<CommandCenterMessageKey, string> = {
  'commandCenter.title': 'لوحة القيادة',
  'commandCenter.eyebrow': 'مركز القيادة التنفيذي',
  'commandCenter.lastUpdated': 'آخر تحديث',
  'commandCenter.refresh': 'تحديث',
  'commandCenter.notifications': 'الإشعارات',
  'commandCenter.notificationsTitle': 'آخر الإشعارات',
  'commandCenter.notificationsSubtitle': 'تنبيهات تشغيلية وطلبات تحتاج متابعة',
  'commandCenter.viewDetails': 'عرض التفاصيل',
  'commandCenter.loadError': 'تعذر تحميل بيانات لوحة القيادة',
  'commandCenter.loading': 'جاري تحميل المؤشرات…',
  'commandCenter.hero.eyebrow': 'Command Center',
  'commandCenter.hero.subtitle': 'إدارة شاملة.. رؤية أوسع.. لقرارات أفضل',
  'commandCenter.hero.greeting': 'معاً نبني غداً أفضل',
  'commandCenter.hero.greetingNamed': 'صباح الخير، {name}. معاً نصنع مستقبلاً أفضل.',
  'commandCenter.hero.platformTagline': 'منصة متكاملة للهندسة والاستثمار والتحول الرقمي',
  'commandCenter.hero.platformTaglineBody':
    'INTEGRATED ENGINEERING, INVESTMENT AND DIGITAL PLATFORM — رحلة واحدة من الفكرة إلى التشغيل.',
  'commandCenter.hero.weather': '30°م',
  'commandCenter.hero.quoteTitle': 'EAM',
  'commandCenter.hero.quoteBody': 'نحو مستقبل أكثر ازدهاراً لعائلات أسعد.',
  'commandCenter.modules.engineeringDesign': 'التصميم الهندسي',
  'commandCenter.nav.main': 'التنقل الرئيسي',
  'commandCenter.nav.internal': 'المنصة الداخلية',
  'commandCenter.nav.dashboard': 'لوحة القيادة',
  'commandCenter.nav.review': 'المراجعة المهنية',
  'commandCenter.nav.delegations': 'إدارة المفوّضين',
  'commandCenter.nav.settings': 'الإعدادات',
  'commandCenter.nav.users': 'إدارة المستخدمين',
  'commandCenter.nav.content': 'إدارة المحتوى',
  'commandCenter.nav.analytics': 'التحليلات والتقارير',
  'commandCenter.nav.help': 'مركز المساعدة',
  'commandCenter.sidebar.slogan': 'نبني اليوم لغدٍ أعظم',
  'commandCenter.values.aria': 'قيم EAM',
  'commandCenter.values.trust': 'الثقة أولاً',
  'commandCenter.values.customer': 'العميل أولاً',
  'commandCenter.values.innovation': 'ابتكار ذو معنى',
  'commandCenter.values.partnerships': 'شراكات ذات أثر',
  'commandCenter.values.growth': 'نمو مستدام',
  'commandCenter.values.vision': 'من الرؤية إلى الواقع',
  'commandCenter.advanced.title': 'رؤى تنفيذية إضافية',
  'commandCenter.search.shortcutHint': '⌘ K',
  'commandCenter.role.owner': 'مالك المنصة',
  'commandCenter.role.projectOwner': 'مالك مشروع',
  'commandCenter.role.delegate': 'مفوّض من المالك',
  'commandCenter.sectors.title': 'أقسام المنصة',
  'commandCenter.sectors.subtitle': 'القطاعات والرحلات الرقمية النشطة',
  'commandCenter.delegations.title': 'تفويض الوصول',
  'commandCenter.delegations.subtitle':
    'يمنح المالك وصولاً للوحة القيادة لمستخدمين موثوقين. يمكن سحب التفويض في أي وقت.',
  'commandCenter.delegations.emailPlaceholder': 'البريد الإلكتروني للمفوّض',
  'commandCenter.delegations.notePlaceholder': 'ملاحظة (اختياري)',
  'commandCenter.delegations.grant': 'منح الوصول',
  'commandCenter.delegations.revoke': 'سحب التفويض',
  'commandCenter.delegations.error': 'تعذر إتمام التفويض. تحقق من البريد وأن المستخدم مسجّل.',
  'commandCenter.access.verifying': 'جاري التحقق من صلاحيات لوحة القيادة…',
  'commandCenter.access.deniedTitle': 'الوصول مقيّد',
  'commandCenter.access.deniedBody':
    'لوحة القيادة متاحة للمالك أو من يفوّضه المالك فقط. إذا كنت تعتقد أن هذا خطأ، تواصل مع مالك المنصة.',
  'commandCenter.access.currentRole': 'دور الحساب الحالي',
  'commandCenter.access.switchAccount': 'تسجيل الدخول بحساب آخر',
  'commandCenter.access.goBack': 'العودة',
  'commandCenter.sections.leadership': 'القيادة',
  'commandCenter.sections.attention': 'مطلوب انتباهك',
  'commandCenter.sections.operations': 'العمليات',
  'commandCenter.sections.journeys': 'الرحلات',
  'commandCenter.sections.finance': 'المال',
  'commandCenter.sections.platform': 'المنصة',
  'commandCenter.sections.aria': 'أقسام لوحة القيادة',
  'commandCenter.leadership.title': 'نظرة قيادية',
  'commandCenter.leadership.briefTitle': 'موجز القيادة',
  'commandCenter.leadership.briefFacts': 'حقائق (FACT)',
  'commandCenter.leadership.briefRecommendations': 'توصيات (RECOMMENDATION)',
  'commandCenter.leadership.decisionsTitle': 'قرارات ومتابعة',
  'commandCenter.leadership.decisionsNeeded': 'قرارات مطلوبة',
  'commandCenter.leadership.watchNext': 'يُنصح بمتابعتها',
  'commandCenter.leadership.scorecard': 'بطاقة الأداء الاستراتيجي',
  'commandCenter.leadership.operatingPulse': 'نبض التشغيل',
  'commandCenter.leadership.whatChanged': 'ما الذي تغيّر؟',
  'commandCenter.leadership.comparisonDefault': 'مقارنة زمنية',
  'commandCenter.attention.title': 'مطلوب انتباهك',
  'commandCenter.operations.title': 'طلبات الخدمة والمراجعة المهنية',
  'commandCenter.operations.byStatus': 'حسب الحالة',
  'commandCenter.operations.recent': 'آخر الطلبات',
  'commandCenter.journeys.title': 'الرحلات',
  'commandCenter.journeys.col.journey': 'الرحلة',
  'commandCenter.journeys.col.active': 'نشطة',
  'commandCenter.journeys.col.completed': 'مكتملة',
  'commandCenter.journeys.col.requests': 'طلبات',
  'commandCenter.finance.title': 'النبض المالي',
  'commandCenter.finance.note': 'لا تُعرض أرقام مالية غير معتمدة — الحالات الصريحة بدل الصفر الوهمي.',
  'commandCenter.finance.funnel': 'مسار تجاري',
  'commandCenter.finance.readiness': 'جاهزية تجارية',
  'commandCenter.platform.title': 'صحة المنصة والمخاطر',
  'commandCenter.platform.riskCenter': 'مركز المخاطر',
  'commandCenter.platform.controls': 'ضمانات التحكم',
  'commandCenter.platform.footerNote':
    'COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT = 0 — لوحة قراءة/تحكم عبر السلطات الموجودة فقط.',
  'commandCenter.mobile.title': 'موجز تنفيذي — جوال',
  'commandCenter.mobile.subtitle': 'قرارات · إجراءات · متابعة · نبض',
  'commandCenter.decisionInbox.title': 'صندوق القرارات',
  'commandCenter.decisionInbox.empty': 'لا توجد قرارات معلّقة حالياً.',
  'commandCenter.decisionInbox.footer':
    'قرارات العروض السعرية (QUOTE) وغيرها تُسجّل في Business Lab — لا يختار النظام بدائل افتراضية.',
  'commandCenter.decisionInbox.source': 'المصدر',
  'commandCenter.metric.evidence': 'دليل',
  'commandCenter.search.label': 'بحث لوحة القيادة',
  'commandCenter.search.placeholder': 'ابحث في المنصة…',
  'commandCenter.search.submit': 'بحث',
  'commandCenter.chart.performanceTitle': 'أداء المنصة',
  'commandCenter.chart.performanceSubtitle': 'طلبات ورحلات نشطة ومكتملة حسب نوع الرحلة',
  'commandCenter.chart.distributionTitle': 'توزيع الفرص حسب القطاع',
  'commandCenter.chart.distributionSubtitle': 'حجم النشاط التشغيلي الحالي',
  'commandCenter.chart.requests': 'طلبات',
  'commandCenter.chart.active': 'نشطة',
  'commandCenter.chart.completed': 'مكتملة',
  'commandCenter.chart.other': 'أخرى',
  'commandCenter.chart.noPerformanceData': 'لا توجد بيانات أداء كافية بعد.',
  'commandCenter.chart.noDistributionData': 'لا يوجد توزيع فرص متاح حالياً.',
  'commandCenter.chart.opportunitiesCenter': 'فرص حالية',
  'commandCenter.chart.trendTitle': 'اتجاه المنصة',
  'commandCenter.chart.trendSubtitle': 'حجم أسبوعي — طلبات جديدة ومؤهلة (8 أسابيع)',
  'commandCenter.chart.qualified': 'مؤهلة',
  'commandCenter.chart.noTrendData': 'لا توجد بيانات اتجاه كافية بعد.',
  'commandCenter.truthState.LIVE': 'مباشر',
  'commandCenter.truthState.STALE': 'قديم',
  'commandCenter.truthState.PARTIAL': 'جزئي',
  'commandCenter.truthState.ESTIMATED': 'تقديري',
  'commandCenter.truthState.NOT_AVAILABLE': 'غير متاح',
  'commandCenter.truthState.NOT_YET_OPERATIONAL': 'غير تشغيلي بعد',
  'commandCenter.truthState.BLOCKED': 'محظور',
  'commandCenter.truthState.UNKNOWN': 'غير معروف',
  'commandCenter.activity.title': 'آخر النشاطات',
  'commandCenter.activity.empty': 'لا توجد نشاطات حديثة.',
  'commandCenter.featured.title': 'المشاريع البارزة',
  'commandCenter.featured.inProgress': 'قيد التنفيذ',
  'commandCenter.featured.completed': 'مكتمل',
  'commandCenter.assistant.title': 'مساعد EAM الذكي',
  'commandCenter.assistant.subtitle': 'تحليل تنفيذي مبني على بيانات المنصة',
  'commandCenter.assistant.intro': 'كيف يمكنني مساعدتك اليوم؟',
  'commandCenter.assistant.placeholder': 'اسأل عن الأداء، المخاطر، أو القرارات…',
  'commandCenter.assistant.ask': 'اسأل',
  'commandCenter.assistant.error': 'تعذر الحصول على إجابة المساعد.',
  'commandCenter.assistant.prompt.performance': 'حلّل أداء المشاريع',
  'commandCenter.assistant.prompt.risks': 'ما أبرز المخاطر؟',
  'commandCenter.assistant.prompt.backlog': 'حالة الطابور التشغيلي',
  'commandCenter.assistant.prompt.decisions': 'ما القرارات المطلوبة؟',
  'commandCenter.quickActions.title': 'إجراءات سريعة',
  'commandCenter.quickActions.review': 'مراجعة الطلبات',
  'commandCenter.quickActions.report': 'موجز القيادة',
  'commandCenter.quickActions.delegations': 'إدارة المفوّضين',
  'commandCenter.quickActions.notify': 'إرسال إشعار',
  'commandCenter.quickActions.newProject': 'مشروع جديد',
  'commandCenter.quickActions.opportunity': 'فرصة جديدة',
  'commandCenter.quickActions.analytics': 'التحليلات',
  'commandCenter.quickActions.users': 'إدارة المستخدمين',
};

const EN: Record<CommandCenterMessageKey, string> = {
  'commandCenter.title': 'Command Center',
  'commandCenter.eyebrow': 'Executive command center',
  'commandCenter.lastUpdated': 'Last updated',
  'commandCenter.refresh': 'Refresh',
  'commandCenter.notifications': 'Notifications',
  'commandCenter.notificationsTitle': 'Latest notifications',
  'commandCenter.notificationsSubtitle': 'Operational alerts and items needing follow-up',
  'commandCenter.viewDetails': 'View details',
  'commandCenter.loadError': 'Could not load command center data',
  'commandCenter.loading': 'Loading metrics…',
  'commandCenter.hero.eyebrow': 'Command Center',
  'commandCenter.hero.subtitle': 'Full oversight, wider visibility, better decisions',
  'commandCenter.hero.greeting': 'Together we build a better tomorrow',
  'commandCenter.hero.greetingNamed': 'Good morning, {name}. Together we create a better future.',
  'commandCenter.hero.platformTagline': 'Integrated engineering, investment & digital platform',
  'commandCenter.hero.platformTaglineBody':
    'INTEGRATED ENGINEERING, INVESTMENT AND DIGITAL PLATFORM — one journey from idea to operations.',
  'commandCenter.hero.weather': '30°C',
  'commandCenter.hero.quoteTitle': 'EAM',
  'commandCenter.hero.quoteBody': 'Towards a more prosperous future for happier families.',
  'commandCenter.modules.engineeringDesign': 'Engineering Design',
  'commandCenter.nav.main': 'Main navigation',
  'commandCenter.nav.internal': 'Internal platform',
  'commandCenter.nav.dashboard': 'Command Center',
  'commandCenter.nav.review': 'Professional review',
  'commandCenter.nav.delegations': 'Delegate access',
  'commandCenter.nav.settings': 'Settings',
  'commandCenter.nav.users': 'User management',
  'commandCenter.nav.content': 'Content management',
  'commandCenter.nav.analytics': 'Analytics & reports',
  'commandCenter.nav.help': 'Help center',
  'commandCenter.sidebar.slogan': 'Building today for a greater tomorrow',
  'commandCenter.values.aria': 'EAM values',
  'commandCenter.values.trust': 'Trust first',
  'commandCenter.values.customer': 'Customer first',
  'commandCenter.values.innovation': 'Meaningful innovation',
  'commandCenter.values.partnerships': 'Partnerships for impact',
  'commandCenter.values.growth': 'Sustainable growth',
  'commandCenter.values.vision': 'From vision to reality',
  'commandCenter.advanced.title': 'Additional executive insights',
  'commandCenter.search.shortcutHint': '⌘ K',
  'commandCenter.role.owner': 'Platform owner',
  'commandCenter.role.projectOwner': 'Project owner',
  'commandCenter.role.delegate': 'Owner delegate',
  'commandCenter.sectors.title': 'Platform sectors',
  'commandCenter.sectors.subtitle': 'Active sectors and digital journeys',
  'commandCenter.delegations.title': 'Access delegation',
  'commandCenter.delegations.subtitle':
    'The owner can grant Command Center access to trusted users. Delegation can be revoked anytime.',
  'commandCenter.delegations.emailPlaceholder': 'Delegate email',
  'commandCenter.delegations.notePlaceholder': 'Note (optional)',
  'commandCenter.delegations.grant': 'Grant access',
  'commandCenter.delegations.revoke': 'Revoke',
  'commandCenter.delegations.error': 'Could not grant access. Check the email and that the user has signed in once.',
  'commandCenter.access.verifying': 'Verifying Command Center access…',
  'commandCenter.access.deniedTitle': 'Access restricted',
  'commandCenter.access.deniedBody':
    'The Command Center is available to the platform owner or users delegated by the owner only.',
  'commandCenter.access.currentRole': 'Current account role',
  'commandCenter.access.switchAccount': 'Sign in with another account',
  'commandCenter.access.goBack': 'Go back',
  'commandCenter.sections.leadership': 'Leadership',
  'commandCenter.sections.attention': 'Needs attention',
  'commandCenter.sections.operations': 'Operations',
  'commandCenter.sections.journeys': 'Journeys',
  'commandCenter.sections.finance': 'Finance',
  'commandCenter.sections.platform': 'Platform',
  'commandCenter.sections.aria': 'Command center sections',
  'commandCenter.leadership.title': 'Leadership view',
  'commandCenter.leadership.briefTitle': 'Executive brief',
  'commandCenter.leadership.briefFacts': 'Facts',
  'commandCenter.leadership.briefRecommendations': 'Recommendations',
  'commandCenter.leadership.decisionsTitle': 'Decisions & follow-up',
  'commandCenter.leadership.decisionsNeeded': 'Decisions needed',
  'commandCenter.leadership.watchNext': 'Watch next',
  'commandCenter.leadership.scorecard': 'Strategic scorecard',
  'commandCenter.leadership.operatingPulse': 'Operating pulse',
  'commandCenter.leadership.whatChanged': 'What changed?',
  'commandCenter.leadership.comparisonDefault': 'Time comparison',
  'commandCenter.attention.title': 'Needs your attention',
  'commandCenter.operations.title': 'Service requests & professional review',
  'commandCenter.operations.byStatus': 'By status',
  'commandCenter.operations.recent': 'Recent requests',
  'commandCenter.journeys.title': 'Journeys',
  'commandCenter.journeys.col.journey': 'Journey',
  'commandCenter.journeys.col.active': 'Active',
  'commandCenter.journeys.col.completed': 'Completed',
  'commandCenter.journeys.col.requests': 'Requests',
  'commandCenter.finance.title': 'Financial pulse',
  'commandCenter.finance.note': 'Unverified financial numbers are not shown — explicit states instead of fake zeros.',
  'commandCenter.finance.funnel': 'Commercial funnel',
  'commandCenter.finance.readiness': 'Commercial readiness',
  'commandCenter.platform.title': 'Platform health & risks',
  'commandCenter.platform.riskCenter': 'Risk center',
  'commandCenter.platform.controls': 'Control assurance',
  'commandCenter.platform.footerNote':
    'COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT = 0 — read/control via existing authorities only.',
  'commandCenter.mobile.title': 'Executive snapshot — mobile',
  'commandCenter.mobile.subtitle': 'Decisions · actions · follow-up · pulse',
  'commandCenter.decisionInbox.title': 'Decision inbox',
  'commandCenter.decisionInbox.empty': 'No pending decisions right now.',
  'commandCenter.decisionInbox.footer':
    'Quote and other commercial decisions are recorded in Business Lab — the system does not choose defaults.',
  'commandCenter.decisionInbox.source': 'Source',
  'commandCenter.metric.evidence': 'Evidence',
  'commandCenter.search.label': 'Command center search',
  'commandCenter.search.placeholder': 'Search the platform…',
  'commandCenter.search.submit': 'Search',
  'commandCenter.chart.performanceTitle': 'Platform performance',
  'commandCenter.chart.performanceSubtitle': 'Requests and active/completed journeys by type',
  'commandCenter.chart.distributionTitle': 'Opportunity distribution by sector',
  'commandCenter.chart.distributionSubtitle': 'Current operational volume',
  'commandCenter.chart.requests': 'Requests',
  'commandCenter.chart.active': 'Active',
  'commandCenter.chart.completed': 'Completed',
  'commandCenter.chart.other': 'Other',
  'commandCenter.chart.noPerformanceData': 'Not enough performance data yet.',
  'commandCenter.chart.noDistributionData': 'No opportunity distribution available yet.',
  'commandCenter.chart.opportunitiesCenter': 'Current opportunities',
  'commandCenter.chart.trendTitle': 'Platform trend',
  'commandCenter.chart.trendSubtitle': 'Weekly volume — new and qualified requests (8 weeks)',
  'commandCenter.chart.qualified': 'Qualified',
  'commandCenter.chart.noTrendData': 'Not enough trend data yet.',
  'commandCenter.truthState.LIVE': 'Live',
  'commandCenter.truthState.STALE': 'Stale',
  'commandCenter.truthState.PARTIAL': 'Partial',
  'commandCenter.truthState.ESTIMATED': 'Estimated',
  'commandCenter.truthState.NOT_AVAILABLE': 'Not available',
  'commandCenter.truthState.NOT_YET_OPERATIONAL': 'Not yet operational',
  'commandCenter.truthState.BLOCKED': 'Blocked',
  'commandCenter.truthState.UNKNOWN': 'Unknown',
  'commandCenter.activity.title': 'Latest activity',
  'commandCenter.activity.empty': 'No recent activity.',
  'commandCenter.featured.title': 'Featured projects',
  'commandCenter.featured.inProgress': 'In progress',
  'commandCenter.featured.completed': 'Completed',
  'commandCenter.assistant.title': 'EAM Smart Assistant',
  'commandCenter.assistant.subtitle': 'Executive analysis grounded in platform data',
  'commandCenter.assistant.intro': 'How can I help you today?',
  'commandCenter.assistant.placeholder': 'Ask about performance, risks, or decisions…',
  'commandCenter.assistant.ask': 'Ask',
  'commandCenter.assistant.error': 'Could not get an assistant answer.',
  'commandCenter.assistant.prompt.performance': 'Analyze project performance',
  'commandCenter.assistant.prompt.risks': 'What are the top risks?',
  'commandCenter.assistant.prompt.backlog': 'Operations backlog status',
  'commandCenter.assistant.prompt.decisions': 'What decisions are needed?',
  'commandCenter.quickActions.title': 'Quick actions',
  'commandCenter.quickActions.review': 'Review requests',
  'commandCenter.quickActions.report': 'Executive brief',
  'commandCenter.quickActions.delegations': 'Manage delegates',
  'commandCenter.quickActions.notify': 'Send notification',
  'commandCenter.quickActions.newProject': 'Add new project',
  'commandCenter.quickActions.opportunity': 'Create opportunity',
  'commandCenter.quickActions.analytics': 'Go to analytics',
  'commandCenter.quickActions.users': 'User management',
};

export const COMMAND_CENTER_MESSAGES_AR = AR;
export const COMMAND_CENTER_MESSAGES_EN = EN;
