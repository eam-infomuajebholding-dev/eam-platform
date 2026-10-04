/** Homepage, footer, assistant, sectors, and featured project copy. */

export type HomeMessageKey =
  | 'home.firstViewport.aria'
  | 'hero.aria'
  | 'hero.tagline'
  | 'hero.titleBefore'
  | 'hero.titleHighlight'
  | 'hero.subtitle'
  | 'hero.body'
  | 'hero.replayPromo'
  | 'hero.promoCompanyAr'
  | 'hero.promoCompanyEn'
  | 'assistant.header'
  | 'assistant.aria'
  | 'assistant.minimize'
  | 'assistant.restore'
  | 'assistant.compactHint'
  | 'quickActions.aria'
  | 'quickActions.title'
  | 'quickActions.subtitle'
  | 'quickActions.createProject'
  | 'quickActions.engineering'
  | 'quickActions.investment'
  | 'quickActions.contractor'
  | 'quickActions.buildVilla'
  | 'quickActions.buyProduct'
  | 'sectors.title'
  | 'sectors.subtitle'
  | 'sectors.aria'
  | 'stats.aria'
  | 'stats.tagline'
  | 'stats.excellence.label'
  | 'stats.excellence.detail'
  | 'stats.trust.label'
  | 'stats.trust.detail'
  | 'stats.sustainability.label'
  | 'stats.sustainability.detail'
  | 'stats.innovation.label'
  | 'stats.innovation.detail'
  | 'home.engineering.aria'
  | 'home.engineering.title'
  | 'home.engineering.subtitle'
  | 'home.engineering.cta'
  | 'home.sectorPlatform.emblemAria'
  | 'home.sectorPlatform.emblemHint'
  | 'about.aria'
  | 'about.eyebrow'
  | 'about.headline'
  | 'about.taglineEn'
  | 'about.body'
  | 'about.cta'
  | 'oneStatement.aria'
  | 'oneStatement.eyebrow'
  | 'oneStatement.title'
  | 'oneStatement.taglineEn'
  | 'oneStatement.body'
  | 'oneStatement.pillar.engineering'
  | 'oneStatement.pillar.projectDelivery'
  | 'oneStatement.pillar.investment'
  | 'oneStatement.pillar.digital'
  | 'platforms.title'
  | 'platforms.subtitle'
  | 'platforms.eyebrow'
  | 'platforms.stat'
  | 'platforms.explore'
  | 'platforms.aria'
  | 'offer.aria'
  | 'midContent.aria'
  | 'midContent.number'
  | 'midContent.eyebrow'
  | 'midContent.metaAr'
  | 'midContent.metaEn'
  | 'midContent.title'
  | 'midContent.taglineEn'
  | 'midContent.pillar1.title'
  | 'midContent.pillar1.titleEn'
  | 'midContent.pillar1.desc'
  | 'midContent.pillar1.descEn'
  | 'midContent.pillar2.title'
  | 'midContent.pillar2.titleEn'
  | 'midContent.pillar2.desc'
  | 'midContent.pillar2.descEn'
  | 'midContent.pillar3.title'
  | 'midContent.pillar3.titleEn'
  | 'midContent.pillar3.desc'
  | 'midContent.pillar3.descEn'
  | 'midContent.pillar4.title'
  | 'midContent.pillar4.titleEn'
  | 'midContent.pillar4.desc'
  | 'midContent.pillar4.descEn'
  | 'midContent.pillar5.title'
  | 'midContent.pillar5.titleEn'
  | 'midContent.pillar5.desc'
  | 'midContent.pillar5.descEn'
  | 'offer.number'
  | 'offer.eyebrow'
  | 'offer.title'
  | 'offer.taglineEn'
  | 'offer.body'
  | 'offer.leadEn'
  | 'offer.card.engineering.title'
  | 'offer.card.engineering.titleEn'
  | 'offer.card.engineering.desc'
  | 'offer.card.projectDelivery.title'
  | 'offer.card.projectDelivery.titleEn'
  | 'offer.card.projectDelivery.desc'
  | 'offer.card.investment.title'
  | 'offer.card.investment.titleEn'
  | 'offer.card.investment.desc'
  | 'offer.card.digital.title'
  | 'offer.card.digital.titleEn'
  | 'offer.card.digital.desc'
  | 'offer.value.longTerm'
  | 'offer.value.sustainability'
  | 'offer.value.integration'
  | 'offer.value.clarity'
  | 'projects.title'
  | 'projects.subtitle'
  | 'projects.cta'
  | 'projects.aria'
  | 'projects.eyebrow'
  | 'projects.stat1.value'
  | 'projects.stat1.label'
  | 'projects.stat2.value'
  | 'projects.stat2.label'
  | 'projects.stat3.value'
  | 'projects.stat3.label'
  | 'project.viewDetails'
  | 'project.progressLabel'
  | 'project.status.active'
  | 'project.status.completed'
  | 'project.status.upcoming'
  | 'project.1.title'
  | 'project.1.location'
  | 'project.1.category'
  | 'project.1.summary'
  | 'project.2.title'
  | 'project.2.location'
  | 'project.2.category'
  | 'project.2.summary'
  | 'project.3.title'
  | 'project.3.location'
  | 'project.3.category'
  | 'project.3.summary'
  | 'project.4.title'
  | 'project.4.location'
  | 'project.4.category'
  | 'project.4.summary'
  | 'invest.title'
  | 'invest.body'
  | 'invest.cta'
  | 'invest.aria'
  | 'homeContact.title'
  | 'homeContact.body'
  | 'homeContact.ctaContact'
  | 'homeContact.ctaAbout'
  | 'homeContact.aria'
  | 'footer.logoAlt'
  | 'footer.companyName'
  | 'footer.description'
  | 'footer.quickLinks'
  | 'footer.moreLinks'
  | 'footer.team'
  | 'footer.consultation'
  | 'footer.newsletter.title'
  | 'footer.newsletter.body'
  | 'footer.newsletter.placeholder'
  | 'footer.newsletter.cta'
  | 'footer.copyright'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.editLink'
  | 'footer.editLinkPrompt'
  | 'chat.tab.free'
  | 'chat.tab.journey'
  | 'chat.placeholder.free'
  | 'chat.placeholder.journey'
  | 'chat.placeholder.journeyActive'
  | 'chat.journeyBanner'
  | 'chat.exitJourney'
  | 'chat.interactionAria'
  | 'chat.send'
  | 'chat.attach'
  | 'chat.voice'
  | 'chat.voiceListening'
  | 'chat.voiceUnsupported'
  | 'chat.voicePermissionDenied'
  | 'chat.voiceInsecure'
  | 'chat.voiceError'
  | 'chat.voiceNoSpeech'
  | 'chat.voiceNoSpeechRetry'
  | 'chat.voiceHoldHint'
  | 'chat.voiceRecording'
  | 'chat.voiceSlideToCancel'
  | 'chat.voiceSlideToCancelRtl'
  | 'chat.voiceReleaseToCancel'
  | 'chat.voicePreparing'
  | 'chat.attachmentAdded'
  | 'chat.enterJourney'
  | 'chat.explore'
  | 'chat.journeyComplete'
  | 'chat.defaultDescription'
  | 'chat.placeholder.general'
  | 'chat.brand'
  | 'sector.real-estate-development'
  | 'sector.real-estate-marketing'
  | 'sector.investment'
  | 'sector.build-villa'
  | 'sector.contracting'
  | 'sector.building-materials'
  | 'sector.equipment'
  | 'sector.factories-suppliers'
  | 'sector.real-estate-valuation'
  | 'sector.government-services'
  | 'sector.project-management'
  | 'sector.engineering-consulting'
  | 'sector.smart-maintenance'
  | 'sector.facility-management'
  | 'sector.furnishing'
  | 'sector.delivery-warranty'
  | 'sector.real-estate-development.desc'
  | 'sector.real-estate-marketing.desc'
  | 'sector.investment.desc'
  | 'sector.build-villa.desc'
  | 'sector.contracting.desc'
  | 'sector.building-materials.desc'
  | 'sector.equipment.desc'
  | 'sector.factories-suppliers.desc'
  | 'sector.real-estate-valuation.desc'
  | 'sector.government-services.desc'
  | 'sector.project-management.desc'
  | 'sector.engineering-consulting.desc'
  | 'sector.smart-maintenance.desc'
  | 'sector.facility-management.desc'
  | 'sector.furnishing.desc'
  | 'sector.delivery-warranty.desc';

export type HomeMessageCatalog = Record<HomeMessageKey, string>;

export const HOME_MESSAGES_AR: HomeMessageCatalog = {
  'home.firstViewport.aria': 'واجهة EAM الرئيسية',
  'hero.aria': 'من الفكرة إلى الأثر',
  'hero.tagline': 'EAM — إعمار الأصالة والمعاصرة',
  'hero.titleBefore': 'من الفكرة إلى',
  'hero.titleHighlight': 'الأثر',
  'hero.subtitle': 'منصة هندسية واستثمارية ورقمية متكاملة.',
  'hero.body':
    'تجمع الاستشارات، التطوير، التنفيذ، والاستثمار في مسار واحد — بدعم ذكاء EAM الذي يوجّه رحلتك من اللحظة الأولى.',
  'hero.replayPromo': 'إعادة الفيلم الدعائي',
  'hero.promoCompanyAr': 'إعمار الأصالة والمعاصرة للاستشارات الهندسية',
  'hero.promoCompanyEn': 'Emmar Al Asala Wa Al Muasara Engineering Consultancy',
  'assistant.header': 'EAM Copilot — فكّر معي بحرية',
  'assistant.aria': 'مساحة العمل الذكية',
  'assistant.minimize': 'تصغير المساعد',
  'assistant.restore': 'فتح المساعد',
  'assistant.compactHint': 'اضغط لفتح المحادثة',
  'quickActions.aria': 'اقتراحات سريعة',
  'quickActions.title': 'ابدأ من هنا',
  'quickActions.subtitle': 'مسارات جاهزة على المنصة',
  'quickActions.createProject': 'إنشاء مشروع',
  'quickActions.engineering': 'خدمات هندسية',
  'quickActions.investment': 'فرص استثمارية',
  'quickActions.contractor': 'مقاولات',
  'quickActions.buildVilla': 'بناء منزل',
  'quickActions.buyProduct': 'مواد بناء',
  'sectors.title': 'منصات الأعمال',
  'sectors.subtitle': '16 قطاعاً — مصدر واحد',
  'sectors.aria': 'منصات القطاعات',
  'stats.aria': 'قيم المنصة',
  'stats.tagline': 'مشاريع أكبر… أثر أعمق… مستقبل مستدام',
  'stats.excellence.label': 'تميّز هندسي',
  'stats.excellence.detail': 'معايير مهنية في كل مسار',
  'stats.trust.label': 'مصداقية',
  'stats.trust.detail': 'شفافية في التوجيه والمتابعة',
  'stats.sustainability.label': 'استدامة',
  'stats.sustainability.detail': 'قرارات تخدم الأثر طويل المدى',
  'stats.innovation.label': 'ابتكار',
  'stats.innovation.detail': 'ذكاء EAM يوجّه الرحلة من البداية',
  'home.engineering.aria': 'الخدمات الهندسية',
  'home.engineering.title': 'الخدمات الهندسية',
  'home.engineering.subtitle': 'جوهر EAM — استشارات وتصاميم وإشراف وفق معايير مهنية',
  'home.engineering.cta': 'كل الخدمات الهندسية',
  'home.sectorPlatform.emblemAria': 'منصة قطاعات EAM — اضغط الشعار للاستكشاف',
  'home.sectorPlatform.emblemHint': 'منصة القطاعات (خدمة إضافية)',
  'about.aria': 'من نحن — About EAM',
  'about.eyebrow': 'ABOUT EAM',
  'about.headline': 'خبرة تراكمت عبر مشاريع كبرى… لتصنع منصة للمستقبل',
  'about.taglineEn': 'Global experience. Engineering depth. A platform built for what comes next.',
  'about.body':
    'تأسست EAM على خبرة مهنية تراكمت عبر سنوات من العمل في المشاريع العالمية الضخمة والمتنوعة، لتقديم حلول هندسية واستثمارية ورقمية تواكب تطلعات المستقبل، تبني التميز وتصنع إرثًا يدوم.',
  'about.cta': 'اكتشف EAM',
  'oneStatement.aria': 'EAM في جملة واحدة',
  'oneStatement.eyebrow': 'EAM IN ONE STATEMENT',
  'oneStatement.title': 'نبني الثقة قبل أن نبني المشاريع',
  'oneStatement.taglineEn': 'Engineering certainty. Investment vision. Lasting value.',
  'oneStatement.body':
    'في إعمار الأصالة والمعاصرة، نجمع بين الخبرة الهندسية، وإدارة المشاريع، والرؤية الاستثمارية، والحلول الرقمية لتقديم قيمة تمتد من الفكرة الأولى حتى التشغيل والاستدامة.',
  'oneStatement.pillar.engineering': 'Engineering',
  'oneStatement.pillar.projectDelivery': 'Project Delivery',
  'oneStatement.pillar.investment': 'Investment',
  'oneStatement.pillar.digital': 'Digital Transformation',
  'platforms.title': 'حلول متكاملة لرحلة أكثر نجاحاً',
  'platforms.subtitle':
    'عرض تفصيلي لمنصات EAM — استكشف كل قطاع وابدأ رحلتك من نقطة واحدة.',
  'platforms.eyebrow': 'منصات EAM',
  'platforms.stat': '16 منصة',
  'platforms.explore': 'استكشف',
  'platforms.aria': 'منصات EAM',
  'offer.aria': 'ماذا نقدم',
  'midContent.aria': 'لماذا EAM — فارق EAM',
  'midContent.number': '05',
  'midContent.eyebrow': 'WHY EAM / THE EAM DIFFERENCE',
  'midContent.metaAr': 'خبرة تبني الثقة في القرار والتنفيذ',
  'midContent.metaEn': 'Experience that builds confidence in every decision',
  'midContent.title': 'من الاستشارة إلى القرار',
  'midContent.taglineEn': 'From technical insight to confident decisions',
  'midContent.pillar1.title': 'رؤية شاملة',
  'midContent.pillar1.titleEn': 'Holistic Perspective',
  'midContent.pillar1.desc': 'نرى المشروع منظومة متكاملة تشغيلياً واستثمارياً.',
  'midContent.pillar1.descEn':
    'We see the project as an integrated operational and investment ecosystem.',
  'midContent.pillar2.title': 'حوكمة القرار',
  'midContent.pillar2.titleEn': 'Decision Governance',
  'midContent.pillar2.desc': 'قرارات مبنية على بيانات ومراجعة دقيقة ومسؤوليات واضحة.',
  'midContent.pillar2.descEn':
    'Decisions are based on data, rigorous review and clearly defined accountabilities.',
  'midContent.pillar3.title': 'تكامل التخصصات',
  'midContent.pillar3.titleEn': 'Multi-disciplinary Integration',
  'midContent.pillar3.desc': 'الهندسة والإدارة والاستثمار والتقنية ضمن إطار واحد.',
  'midContent.pillar3.descEn':
    'Engineering, management, investment, and technology within a unified framework.',
  'midContent.pillar4.title': 'تركيز على التنفيذ',
  'midContent.pillar4.titleEn': 'Execution Focus',
  'midContent.pillar4.desc': 'الحلول لا تتوقف عند التقرير، بل تُصمَّم للتطبيق.',
  'midContent.pillar4.descEn':
    'Solutions do not end at the report, but are built to be implementable.',
  'midContent.pillar5.title': 'قيمة طويلة الأمد',
  'midContent.pillar5.titleEn': 'Long-term Value',
  'midContent.pillar5.desc': 'ننظر إلى الأصل ودورة حياته، لا إلى مرحلة البناء فقط.',
  'midContent.pillar5.descEn':
    'We look at the asset and its lifecycle, not just the construction phase.',
  'offer.number': '04',
  'offer.eyebrow': 'WHAT WE OFFER',
  'offer.title': 'ماذا نقدم',
  'offer.taglineEn': 'Integrated engineering and investment value',
  'offer.body':
    'نقدم في EAM منظومة خدمات متكاملة تربط بين الهندسة، التنفيذ، الاستثمار، والتحول الرقمي، بحيث لا تكون كل خدمة معزولة عن الأخرى، بل جزءاً من رؤية أشمل لصناعة قيمة مستدامة.',
  'offer.leadEn': 'A connected platform of services, not isolated offerings.',
  'offer.card.engineering.title': 'الاستشارات الهندسية',
  'offer.card.engineering.titleEn': 'Engineering Consultancy',
  'offer.card.engineering.desc':
    'حلول هندسية مدروسة تقود القرار من الفكرة إلى الاعتماد والتنفيذ.',
  'offer.card.projectDelivery.title': 'إدارة المشاريع والتنفيذ',
  'offer.card.projectDelivery.titleEn': 'Project Delivery',
  'offer.card.projectDelivery.desc':
    'إشراف وقيادة وضبط جودة يضمن وضوح المسار وكفاءة الإنجاز.',
  'offer.card.investment.title': 'الاستثمار والتطوير',
  'offer.card.investment.titleEn': 'Investment & Development',
  'offer.card.investment.desc':
    'رؤية استثمارية تربط الجدوى بالمكان والفرصة والنمو طويل الأمد.',
  'offer.card.digital.title': 'الحلول الرقمية والتحول',
  'offer.card.digital.titleEn': 'Digital Transformation',
  'offer.card.digital.desc':
    'أنظمة وأدوات رقمية ترفع الكفاءة وتدعم اتخاذ القرار والاستدامة التشغيلية.',
  'offer.value.longTerm': 'قيمة طويلة الأمد',
  'offer.value.sustainability': 'استدامة',
  'offer.value.integration': 'تكامل',
  'offer.value.clarity': 'وضوح',
  'projects.title': 'أبرز المشاريع',
  'projects.subtitle':
    'محفظة متنوعة عبر السكن والتجارة والصحة والبنية — عرض تقديمي يعكس قدرة EAM على ربط الفكرة بالتسليم.',
  'projects.cta': 'استكشف جميع المشاريع',
  'projects.aria': 'أبرز المشاريع',
  'projects.eyebrow': 'محفظة EAM',
  'projects.stat1.value': '48+',
  'projects.stat1.label': 'مشروعاً منجزاً',
  'projects.stat2.value': '12',
  'projects.stat2.label': 'مشروعاً نشطاً',
  'projects.stat3.value': '6',
  'projects.stat3.label': 'مدن',
  'project.viewDetails': 'عرض المشروع',
  'project.progressLabel': 'نسبة الإنجاز',
  'project.status.active': 'قيد التنفيذ',
  'project.status.completed': 'مكتمل',
  'project.status.upcoming': 'قريباً',
  'project.1.title': 'مشروع سكني فاخر',
  'project.1.location': 'الرياض',
  'project.1.category': 'سكني',
  'project.1.summary': 'فلل وشقق فاخرة في موقع استراتيجي — تصميم معاصر بمعايير استدامة عالية.',
  'project.2.title': 'مركز أعمال متكامل',
  'project.2.location': 'جدة',
  'project.2.category': 'تجاري',
  'project.2.summary': 'وجهة أعمال تجمع مكاتب ومرافق تجارية في قلب المدينة.',
  'project.3.title': 'مستشفى متخصص',
  'project.3.location': 'الدمام',
  'project.3.category': 'طبي',
  'project.3.summary': 'منشأة طبية متخصصة بأعلى معايير السلامة والتشغيل.',
  'project.4.title': 'برج تجاري',
  'project.4.location': 'الرياض',
  'project.4.category': 'أبراج',
  'project.4.summary': 'برج تجاري أيقوني في مرحلة ما قبل التشغيل — وجهة مستقبلية للأعمال.',
  'invest.title': 'استثمر في مستقبل واعد',
  'invest.body':
    'اكتشف مسارات الاستثمار والشراكة مع EAM — فرص مدروسة، شفافية في المتابعة، وربط بين رأس المال والمشاريع الحقيقية. لا عوائد مضمونة ولا وعود مالية غير موثقة.',
  'invest.cta': 'استكشف فرص الاستثمار',
  'invest.aria': 'الاستثمار',
  'homeContact.title': 'كن على اطلاع دائم',
  'homeContact.body':
    'تابع آخر تحديثات المنصة والفرص — تواصل معنا مباشرة دون اشتراك وهمي أو إرسال بيانات إلى نقطة نهاية غير مفعّلة.',
  'homeContact.ctaContact': 'تواصل معنا',
  'homeContact.ctaAbout': 'تعرّف على EAM',
  'homeContact.aria': 'كن على اطلاع',
  'footer.logoAlt': 'إعمار الأصالة والمعاصرة',
  'footer.companyName': 'إعمار الأصالة والمعاصرة للاستشارات الهندسية',
  'footer.description':
    'نقدم خدمات هندسية واستشارية متميزة تجمع بين الأصالة والمعاصرة لتحقيق رؤية عملائنا بأعلى معايير الجودة والاحترافية.',
  'footer.quickLinks': 'روابط سريعة',
  'footer.moreLinks': 'روابط إضافية',
  'footer.team': 'فريقنا',
  'footer.consultation': 'طلب استشارة',
  'footer.newsletter.title': 'النشرة البريدية',
  'footer.newsletter.body': 'اشترك للحصول على آخر الأخبار والمشاريع.',
  'footer.newsletter.placeholder': 'بريدك الإلكتروني',
  'footer.newsletter.cta': 'اشترك الآن',
  'footer.copyright': 'إعمار الأصالة والمعاصرة للاستشارات الهندسية. جميع الحقوق محفوظة.',
  'footer.privacy': 'سياسة الخصوصية',
  'footer.terms': 'الشروط والأحكام',
  'footer.editLink': 'تعديل رابط',
  'footer.editLinkPrompt': 'أدخل رابط',
  'chat.tab.free': 'متابعة حرة',
  'chat.tab.journey': 'رحلة مخصصة',
  'chat.placeholder.free': 'اسأل، فكّر، أو صف ما تبحث عنه…',
  'chat.placeholder.journey': 'صف احتياجك لبدء الرحلة المخصصة...',
  'chat.placeholder.journeyActive': 'أكمل الخطوات أعلاه للمتابعة...',
  'chat.journeyBanner': 'أنت في رحلة جمع المعلومات',
  'chat.exitJourney': 'خروج من الرحلة',
  'chat.interactionAria': 'نوع التفاعل مع المساعد',
  'chat.send': 'إرسال',
  'chat.attach': 'إرفاق',
  'chat.voice': 'صوت',
  'chat.voiceListening': 'جاري الاستماع...',
  'chat.voiceUnsupported': 'الإدخال الصوتي غير مدعوم في هذا المتصفح.',
  'chat.voicePermissionDenied': 'يُرجى السماح باستخدام الميكروفون من إعدادات المتصفح ثم المحاولة مرة أخرى.',
  'chat.voiceInsecure': 'الإدخال الصوتي يعمل فقط على اتصال آمن (HTTPS) أو أثناء التطوير المحلي.',
  'chat.voiceError': 'تعذّر بدء الاستماع. جرّب مرة أخرى أو اكتب رسالتك.',
  'chat.voiceNoSpeech': 'لم نلتقط صوتاً. اقترب من الميكروفون وحاول مرة أخرى.',
  'chat.voiceNoSpeechRetry': 'لم نسمع كلاماً — نعيد الاستماع…',
  'chat.voiceHoldHint': 'اضغط مطولاً للتحدث',
  'chat.voiceRecording': 'جاري التسجيل',
  'chat.voiceSlideToCancel': '← اسحب للإلغاء',
  'chat.voiceSlideToCancelRtl': 'اسحب للإلغاء →',
  'chat.voiceReleaseToCancel': 'أفلِت للإلغاء',
  'chat.voicePreparing': 'أبقِ الضغط… جاري تفعيل الميكروفون',
  'chat.attachmentAdded': 'تم إرفاق الملف',
  'chat.enterJourney': 'الدخول للرحلة المخصصة',
  'chat.explore': 'استكشف',
  'chat.journeyComplete': 'تم إكمال رحلة جمع المعلومات بنجاح.',
  'chat.defaultDescription':
    'مساعد ذكاء اصطناعي مفتوح — نفكّر معاً في أي موضوع؛ وعندما يلزم، نوجّهك لخدمات EAM دون قيود على الحوار.',
  'chat.placeholder.general': 'صف مشروعك أو اطرح سؤالك...',
  'chat.brand': 'EAM AI',
  'sector.real-estate-development': 'التطوير العقاري',
  'sector.real-estate-marketing': 'التسويق العقاري',
  'sector.investment': 'الاستثمار',
  'sector.build-villa': 'بناء منزل',
  'sector.contracting': 'المقاولات والتشييد',
  'sector.building-materials': 'مواد البناء',
  'sector.equipment': 'المعدات والآلات',
  'sector.factories-suppliers': 'المصانع والموردين',
  'sector.real-estate-valuation': 'التقييم العقاري',
  'sector.government-services': 'الخدمات الحكومية',
  'sector.project-management': 'إدارة المشاريع',
  'sector.engineering-consulting': 'الاستشارات الهندسية',
  'sector.smart-maintenance': 'التشغيل والصيانة الذكية',
  'sector.facility-management': 'إدارة المرافق',
  'sector.furnishing': 'التأثيث والتجهيز',
  'sector.delivery-warranty': 'التسليم وخدمات الملاك',
  'sector.real-estate-development.desc':
    'تطوير عقاري متكامل — من الفكرة والجدوى إلى التصميم والتسليم عبر مسار رقمي واحد.',
  'sector.real-estate-marketing.desc':
    'تسويق رقمي ومحتوى احترافي لإطلاق مشروعك والوصول لجمهورك المستهدف بسرعة.',
  'sector.investment.desc':
    'فرص استثمارية مدروسة ضمن محفظة مشاريع شفافة وقابلة للتوسع.',
  'sector.build-villa.desc':
    'رحلة مخصصة لبناء منزلك — تصميم، تراخيص، تنفيذ، ومتابعة حتى التسليم.',
  'sector.contracting.desc':
    'مقاولات وتشييد بإدارة مشروع متكاملة وجودة معتمدة وفق المواصفات.',
  'sector.building-materials.desc':
    'توريد مواد بناء بمواصفات معتمدة وسلسلة توريد قابلة للنمو مع مشروعك.',
  'sector.equipment.desc':
    'معدات وآلات للمشاريع مع تنسيق التوريد والتشغيل بكفاءة.',
  'sector.factories-suppliers.desc':
    'شبكة مصانع وموردين موثوقين لدعم مشاريعك على نطاق واسع.',
  'sector.real-estate-valuation.desc':
    'تقييم عقاري معتمد يدعم قراراتك الاستثمارية والتمويلية.',
  'sector.government-services.desc':
    'تراخيص وإجراءات حكومية — ننجزها بسرعة عبر خبرة إجرائية متخصصة.',
  'sector.project-management.desc':
    'إدارة مشروع شاملة: جدولة، تكلفة، جودة، ومتابعة لحظية.',
  'sector.engineering-consulting.desc':
    'استشارات وتصاميم هندسية معتمدة وفق الكود السعودي — من المخطط إلى الإشراف.',
  'sector.smart-maintenance.desc':
    'تشغيل وصيانة ذكية بعقود مرنة واستجابة سريعة للطوارئ.',
  'sector.facility-management.desc':
    'إدارة مرافق متكاملة لضمان كفاءة تشغيل منشآتك يومياً.',
  'sector.furnishing.desc':
    'تأثيث وتجهيز داخلي يرفع قيمة المشروع وتجربة الساكن.',
  'sector.delivery-warranty.desc':
    'تسليم، ضمان، وخدمات ما بعد البيع — راحة المالك بعد الإنجاز.',
};

export const HOME_MESSAGES_EN: HomeMessageCatalog = {
  'home.firstViewport.aria': 'EAM homepage',
  'hero.aria': 'From idea to impact',
  'hero.tagline': 'EAM — Emmar Al Asala Wa Al Muasara',
  'hero.titleBefore': 'From idea to',
  'hero.titleHighlight': 'impact',
  'hero.subtitle': 'An integrated engineering, investment, and digital platform.',
  'hero.body':
    'Consulting, development, execution, and investment in one path — guided by EAM intelligence from the very first step.',
  'hero.replayPromo': 'Replay brand film',
  'hero.promoCompanyAr': 'إعمار الأصالة والمعاصرة للاستشارات الهندسية',
  'hero.promoCompanyEn': 'Emmar Al Asala Wa Al Muasara Engineering Consultancy',
  'assistant.header': 'EAM Copilot — think openly with me',
  'assistant.aria': 'AI workspace',
  'assistant.minimize': 'Minimize assistant',
  'assistant.restore': 'Open assistant',
  'assistant.compactHint': 'Tap to open chat',
  'quickActions.aria': 'Quick suggestions',
  'quickActions.title': 'Start here',
  'quickActions.subtitle': 'Ready paths on the platform',
  'quickActions.createProject': 'Start a project',
  'quickActions.engineering': 'Engineering services',
  'quickActions.investment': 'Investment opportunities',
  'quickActions.contractor': 'Contracting',
  'quickActions.buildVilla': 'Build a home',
  'quickActions.buyProduct': 'Building materials',
  'sectors.title': 'Business platforms',
  'sectors.subtitle': '16 sectors — one source',
  'sectors.aria': 'Sector platforms',
  'stats.aria': 'Platform values',
  'stats.tagline': 'Bigger projects… deeper impact… a sustainable future',
  'stats.excellence.label': 'Engineering excellence',
  'stats.excellence.detail': 'Professional standards on every path',
  'stats.trust.label': 'Trust',
  'stats.trust.detail': 'Transparency in guidance and follow-up',
  'stats.sustainability.label': 'Sustainability',
  'stats.sustainability.detail': 'Decisions that serve long-term impact',
  'stats.innovation.label': 'Innovation',
  'stats.innovation.detail': 'EAM intelligence guides the journey from day one',
  'home.engineering.aria': 'Engineering services',
  'home.engineering.title': 'Engineering services',
  'home.engineering.subtitle': 'The core of EAM — design, studies, and supervision',
  'home.engineering.cta': 'All engineering services',
  'home.sectorPlatform.emblemAria': 'EAM sector platform — tap the emblem to explore',
  'home.sectorPlatform.emblemHint': 'Sector platform (extended service)',
  'about.aria': 'About EAM',
  'about.eyebrow': 'ABOUT EAM',
  'about.headline': 'Experience built on major projects… shaping a platform for the future',
  'about.taglineEn': 'Global experience. Engineering depth. A platform built for what comes next.',
  'about.body':
    'EAM was founded on professional expertise accumulated through years of work on large, diverse global projects — delivering engineering, investment, and digital solutions that meet future ambitions, build excellence, and create lasting legacy.',
  'about.cta': 'Discover EAM',
  'oneStatement.aria': 'EAM in One Statement',
  'oneStatement.eyebrow': 'EAM IN ONE STATEMENT',
  'oneStatement.title': 'We build trust before we build projects',
  'oneStatement.taglineEn': 'Engineering certainty. Investment vision. Lasting value.',
  'oneStatement.body':
    'At Emmar Al Asala Wa Al Muasara, we combine engineering expertise, project management, investment vision, and digital solutions to deliver value from the first idea through operations and sustainability.',
  'oneStatement.pillar.engineering': 'Engineering',
  'oneStatement.pillar.projectDelivery': 'Project Delivery',
  'oneStatement.pillar.investment': 'Investment',
  'oneStatement.pillar.digital': 'Digital Transformation',
  'platforms.title': 'Integrated solutions for a more successful journey',
  'platforms.subtitle':
    'A detailed view of EAM platforms — explore each sector and start your journey from one hub.',
  'platforms.eyebrow': 'EAM Platforms',
  'platforms.stat': '16 platforms',
  'platforms.explore': 'Explore',
  'platforms.aria': 'EAM platforms',
  'offer.aria': 'What we offer',
  'midContent.aria': 'Why EAM — the EAM difference',
  'midContent.number': '05',
  'midContent.eyebrow': 'WHY EAM / THE EAM DIFFERENCE',
  'midContent.metaAr': 'خبرة تبني الثقة في القرار والتنفيذ',
  'midContent.metaEn': 'Experience that builds confidence in every decision',
  'midContent.title': 'From insight to decision',
  'midContent.taglineEn': 'From technical insight to confident decisions',
  'midContent.pillar1.title': 'Holistic perspective',
  'midContent.pillar1.titleEn': 'Holistic Perspective',
  'midContent.pillar1.desc':
    'We see the project as an integrated operational and investment ecosystem.',
  'midContent.pillar1.descEn':
    'We see the project as an integrated operational and investment ecosystem.',
  'midContent.pillar2.title': 'Decision governance',
  'midContent.pillar2.titleEn': 'Decision Governance',
  'midContent.pillar2.desc':
    'Decisions are based on data, rigorous review and clearly defined accountabilities.',
  'midContent.pillar2.descEn':
    'Decisions are based on data, rigorous review and clearly defined accountabilities.',
  'midContent.pillar3.title': 'Multi-disciplinary integration',
  'midContent.pillar3.titleEn': 'Multi-disciplinary Integration',
  'midContent.pillar3.desc':
    'Engineering, management, investment, and technology within a unified framework.',
  'midContent.pillar3.descEn':
    'Engineering, management, investment, and technology within a unified framework.',
  'midContent.pillar4.title': 'Execution focus',
  'midContent.pillar4.titleEn': 'Execution Focus',
  'midContent.pillar4.desc':
    'Solutions do not end at the report, but are built to be implementable.',
  'midContent.pillar4.descEn':
    'Solutions do not end at the report, but are built to be implementable.',
  'midContent.pillar5.title': 'Long-term value',
  'midContent.pillar5.titleEn': 'Long-term Value',
  'midContent.pillar5.desc':
    'We look at the asset and its lifecycle, not just the construction phase.',
  'midContent.pillar5.descEn':
    'We look at the asset and its lifecycle, not just the construction phase.',
  'offer.number': '04',
  'offer.eyebrow': 'WHAT WE OFFER',
  'offer.title': 'What we offer',
  'offer.taglineEn': 'Integrated engineering and investment value',
  'offer.body':
    'At EAM we deliver an integrated service system linking engineering, execution, investment, and digital transformation — each capability part of a wider vision for sustainable value, not a standalone silo.',
  'offer.leadEn': 'A connected platform of services, not isolated offerings.',
  'offer.card.engineering.title': 'Engineering consultancy',
  'offer.card.engineering.titleEn': 'Engineering Consultancy',
  'offer.card.engineering.desc':
    'Rigorous engineering that guides decisions from concept through approval and delivery.',
  'offer.card.projectDelivery.title': 'Project management & delivery',
  'offer.card.projectDelivery.titleEn': 'Project Delivery',
  'offer.card.projectDelivery.desc':
    'Supervision, leadership, and quality control for a clear path and efficient delivery.',
  'offer.card.investment.title': 'Investment & development',
  'offer.card.investment.titleEn': 'Investment & Development',
  'offer.card.investment.desc':
    'Investment vision that connects feasibility, place, opportunity, and long-term growth.',
  'offer.card.digital.title': 'Digital solutions & transformation',
  'offer.card.digital.titleEn': 'Digital Transformation',
  'offer.card.digital.desc':
    'Digital systems and tools that raise efficiency and support decisions and operational sustainability.',
  'offer.value.longTerm': 'Long-term value',
  'offer.value.sustainability': 'Sustainability',
  'offer.value.integration': 'Integration',
  'offer.value.clarity': 'Clarity',
  'projects.title': 'Featured projects',
  'projects.subtitle':
    'A diverse portfolio across residential, commercial, healthcare, and infrastructure — a presentation of EAM’s ability to connect vision to delivery.',
  'projects.cta': 'Explore all projects',
  'projects.aria': 'Featured projects',
  'projects.eyebrow': 'EAM Portfolio',
  'projects.stat1.value': '48+',
  'projects.stat1.label': 'Projects delivered',
  'projects.stat2.value': '12',
  'projects.stat2.label': 'Active projects',
  'projects.stat3.value': '6',
  'projects.stat3.label': 'Cities',
  'project.viewDetails': 'View project',
  'project.progressLabel': 'Progress',
  'project.status.active': 'In progress',
  'project.status.completed': 'Completed',
  'project.status.upcoming': 'Coming soon',
  'project.1.title': 'Luxury residential project',
  'project.1.location': 'Riyadh',
  'project.1.category': 'Residential',
  'project.1.summary':
    'Premium villas and apartments in a strategic location — contemporary design with high sustainability standards.',
  'project.2.title': 'Integrated business center',
  'project.2.location': 'Jeddah',
  'project.2.category': 'Commercial',
  'project.2.summary': 'A business destination combining offices and retail in the heart of the city.',
  'project.3.title': 'Specialized hospital',
  'project.3.location': 'Dammam',
  'project.3.category': 'Healthcare',
  'project.3.summary': 'A specialized medical facility built to the highest safety and operational standards.',
  'project.4.title': 'Commercial tower',
  'project.4.location': 'Riyadh',
  'project.4.category': 'Towers',
  'project.4.summary': 'An iconic commercial tower in pre-operation phase — a future business landmark.',
  'invest.title': 'Invest in a promising future',
  'invest.body':
    'Discover investment and partnership paths with EAM — vetted opportunities, transparent follow-up, and a link between capital and real projects. No guaranteed returns or unverified financial promises.',
  'invest.cta': 'Explore investment opportunities',
  'invest.aria': 'Investment',
  'homeContact.title': 'Stay informed',
  'homeContact.body':
    'Follow the latest platform updates and opportunities — contact us directly without fake subscriptions or sending data to inactive endpoints.',
  'homeContact.ctaContact': 'Contact us',
  'homeContact.ctaAbout': 'Discover EAM',
  'homeContact.aria': 'Stay informed',
  'footer.logoAlt': 'Emmar Al Asala Wa Al Muasara',
  'footer.companyName': 'Emmar Al Asala Wa Al Muasara Engineering Consultancy',
  'footer.description':
    'We deliver distinguished engineering and consulting services that combine heritage and modernity to achieve our clients’ vision with the highest standards of quality and professionalism.',
  'footer.quickLinks': 'Quick links',
  'footer.moreLinks': 'More links',
  'footer.team': 'Our team',
  'footer.consultation': 'Request a consultation',
  'footer.newsletter.title': 'Newsletter',
  'footer.newsletter.body': 'Subscribe for the latest news and projects.',
  'footer.newsletter.placeholder': 'Your email address',
  'footer.newsletter.cta': 'Subscribe now',
  'footer.copyright': 'Emmar Al Asala Wa Al Muasara Engineering Consultancy. All rights reserved.',
  'footer.privacy': 'Privacy policy',
  'footer.terms': 'Terms and conditions',
  'footer.editLink': 'Edit link',
  'footer.editLinkPrompt': 'Enter link for',
  'chat.tab.free': 'Free chat',
  'chat.tab.journey': 'Guided journey',
  'chat.placeholder.free': 'Ask, explore, or describe what you’re looking for…',
  'chat.placeholder.journey': 'Describe your need to start the guided journey...',
  'chat.placeholder.journeyActive': 'Complete the steps above to continue...',
  'chat.journeyBanner': 'You are in an information-gathering journey',
  'chat.exitJourney': 'Exit journey',
  'chat.interactionAria': 'Assistant interaction mode',
  'chat.send': 'Send',
  'chat.attach': 'Attach',
  'chat.voice': 'Voice',
  'chat.voiceListening': 'Listening...',
  'chat.voiceUnsupported': 'Voice input is not supported in this browser.',
  'chat.voicePermissionDenied': 'Allow microphone access in your browser settings, then try again.',
  'chat.voiceInsecure': 'Voice input requires a secure connection (HTTPS) or local development.',
  'chat.voiceError': 'Could not start listening. Try again or type your message.',
  'chat.voiceNoSpeech': 'No speech detected. Move closer to the microphone and try again.',
  'chat.voiceNoSpeechRetry': 'No speech heard — listening again…',
  'chat.voiceHoldHint': 'Hold to talk',
  'chat.voiceRecording': 'Recording',
  'chat.voiceSlideToCancel': 'Slide left to cancel ←',
  'chat.voiceSlideToCancelRtl': 'Slide right to cancel →',
  'chat.voiceReleaseToCancel': 'Release to cancel',
  'chat.voicePreparing': 'Keep holding… enabling microphone',
  'chat.attachmentAdded': 'File attached',
  'chat.enterJourney': 'Enter guided journey',
  'chat.explore': 'Explore',
  'chat.journeyComplete': 'The information-gathering journey was completed successfully.',
  'chat.defaultDescription':
    'An open AI copilot — explore any topic together; when it fits, we guide you to EAM services without limiting the conversation.',
  'chat.placeholder.general': 'Describe your project or ask a question...',
  'chat.brand': 'EAM AI',
  'sector.real-estate-development': 'Real estate development',
  'sector.real-estate-marketing': 'Real estate marketing',
  'sector.investment': 'Investment',
  'sector.build-villa': 'Build a home',
  'sector.contracting': 'Contracting & construction',
  'sector.building-materials': 'Building materials',
  'sector.equipment': 'Equipment & machinery',
  'sector.factories-suppliers': 'Factories & suppliers',
  'sector.real-estate-valuation': 'Real estate valuation',
  'sector.government-services': 'Government services',
  'sector.project-management': 'Project management',
  'sector.engineering-consulting': 'Engineering consulting',
  'sector.smart-maintenance': 'Smart operations & maintenance',
  'sector.facility-management': 'Facility management',
  'sector.furnishing': 'Furnishing & fit-out',
  'sector.delivery-warranty': 'Handover & owner services',
  'sector.real-estate-development.desc':
    'End-to-end real estate development — from concept and feasibility to design and delivery on one digital path.',
  'sector.real-estate-marketing.desc':
    'Digital marketing and professional content to launch your project and reach your target audience faster.',
  'sector.investment.desc':
    'Vetted investment opportunities within a transparent, scalable project portfolio.',
  'sector.build-villa.desc':
    'A guided home-building journey — design, licensing, execution, and handover support.',
  'sector.contracting.desc':
    'Construction and contracting with integrated project management and certified quality.',
  'sector.building-materials.desc':
    'Certified building materials supply with a supply chain that scales with your project.',
  'sector.equipment.desc':
    'Project equipment and machinery with coordinated sourcing and operations.',
  'sector.factories-suppliers.desc':
    'A trusted factory and supplier network to support projects at scale.',
  'sector.real-estate-valuation.desc':
    'Certified valuation to support investment and financing decisions.',
  'sector.government-services.desc':
    'Licenses and government procedures — delivered fast with specialized regulatory expertise.',
  'sector.project-management.desc':
    'Full project management: schedule, cost, quality, and live progress tracking.',
  'sector.engineering-consulting.desc':
    'Certified engineering consulting and designs per Saudi building code — plans through supervision.',
  'sector.smart-maintenance.desc':
    'Smart operations and maintenance with flexible contracts and rapid emergency response.',
  'sector.facility-management.desc':
    'Integrated facility management for efficient day-to-day building operations.',
  'sector.furnishing.desc':
    'Interior furnishing and fit-out that elevates project value and occupant experience.',
  'sector.delivery-warranty.desc':
    'Handover, warranty, and after-sales services — owner peace of mind after completion.',
};

export function sectorMessageKey(slug: string): HomeMessageKey {
  return `sector.${slug}` as HomeMessageKey;
}

export function sectorDescMessageKey(slug: string): HomeMessageKey {
  return `sector.${slug}.desc` as HomeMessageKey;
}

export function projectMessageKey(
  id: number,
  field: 'title' | 'location' | 'category' | 'summary',
): HomeMessageKey {
  return `project.${id}.${field}` as HomeMessageKey;
}
