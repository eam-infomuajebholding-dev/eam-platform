/** Marketing and inner-page copy (ar + en). */

export type PageMessageKey =
  | 'brand.name'
  | 'brand.nameShort'
  | 'brand.nameLatin'
  | 'brand.logoAlt'
  | 'aria.whatsapp'
  | 'common.backHome'
  | 'common.viewDetails'
  | 'common.learnMore'
  | 'common.submit'
  | 'common.submitting'
  | 'common.success'
  | 'common.error'
  | 'common.comingSoon'
  | 'common.contactUs'
  | 'common.sendMessage'
  | 'common.needOurServices'
  | 'page.about.hero.title'
  | 'page.about.hero.subtitle'
  | 'page.about.intro'
  | 'page.about.commitments.title'
  | 'page.about.commitments.1'
  | 'page.about.commitments.2'
  | 'page.about.commitments.3'
  | 'page.about.commitments.4'
  | 'page.about.commitments.5'
  | 'page.about.values.title'
  | 'page.about.values.1.title'
  | 'page.about.values.1.desc'
  | 'page.about.values.2.title'
  | 'page.about.values.2.desc'
  | 'page.about.values.3.title'
  | 'page.about.values.3.desc'
  | 'page.services.hero.title'
  | 'page.services.hero.subtitle'
  | 'page.services.engineering.title'
  | 'page.services.engineering.subtitle'
  | 'page.services.engineering.viewAll'
  | 'page.services.government.title'
  | 'page.services.government.subtitle'
  | 'page.services.government.viewAll'
  | 'page.services.platformGate'
  | 'page.services.platforms.hero.title'
  | 'page.services.platforms.hero.subtitle'
  | 'page.services.platforms.intro'
  | 'page.services.platforms.backToServices'
  | 'page.services.contracting.title'
  | 'page.services.maintenance.title'
  | 'page.services.development.title'
  | 'page.services.marketing.title'
  | 'page.services.cta.title'
  | 'page.services.cta.desc'
  | 'page.services.cta.button'
  | 'page.services.intro'
  | 'page.services.explore'
  | 'page.services.startJourney'
  | 'page.services.filter.all'
  | 'page.services.filter.develop'
  | 'page.services.filter.engineer'
  | 'page.services.filter.operate'
  | 'page.services.filter.supply'
  | 'page.services.stat.sectors'
  | 'page.services.stat.sectorsValue'
  | 'page.services.stat.journeys'
  | 'page.services.stat.journeysValue'
  | 'page.services.stat.platform'
  | 'page.services.stat.platformValue'
  | 'page.services.grid.title'
  | 'page.services.grid.subtitle'
  | 'page.services.unifiedPlatform.label'
  | 'page.services.unifiedPlatform.aria'
  | 'page.contact.hero.title'
  | 'page.contact.hero.subtitle'
  | 'page.contact.form.title'
  | 'page.contact.form.successTitle'
  | 'page.contact.form.name'
  | 'page.contact.form.email'
  | 'page.contact.form.phone'
  | 'page.contact.form.subject'
  | 'page.contact.form.message'
  | 'page.contact.form.submit'
  | 'page.contact.info.title'
  | 'page.contact.hours.title'
  | 'page.contact.map.title'
  | 'page.contact.toast.success'
  | 'page.contact.toast.error'
  | 'page.contact.whatsapp'
  | 'page.projects.hero.title'
  | 'page.projects.hero.subtitle'
  | 'page.projects.section.title'
  | 'page.projects.eyebrow'
  | 'page.projects.disclaimer'
  | 'page.projects.viewDetails'
  | 'page.projects.filter.all'
  | 'page.projects.filter.active'
  | 'page.projects.filter.completed'
  | 'page.projects.filter.upcoming'
  | 'page.projects.statTotal'
  | 'page.projects.statActive'
  | 'page.projects.statCities'
  | 'page.projects.modal.location'
  | 'page.projects.modal.year'
  | 'page.projects.modal.description'
  | 'page.projects.modal.gallery'
  | 'page.projects.modal.downloadPdf'
  | 'page.projects.deleteConfirm'
  | 'page.projects.deleteSuccess'
  | 'page.projects.addSuccess'
  | 'page.projects.modal.addTitle'
  | 'page.projects.empty'
  | 'page.invest.hero.title'
  | 'page.invest.hero.subtitle'
  | 'page.invest.section.title'
  | 'page.invest.cta.title'
  | 'page.market.hero.title'
  | 'page.market.hero.subtitle'
  | 'page.market.comingSoon'
  | 'page.market.body'
  | 'page.market.launchNote'
  | 'page.careers.hero.title'
  | 'page.careers.apply.title'
  | 'page.careers.success.title'
  | 'page.team.hero.title'
  | 'page.consultation.hero.title'
  | 'page.consultation.hero.subtitle'
  | 'page.consultation.form.title'
  | 'page.consultation.form.type'
  | 'page.consultation.form.typePlaceholder'
  | 'page.consultation.form.type.engineering'
  | 'page.consultation.form.type.government'
  | 'page.consultation.form.type.other'
  | 'page.consultation.form.namePlaceholder'
  | 'page.consultation.form.messagePlaceholder'
  | 'page.consultation.form.submit'
  | 'page.consultation.success.title'
  | 'page.consultation.success.body1'
  | 'page.consultation.success.body2'
  | 'page.consultation.success.sendAnother'
  | 'page.consultation.toast.success'
  | 'page.consultation.toast.error'
  | 'page.engineering.hero.title'
  | 'page.engineering.hero.subtitle'
  | 'page.engineering.cta.title'
  | 'page.engineering.cta.desc'
  | 'page.government.hero.title'
  | 'page.government.hero.subtitle'
  | 'page.government.cta.title'
  | 'page.government.cta.desc'
  | 'page.contracting.hero.title'
  | 'page.contracting.hero.subtitle'
  | 'page.contracting.cta.title'
  | 'page.contracting.cta.desc'
  | 'page.maintenance.hero.title'
  | 'page.maintenance.hero.subtitle'
  | 'page.maintenance.cta.title'
  | 'page.maintenance.cta.desc'
  | 'page.red.hero.title'
  | 'page.red.hero.subtitle'
  | 'page.red.cta.title'
  | 'page.red.cta.desc'
  | 'page.rem.hero.title'
  | 'page.rem.hero.subtitle'
  | 'page.rem.cta.title'
  | 'page.rem.cta.desc'
  | 'page.contact.form.successBody1'
  | 'page.contact.form.successBody2'
  | 'page.contact.form.sendAnother'
  | 'page.contact.form.namePlaceholder'
  | 'page.contact.form.messagePlaceholder'
  | 'page.contact.form.subjectPlaceholder'
  | 'page.contact.info.phone'
  | 'page.contact.info.email'
  | 'page.contact.info.location'
  | 'page.contact.hours.body'
  | 'page.contact.map.subtitle'
  | 'page.contact.map.location'
  | 'page.contact.whatsappLabel'
  | 'page.careers.hero.subtitle'
  | 'page.careers.form.desc'
  | 'page.careers.success.body'
  | 'page.team.hero.subtitle'
  | 'page.team.intro'
  | 'page.projects.addProject'
  | 'page.invest.stats.projects'
  | 'page.invest.stats.volume'
  | 'page.invest.stats.return'
  | 'page.invest.stats.partners'
  | 'page.invest.section.desc'
  | 'page.invest.filter.all'
  | 'page.invest.filter.available'
  | 'page.invest.filter.inProgress'
  | 'page.invest.viewDetails'
  | 'page.invest.cta.desc'
  | 'page.invest.addProject'
  | 'page.invest.status.available'
  | 'page.invest.status.inProgress'
  | 'page.invest.status.completed'
  | 'page.sector.notFound'
  | 'page.sector.body'
  | 'page.sector.startEc'
  | 'page.sector.startBv'
  | 'page.sector.startContracting'
  | 'page.sector.startValuation'
  | 'page.sector.startMaintenance'
  | 'page.sector.startPm'
  | 'page.sector.startFurnishing'
  | 'page.sector.startFm'
  | 'page.sector.startGs'
  | 'page.sector.startRed'
  | 'page.sector.startRem'
  | 'page.sector.startBm'
  | 'page.sector.startEquipment'
  | 'page.sector.startInvestment'
  | 'page.sector.startFactories'
  | 'page.sector.startDelivery';

export type PageMessageCatalog = Record<PageMessageKey, string>;

export const PAGE_MESSAGES_AR: PageMessageCatalog = {
  'brand.name': 'إعمار الأصالة والمعاصرة',
  'brand.nameShort': 'إعمار الأصالة والمعاصرة للاستشارات الهندسية',
  'brand.nameLatin': 'Emmar Al Asala Wa Al Muasara',
  'brand.logoAlt': 'إعمار الأصالة والمعاصرة',
  'aria.whatsapp': 'تواصل عبر واتساب',
  'common.backHome': 'العودة للرئيسية',
  'common.viewDetails': 'عرض التفاصيل ←',
  'common.learnMore': 'اعرف المزيد',
  'common.submit': 'إرسال',
  'common.submitting': 'جاري الإرسال...',
  'common.success': 'تم الإرسال بنجاح!',
  'common.error': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  'common.comingSoon': 'قريباً',
  'common.contactUs': 'تواصل معنا',
  'common.sendMessage': 'أرسل لنا رسالة',
  'common.needOurServices': 'هل تحتاج إلى خدماتنا؟',
  'page.about.hero.title': 'من نحن',
  'page.about.hero.subtitle': 'تعرّف على قصتنا ورؤيتنا وقيمنا',
  'page.about.intro':
    'تأسست شركة إعمار الأصالة والمعاصرة للاستشارات الهندسية لتكون نموذجاً يحتذى به في تقديم الاستشارات الهندسية المتكاملة، نمزج بين أصالة الموروث المعماري وحداثة التصميم العصري، بفريق من أفضل المهندسين والاستشاريين المتخصصين، ونعمل بشغف لتحويل رؤى عملائنا إلى مشاريع رائدة على أرض الواقع.',
  'page.about.commitments.title': 'التزاماتنا',
  'page.about.commitments.1': 'الالتزام بأعلى معايير الجودة في كل مشروع',
  'page.about.commitments.2': 'فريق من المهندسين والخبراء المتخصصين',
  'page.about.commitments.3': 'استخدام أحدث التقنيات والأنظمة العالمية',
  'page.about.commitments.4': 'التسليم في الوقت المحدد وضمن الميزانية',
  'page.about.commitments.5': 'خدمة ما بعد البيع وضمان شامل',
  'page.about.values.title': 'قيمنا',
  'page.about.values.1.title': 'جودة معتمدة',
  'page.about.values.1.desc': 'حاصلون على شهادات الأيزو العالمية',
  'page.about.values.2.title': 'رؤية واضحة',
  'page.about.values.2.desc': 'نسعى لنكون الرائدين إقليمياً',
  'page.about.values.3.title': 'نمو مستدام',
  'page.about.values.3.desc': 'نمو سنوي متواصل منذ التأسيس',
  'page.services.hero.title': 'خدماتنا',
  'page.services.hero.subtitle':
    'استشارات هندسية معتمدة وخدمات حكومية متخصصة — مع منصة EAM للقطاعات عند الحاجة.',
  'page.services.intro':
    'نقدّم تصميمًا وإشرافًا ودراساتًا هندسية، ونُنجز معاملاتكم البلدية والحكومية بكفاءة. هذا هو جوهر شركة EAM.',
  'page.services.platformGate':
    'منصات القطاعات الـ16 والرحلات الرقمية متاحة عبر الشعار أعلاه — لمن يريد التوسع خارج الخدمات الأساسية.',
  'page.services.engineering.subtitle': 'تصميم، مخططات، إشراف، ودراسات وفق المعايير المعتمدة',
  'page.services.engineering.viewAll': 'صفحة الخدمات الهندسية',
  'page.services.government.subtitle': 'رخص، صكوك، مخالفات، ومعاملات بلدية',
  'page.services.government.viewAll': 'صفحة الخدمات الحكومية',
  'page.services.platforms.hero.title': 'منصات قطاعات EAM',
  'page.services.platforms.hero.subtitle':
    '16 قطاعاً متكاملاً — من التطوير والاستثمار إلى التنفيذ والتشغيل — عبر منصة واحدة.',
  'page.services.platforms.intro':
    'كل قطاع مرتبط برحلة رقمية ومساعد EAM الذكي. اختر مجالك أو ابدأ رحلتك المخصصة.',
  'page.services.platforms.backToServices': 'العودة إلى الخدمات الأساسية',
  'page.services.explore': 'استكشف القطاع',
  'page.services.startJourney': 'ابدأ الرحلة',
  'page.services.filter.all': 'جميع القطاعات',
  'page.services.filter.develop': 'التطوير والاستثمار',
  'page.services.filter.engineer': 'الهندسة والتنفيذ',
  'page.services.filter.operate': 'التشغيل والمرافق',
  'page.services.filter.supply': 'التوريد والسلسلة',
  'page.services.stat.sectors': 'قطاعات متكاملة',
  'page.services.stat.sectorsValue': '16+',
  'page.services.stat.journeys': 'رحلات رقمية',
  'page.services.stat.journeysValue': '14+',
  'page.services.stat.platform': 'منصة موحّدة',
  'page.services.stat.platformValue': '1',
  'page.services.grid.title': 'منصات EAM',
  'page.services.grid.subtitle': 'اختر قطاعاً لاستكشاف الخدمات أو بدء رحلتك المخصصة',
  'page.services.unifiedPlatform.label': 'منصة EAM الشاملة لقطاعات البناء',
  'page.services.unifiedPlatform.aria': 'الدخول إلى المنصة الجامعة لقطاعات EAM',
  'page.services.engineering.title': 'الخدمات الهندسية',
  'page.services.government.title': 'الخدمات الحكومية',
  'page.services.contracting.title': 'المقاولات',
  'page.services.maintenance.title': 'الصيانة والتشغيل',
  'page.services.development.title': 'التطوير العقاري',
  'page.services.marketing.title': 'التسويق العقاري',
  'page.services.cta.title': 'هل تحتاج إلى خدماتنا؟',
  'page.services.cta.desc': 'تواصل معنا اليوم للحصول على استشارة مجانية',
  'page.services.cta.button': 'طلب استشارة',
  'page.contact.hero.title': 'اتصل بنا',
  'page.contact.hero.subtitle': 'نسعد بتواصلكم معنا في أي وقت',
  'page.contact.form.title': 'أرسل لنا رسالة',
  'page.contact.form.successTitle': 'تم إرسال رسالتك بنجاح!',
  'page.contact.form.name': 'الاسم الكامل',
  'page.contact.form.email': 'البريد الإلكتروني',
  'page.contact.form.phone': 'رقم الجوال',
  'page.contact.form.subject': 'الموضوع',
  'page.contact.form.message': 'الرسالة',
  'page.contact.form.submit': 'إرسال الرسالة',
  'page.contact.info.title': 'معلومات التواصل',
  'page.contact.hours.title': 'ساعات العمل',
  'page.contact.map.title': 'موقعنا على الخريطة',
  'page.contact.toast.success': 'تم إرسال رسالتك بنجاح!',
  'page.contact.toast.error': 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
  'page.contact.whatsapp': 'مرحباً، أود الاستفسار عن خدماتكم الهندسية',
  'page.contact.form.successBody1': 'شكراً لتواصلك معنا. تم حفظ رسالتك في نظامنا.',
  'page.contact.form.successBody2': 'سيتم إرسال تأكيد إلى بريدك الإلكتروني وسيتم الرد عليك في أقرب وقت.',
  'page.contact.form.sendAnother': 'إرسال رسالة أخرى',
  'page.contact.form.namePlaceholder': 'اكتب اسمك',
  'page.contact.form.messagePlaceholder': 'أخبرنا عن مشروعك...',
  'page.contact.form.subjectPlaceholder': 'موضوع الرسالة',
  'page.contact.info.phone': 'الهاتف',
  'page.contact.info.email': 'البريد الإلكتروني',
  'page.contact.info.location': 'الموقع',
  'page.contact.hours.body': 'الأحد - الخميس\n8:00 صباحاً - 5:00 مساءً',
  'page.contact.map.subtitle': 'يسعدنا زيارتكم في مقر الشركة',
  'page.contact.map.location': 'الرياض، المملكة العربية السعودية',
  'page.contact.whatsappLabel': 'تواصل عبر واتساب',
  'page.projects.hero.title': 'مشاريعنا',
  'page.projects.hero.subtitle':
    'محفظة متنوعة عبر التطوير والبنية والتجارة — نماذج حقيقية لقدرة EAM على تحويل الرؤية إلى واقع.',
  'page.projects.section.title': 'محفظة المشاريع',
  'page.projects.eyebrow': 'Portfolio',
  'page.projects.disclaimer': 'عرض تقديمي — قد لا يعكس السجل التشغيلي الكامل.',
  'page.projects.viewDetails': 'عرض التفاصيل',
  'page.projects.filter.all': 'الكل',
  'page.projects.filter.active': 'قيد التنفيذ',
  'page.projects.filter.completed': 'مكتمل',
  'page.projects.filter.upcoming': 'قادم',
  'page.projects.statTotal': 'إجمالي المشاريع',
  'page.projects.statActive': 'نشط حالياً',
  'page.projects.statCities': 'مدن',
  'page.projects.modal.location': 'الموقع',
  'page.projects.modal.year': 'السنة',
  'page.projects.modal.description': 'وصف المشروع',
  'page.projects.modal.gallery': 'معرض الصور',
  'page.projects.modal.downloadPdf': 'تحميل ملف تفاصيل المشروع (PDF)',
  'page.projects.deleteConfirm': 'هل أنت متأكد من حذف هذا المشروع؟',
  'page.projects.deleteSuccess': 'تم حذف المشروع بنجاح',
  'page.projects.addSuccess': 'تم إضافة المشروع بنجاح',
  'page.projects.modal.addTitle': 'إضافة مشروع جديد',
  'page.projects.empty': 'لا توجد مشاريع في هذا التصنيف.',
  'page.projects.addProject': 'إضافة مشروع',
  'page.invest.hero.title': 'استثمر معنا',
  'page.invest.hero.subtitle': 'فرص استثمارية مدروسة في قطاعات البناء والتطوير',
  'page.invest.section.title': 'المشاريع المتاحة',
  'page.invest.cta.title': 'هل لديك مشروع تريد عرضه للاستثمار؟',
  'page.invest.stats.projects': 'مشروع منجز',
  'page.invest.stats.volume': 'حجم الاستثمارات',
  'page.invest.stats.return': 'متوسط العائد',
  'page.invest.stats.partners': 'شريك نجاح',
  'page.invest.section.desc': 'اختر المشروع المناسب لك وتواصل معنا للحصول على تفاصيل أكثر',
  'page.invest.filter.all': 'الكل',
  'page.invest.filter.available': 'متاح للاستثمار',
  'page.invest.filter.inProgress': 'قيد التنفيذ',
  'page.invest.viewDetails': 'عرض التفاصيل',
  'page.invest.cta.desc': 'نرحب بشركاء النجاح. إذا كان لديك مشروع عقاري وترغب في عرضه للاستثمار، تواصل معنا وسنساعدك في تحقيق أهدافك',
  'page.invest.addProject': 'إضافة مشروع جديد',
  'page.invest.status.available': 'متاح للاستثمار',
  'page.invest.status.inProgress': 'قيد التنفيذ',
  'page.invest.status.completed': 'مكتمل',
  'page.market.hero.title': 'سوقنا',
  'page.market.hero.subtitle': 'سوق المنتجات والخدمات الهندسية',
  'page.market.comingSoon': 'قريباً',
  'page.market.body':
    'نعمل حالياً على تطوير سوق إلكتروني متكامل للمنتجات والخدمات الهندسية. سيتيح لكم السوق الوصول إلى مجموعة واسعة من المواد والأدوات والخدمات الهندسية المتخصصة.',
  'page.market.launchNote': 'سيتم الإطلاق قريباً - ترقبونا',
  'page.careers.hero.title': 'انضم إلى فريقنا',
  'page.careers.hero.subtitle': 'نرحب دائماً بالمواهب المتميزة. أرسل سيرتك الذاتية وسنتواصل معك عند توفر الفرصة المناسبة',
  'page.careers.apply.title': 'قدم طلبك الآن',
  'page.careers.form.desc': 'املأ النموذج أدناه وارفع سيرتك الذاتية',
  'page.careers.success.title': 'تم إرسال طلبك بنجاح!',
  'page.careers.success.body': 'سيتم فتح تطبيق البريد الإلكتروني لإرسال سيرتك الذاتية. شكراً لاهتمامك بالانضمام إلينا.',
  'page.team.hero.title': 'فريقنا',
  'page.team.hero.subtitle': 'نخبة من المهندسين والمتخصصين',
  'page.team.intro':
    'يضم فريقنا نخبة من المهندسين والمتخصصين ذوي الخبرات الواسعة في مختلف المجالات الهندسية، ملتزمين بتقديم أفضل الحلول لعملائنا.',
  'page.consultation.hero.title': 'طلب استشارة',
  'page.consultation.hero.subtitle': 'احصل على استشارة هندسية متخصصة من فريقنا',
  'page.consultation.form.title': 'أرسل طلبك',
  'page.consultation.form.type': 'نوع الاستشارة',
  'page.consultation.form.typePlaceholder': 'اختر نوع الاستشارة',
  'page.consultation.form.type.engineering': 'استشارة هندسية',
  'page.consultation.form.type.government': 'استشارة حكومية',
  'page.consultation.form.type.other': 'أخرى',
  'page.consultation.form.namePlaceholder': 'أدخل اسمك الكامل',
  'page.consultation.form.messagePlaceholder': 'اكتب تفاصيل طلبك هنا...',
  'page.consultation.form.submit': 'إرسال الطلب',
  'page.consultation.success.title': 'تم إرسال طلبك بنجاح!',
  'page.consultation.success.body1': 'شكراً لتواصلك معنا. تم حفظ طلبك في نظامنا.',
  'page.consultation.success.body2': 'سيتم إرسال تأكيد إلى بريدك الإلكتروني وسيتواصل معك فريقنا في أقرب وقت.',
  'page.consultation.success.sendAnother': 'إرسال طلب آخر',
  'page.consultation.toast.success': 'تم إرسال طلب الاستشارة بنجاح!',
  'page.consultation.toast.error': 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
  'page.engineering.hero.title': 'الخدمات الهندسية',
  'page.engineering.hero.subtitle': 'نقدم حلولاً هندسية متكاملة بأعلى معايير الجودة والاحترافية',
  'page.engineering.cta.title': 'هل تحتاج إلى خدمة هندسية؟',
  'page.engineering.cta.desc': 'فريقنا من المهندسين المتخصصين جاهز لمساعدتك في تحقيق مشروعك',
  'page.government.hero.title': 'الخدمات الحكومية',
  'page.government.hero.subtitle': 'نقدم خدمات حكومية شاملة لتسهيل إجراءاتكم العقارية والبنائية',
  'page.government.cta.title': 'هل تحتاج إلى خدمة حكومية؟',
  'page.government.cta.desc': 'فريقنا المتخصص جاهز لمساعدتك في جميع الإجراءات الحكومية',
  'page.contracting.hero.title': 'المقاولات',
  'page.contracting.hero.subtitle': 'خدمات مقاولات شاملة بأعلى معايير الجودة والاحترافية لتنفيذ مشاريعكم بنجاح',
  'page.contracting.cta.title': 'هل تحتاج إلى خدمات مقاولات؟',
  'page.contracting.cta.desc': 'فريقنا من المهندسين والمقاولين المتخصصين جاهز لتنفيذ مشروعك بأعلى جودة',
  'page.maintenance.hero.title': 'الصيانة والتشغيل',
  'page.maintenance.hero.subtitle': 'خدمات صيانة وتشغيل متكاملة تضمن استمرارية وكفاءة منشآتكم',
  'page.maintenance.cta.title': 'هل تحتاج إلى خدمات صيانة وتشغيل؟',
  'page.maintenance.cta.desc': 'نوفر لك حلول صيانة شاملة تحافظ على منشأتك بأفضل حالة تشغيلية',
  'page.red.hero.title': 'التطوير العقاري',
  'page.red.hero.subtitle': 'نحول رؤيتكم العقارية إلى واقع من خلال حلول تطوير متكاملة ومبتكرة',
  'page.red.cta.title': 'هل لديك مشروع عقاري؟',
  'page.red.cta.desc': 'دعنا نساعدك في تحويل فكرتك إلى مشروع عقاري ناجح ومربح',
  'page.rem.hero.title': 'التسويق العقاري',
  'page.rem.hero.subtitle': 'حلول تسويقية مبتكرة تضمن وصول مشروعك العقاري للعملاء المستهدفين',
  'page.rem.cta.title': 'هل تريد تسويق مشروعك العقاري؟',
  'page.rem.cta.desc': 'فريقنا التسويقي المتخصص جاهز لمساعدتك في الوصول لعملائك المستهدفين',
  'page.sector.notFound': 'القطاع غير موجود',
  'page.sector.body':
    'نعمل على إعداد المحتوى التفصيلي لهذا القطاع. تواصل معنا لمعرفة المزيد عن خدماتنا في هذا المجال.',
  'page.sector.startEc': 'ابدأ الاستشارة الهندسية',
  'page.sector.startBv': 'ابدأ رحلة بناء المنزل',
  'page.sector.startContracting': 'ابدأ رحلة جاهزية المقاولات',
  'page.sector.startValuation': 'ابدأ رحلة جاهزية التقييم العقاري',
  'page.sector.startMaintenance': 'ابدأ رحلة جاهزية الصيانة الذكية',
  'page.sector.startPm': 'ابدأ رحلة جاهزية إدارة المشروع',
  'page.sector.startFurnishing': 'ابدأ رحلة جاهزية التأثيث',
  'page.sector.startFm': 'ابدأ رحلة جاهزية إدارة المرافق',
  'page.sector.startGs': 'ابدأ رحلة الخدمات الحكومية',
  'page.sector.startRed': 'ابدأ رحلة التطوير العقاري',
  'page.sector.startRem': 'ابدأ رحلة التسويق العقاري',
  'page.sector.startBm': 'ابدأ رحلة مواد البناء',
  'page.sector.startEquipment': 'ابدأ رحلة المعدات',
  'page.sector.startInvestment': 'ابدأ رحلة الاستثمار',
  'page.sector.startFactories': 'ابدأ رحلة الموردين',
  'page.sector.startDelivery': 'ابدأ رحلة التسليم والضمان',
};

export const PAGE_MESSAGES_EN: PageMessageCatalog = {
  'brand.name': 'Emmar Al Asala Wa Al Muasara',
  'brand.nameShort': 'Emmar Al Asala Wa Al Muasara Engineering Consultancy',
  'brand.nameLatin': 'Emmar Al Asala Wa Al Muasara',
  'brand.logoAlt': 'Emmar Al Asala Wa Al Muasara',
  'aria.whatsapp': 'Chat on WhatsApp',
  'common.backHome': 'Back to home',
  'common.viewDetails': 'View details →',
  'common.learnMore': 'Learn more',
  'common.submit': 'Submit',
  'common.submitting': 'Sending...',
  'common.success': 'Submitted successfully!',
  'common.error': 'Something went wrong. Please try again.',
  'common.comingSoon': 'Coming soon',
  'common.contactUs': 'Contact us',
  'common.sendMessage': 'Send us a message',
  'common.needOurServices': 'Need our services?',
  'page.about.hero.title': 'About us',
  'page.about.hero.subtitle': 'Discover our story, vision, and values',
  'page.about.intro':
    'Emmar Al Asala Wa Al Muasara Engineering Consultancy was founded to set the standard in integrated engineering consulting — blending architectural heritage with modern design, powered by specialized engineers and consultants committed to turning client visions into landmark projects.',
  'page.about.commitments.title': 'Our commitments',
  'page.about.commitments.1': 'Highest quality standards on every project',
  'page.about.commitments.2': 'A team of specialized engineers and experts',
  'page.about.commitments.3': 'Latest global technologies and systems',
  'page.about.commitments.4': 'On-time delivery within budget',
  'page.about.commitments.5': 'After-sales service and comprehensive warranty',
  'page.about.values.title': 'Our values',
  'page.about.values.1.title': 'Certified quality',
  'page.about.values.1.desc': 'ISO-certified processes',
  'page.about.values.2.title': 'Clear vision',
  'page.about.values.2.desc': 'Aiming to lead regionally',
  'page.about.values.3.title': 'Sustainable growth',
  'page.about.values.3.desc': 'Consistent year-on-year growth since founding',
  'page.services.hero.title': 'Our services',
  'page.services.hero.subtitle':
    'Certified engineering consulting and specialized government services — with EAM sector platforms when you need them.',
  'page.services.intro':
    'We deliver design, supervision, engineering studies, and efficient municipal and government transactions — the core of EAM.',
  'page.services.platformGate':
    'Sixteen sector platforms and digital journeys are available through the emblem above — for expanding beyond core services.',
  'page.services.engineering.subtitle': 'Design, plans, supervision, and studies to approved standards',
  'page.services.engineering.viewAll': 'Engineering services page',
  'page.services.government.subtitle': 'Permits, deeds, violations, and municipal transactions',
  'page.services.government.viewAll': 'Government services page',
  'page.services.platforms.hero.title': 'EAM sector platforms',
  'page.services.platforms.hero.subtitle':
    '16 integrated sectors — from development and investment to execution and operations — on one platform.',
  'page.services.platforms.intro':
    'Each sector connects to a digital journey and the EAM smart assistant. Pick a sector or start your guided path.',
  'page.services.platforms.backToServices': 'Back to core services',
  'page.services.explore': 'Explore sector',
  'page.services.startJourney': 'Start journey',
  'page.services.filter.all': 'All sectors',
  'page.services.filter.develop': 'Development & investment',
  'page.services.filter.engineer': 'Engineering & delivery',
  'page.services.filter.operate': 'Operations & facilities',
  'page.services.filter.supply': 'Supply chain',
  'page.services.stat.sectors': 'Integrated sectors',
  'page.services.stat.sectorsValue': '16+',
  'page.services.stat.journeys': 'Digital journeys',
  'page.services.stat.journeysValue': '14+',
  'page.services.stat.platform': 'Unified platform',
  'page.services.stat.platformValue': '1',
  'page.services.grid.title': 'EAM platforms',
  'page.services.grid.subtitle': 'Choose a sector to explore services or start your guided journey',
  'page.services.unifiedPlatform.label': 'EAM comprehensive platform for construction sectors',
  'page.services.unifiedPlatform.aria': 'Go to the unified EAM sector platforms',
  'page.services.engineering.title': 'Engineering services',
  'page.services.government.title': 'Government services',
  'page.services.contracting.title': 'Contracting',
  'page.services.maintenance.title': 'Operations & maintenance',
  'page.services.development.title': 'Real estate development',
  'page.services.marketing.title': 'Real estate marketing',
  'page.services.cta.title': 'Need our services?',
  'page.services.cta.desc': 'Contact us today for a free consultation',
  'page.services.cta.button': 'Request a consultation',
  'page.contact.hero.title': 'Contact us',
  'page.contact.hero.subtitle': 'We are happy to hear from you anytime',
  'page.contact.form.title': 'Send us a message',
  'page.contact.form.successTitle': 'Your message was sent successfully!',
  'page.contact.form.name': 'Full name',
  'page.contact.form.email': 'Email',
  'page.contact.form.phone': 'Mobile number',
  'page.contact.form.subject': 'Subject',
  'page.contact.form.message': 'Message',
  'page.contact.form.submit': 'Send message',
  'page.contact.info.title': 'Contact information',
  'page.contact.hours.title': 'Working hours',
  'page.contact.map.title': 'Our location',
  'page.contact.toast.success': 'Your message was sent successfully!',
  'page.contact.toast.error': 'Failed to send your message. Please try again.',
  'page.contact.whatsapp': 'Hello, I would like to inquire about your engineering services',
  'page.contact.form.successBody1': 'Thank you for reaching out. Your message has been saved in our system.',
  'page.contact.form.successBody2': 'A confirmation will be sent to your email and we will reply as soon as possible.',
  'page.contact.form.sendAnother': 'Send another message',
  'page.contact.form.namePlaceholder': 'Enter your name',
  'page.contact.form.messagePlaceholder': 'Tell us about your project...',
  'page.contact.form.subjectPlaceholder': 'Message subject',
  'page.contact.info.phone': 'Phone',
  'page.contact.info.email': 'Email',
  'page.contact.info.location': 'Location',
  'page.contact.hours.body': 'Sunday – Thursday\n8:00 AM – 5:00 PM',
  'page.contact.map.subtitle': 'We welcome you to visit our office',
  'page.contact.map.location': 'Riyadh, Saudi Arabia',
  'page.contact.whatsappLabel': 'Chat on WhatsApp',
  'page.projects.hero.title': 'Our projects',
  'page.projects.hero.subtitle':
    'A diverse portfolio across development, infrastructure, and commercial work — real examples of EAM turning vision into delivery.',
  'page.projects.section.title': 'Project portfolio',
  'page.projects.eyebrow': 'Portfolio',
  'page.projects.disclaimer': 'Presentation only — may not reflect the full operational record.',
  'page.projects.viewDetails': 'View details',
  'page.projects.filter.all': 'All',
  'page.projects.filter.active': 'In progress',
  'page.projects.filter.completed': 'Completed',
  'page.projects.filter.upcoming': 'Upcoming',
  'page.projects.statTotal': 'Total projects',
  'page.projects.statActive': 'Currently active',
  'page.projects.statCities': 'Cities',
  'page.projects.modal.location': 'Location',
  'page.projects.modal.year': 'Year',
  'page.projects.modal.description': 'Project description',
  'page.projects.modal.gallery': 'Photo gallery',
  'page.projects.modal.downloadPdf': 'Download project details (PDF)',
  'page.projects.deleteConfirm': 'Are you sure you want to delete this project?',
  'page.projects.deleteSuccess': 'Project deleted successfully',
  'page.projects.addSuccess': 'Project added successfully',
  'page.projects.modal.addTitle': 'Add new project',
  'page.projects.empty': 'No projects in this category.',
  'page.projects.addProject': 'Add project',
  'page.invest.hero.title': 'Invest with us',
  'page.invest.hero.subtitle': 'Vetted investment opportunities in construction and development',
  'page.invest.section.title': 'Available opportunities',
  'page.invest.cta.title': 'Do you have a project to present for investment?',
  'page.invest.stats.projects': 'Completed projects',
  'page.invest.stats.volume': 'Investment volume',
  'page.invest.stats.return': 'Average return',
  'page.invest.stats.partners': 'Success partners',
  'page.invest.section.desc': 'Choose the right project and contact us for more details',
  'page.invest.filter.all': 'All',
  'page.invest.filter.available': 'Open for investment',
  'page.invest.filter.inProgress': 'In progress',
  'page.invest.viewDetails': 'View details',
  'page.invest.cta.desc': 'We welcome success partners. If you have a real estate project to present for investment, contact us and we will help you achieve your goals.',
  'page.invest.addProject': 'Add new project',
  'page.invest.status.available': 'Open for investment',
  'page.invest.status.inProgress': 'In progress',
  'page.invest.status.completed': 'Completed',
  'page.market.hero.title': 'Our market',
  'page.market.hero.subtitle': 'Marketplace for engineering products and services',
  'page.market.comingSoon': 'Coming soon',
  'page.market.body':
    'We are building an integrated marketplace for engineering products and services, giving you access to a wide range of specialized materials, tools, and services.',
  'page.market.launchNote': 'Launching soon — stay tuned',
  'page.careers.hero.title': 'Join our team',
  'page.careers.hero.subtitle': 'We always welcome outstanding talent. Send your CV and we will contact you when the right opportunity opens.',
  'page.careers.apply.title': 'Apply now',
  'page.careers.form.desc': 'Fill in the form below and upload your CV',
  'page.careers.success.title': 'Your application was sent successfully!',
  'page.careers.success.body': 'Your email app will open to send your CV. Thank you for your interest in joining us.',
  'page.team.hero.title': 'Our team',
  'page.team.hero.subtitle': 'A team of engineers and specialists',
  'page.team.intro':
    'Our team includes experienced engineers and specialists across engineering disciplines, committed to delivering the best solutions for our clients.',
  'page.consultation.hero.title': 'Request a consultation',
  'page.consultation.hero.subtitle': 'Get specialized engineering advice from our team',
  'page.consultation.form.title': 'Submit your request',
  'page.consultation.form.type': 'Consultation type',
  'page.consultation.form.typePlaceholder': 'Select consultation type',
  'page.consultation.form.type.engineering': 'Engineering consultation',
  'page.consultation.form.type.government': 'Government consultation',
  'page.consultation.form.type.other': 'Other',
  'page.consultation.form.namePlaceholder': 'Enter your full name',
  'page.consultation.form.messagePlaceholder': 'Describe your request here...',
  'page.consultation.form.submit': 'Submit request',
  'page.consultation.success.title': 'Your request was sent successfully!',
  'page.consultation.success.body1': 'Thank you for reaching out. Your request has been saved in our system.',
  'page.consultation.success.body2': 'A confirmation will be sent to your email and our team will contact you soon.',
  'page.consultation.success.sendAnother': 'Submit another request',
  'page.consultation.toast.success': 'Your consultation request was sent successfully!',
  'page.consultation.toast.error': 'Failed to send your request. Please try again.',
  'page.engineering.hero.title': 'Engineering services',
  'page.engineering.hero.subtitle': 'Integrated engineering solutions with the highest quality and professionalism',
  'page.engineering.cta.title': 'Need an engineering service?',
  'page.engineering.cta.desc': 'Our specialized engineers are ready to help you deliver your project',
  'page.government.hero.title': 'Government services',
  'page.government.hero.subtitle': 'Comprehensive government services to simplify your property and construction procedures',
  'page.government.cta.title': 'Need a government service?',
  'page.government.cta.desc': 'Our specialized team is ready to help with all government procedures',
  'page.contracting.hero.title': 'Contracting',
  'page.contracting.hero.subtitle': 'Full contracting services with the highest quality standards for successful project delivery',
  'page.contracting.cta.title': 'Need contracting services?',
  'page.contracting.cta.desc': 'Our engineers and contractors are ready to deliver your project to the highest standard',
  'page.maintenance.hero.title': 'Operations & maintenance',
  'page.maintenance.hero.subtitle': 'Integrated operations and maintenance services that keep your facilities running efficiently',
  'page.maintenance.cta.title': 'Need operations or maintenance services?',
  'page.maintenance.cta.desc': 'We provide comprehensive maintenance solutions that keep your facility in top operating condition',
  'page.red.hero.title': 'Real estate development',
  'page.red.hero.subtitle': 'We turn your real estate vision into reality through integrated, innovative development solutions',
  'page.red.cta.title': 'Do you have a real estate project?',
  'page.red.cta.desc': 'Let us help you turn your idea into a successful, profitable real estate project',
  'page.rem.hero.title': 'Real estate marketing',
  'page.rem.hero.subtitle': 'Innovative marketing solutions that reach your target buyers',
  'page.rem.cta.title': 'Want to market your real estate project?',
  'page.rem.cta.desc': 'Our marketing team is ready to help you reach your target audience',
  'page.sector.notFound': 'Sector not found',
  'page.sector.body':
    'We are preparing detailed content for this sector. Contact us to learn more about our services in this area.',
  'page.sector.startEc': 'Start engineering consultation',
  'page.sector.startBv': 'Start home-building journey',
  'page.sector.startContracting': 'Start contracting readiness journey',
  'page.sector.startValuation': 'Start valuation readiness journey',
  'page.sector.startMaintenance': 'Start smart maintenance journey',
  'page.sector.startPm': 'Start project management journey',
  'page.sector.startFurnishing': 'Start furnishing journey',
  'page.sector.startFm': 'Start facility management journey',
  'page.sector.startGs': 'Start government services journey',
  'page.sector.startRed': 'Start real estate development journey',
  'page.sector.startRem': 'Start real estate marketing journey',
  'page.sector.startBm': 'Start building materials journey',
  'page.sector.startEquipment': 'Start equipment journey',
  'page.sector.startInvestment': 'Start investment journey',
  'page.sector.startFactories': 'Start factories & suppliers journey',
  'page.sector.startDelivery': 'Start delivery & warranty journey',
};
