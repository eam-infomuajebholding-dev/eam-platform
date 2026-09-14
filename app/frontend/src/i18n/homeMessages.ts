/** Homepage, footer, assistant, sectors, and featured project copy. */

export type HomeMessageKey =
  | 'home.firstViewport.aria'
  | 'hero.aria'
  | 'hero.tagline'
  | 'hero.titleBefore'
  | 'hero.titleHighlight'
  | 'hero.subtitle'
  | 'hero.body'
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
  | 'about.aria'
  | 'about.title'
  | 'about.leadBold'
  | 'about.body'
  | 'about.value.excellence'
  | 'about.value.trust'
  | 'about.value.sustainability'
  | 'about.value.innovation'
  | 'about.cta'
  | 'about.mediaCaption'
  | 'platforms.title'
  | 'platforms.subtitle'
  | 'platforms.eyebrow'
  | 'platforms.stat'
  | 'platforms.explore'
  | 'platforms.aria'
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
  'assistant.header': 'مساعد ذكي — متابعة حرة أو رحلة مخصصة',
  'assistant.aria': 'مساحة العمل الذكية',
  'assistant.minimize': 'تصغير المساعد',
  'assistant.restore': 'فتح المساعد',
  'assistant.compactHint': 'اضغط لفتح المحادثة أو بدء رحلة',
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
  'about.aria': 'نبذة عن EAM',
  'about.title': 'EAM .. لإعمار حياة أفضل',
  'about.leadBold': 'منصة هندسية واستثمارية ورقمية متكاملة.',
  'about.body':
    'تجمع إعمار الأصالة والمعاصرة بين الاستشارات الهندسية، التطوير العقاري، الاستثمار، والخدمات التنفيذية في مسار واحد يربط الفكرة بالتسليم.',
  'about.value.excellence': 'التميّز',
  'about.value.trust': 'المصداقية',
  'about.value.sustainability': 'الاستدامة',
  'about.value.innovation': 'الابتكار',
  'about.cta': 'تعرّف على EAM',
  'about.mediaCaption': 'EAM في 90 ثانية — وسائط قابلة للاستبدال',
  'platforms.title': 'حلول متكاملة لرحلة أكثر نجاحاً',
  'platforms.subtitle':
    'عرض تفصيلي لمنصات EAM — استكشف كل قطاع وابدأ رحلتك من نقطة واحدة.',
  'platforms.eyebrow': 'منصات EAM',
  'platforms.stat': '16 منصة',
  'platforms.explore': 'استكشف',
  'platforms.aria': 'منصات EAM',
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
  'chat.placeholder.free': 'ما الذي تريد إنجازه اليوم؟',
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
  'chat.attachmentAdded': 'تم إرفاق الملف',
  'chat.enterJourney': 'الدخول للرحلة المخصصة',
  'chat.explore': 'استكشف',
  'chat.journeyComplete': 'تم إكمال رحلة جمع المعلومات بنجاح.',
  'chat.defaultDescription':
    'مساعد هندسي ذكي يساعدك في اختيار الخدمة المناسبة، وتقدير المتطلبات، وبدء رحلتك مع فريق إعمار.',
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
  'assistant.header': 'Smart assistant — free chat or guided journey',
  'assistant.aria': 'AI workspace',
  'assistant.minimize': 'Minimize assistant',
  'assistant.restore': 'Open assistant',
  'assistant.compactHint': 'Tap to open chat or start a journey',
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
  'about.aria': 'About EAM',
  'about.title': 'EAM — building a better life',
  'about.leadBold': 'An integrated engineering, investment, and digital platform.',
  'about.body':
    'Emmar Al Asala Wa Al Muasara brings engineering consulting, real estate development, investment, and execution services together in one path from idea to delivery.',
  'about.value.excellence': 'Excellence',
  'about.value.trust': 'Trust',
  'about.value.sustainability': 'Sustainability',
  'about.value.innovation': 'Innovation',
  'about.cta': 'Discover EAM',
  'about.mediaCaption': 'EAM in 90 seconds — replaceable media',
  'platforms.title': 'Integrated solutions for a more successful journey',
  'platforms.subtitle':
    'A detailed view of EAM platforms — explore each sector and start your journey from one hub.',
  'platforms.eyebrow': 'EAM Platforms',
  'platforms.stat': '16 platforms',
  'platforms.explore': 'Explore',
  'platforms.aria': 'EAM platforms',
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
  'chat.placeholder.free': 'What would you like to accomplish today?',
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
  'chat.attachmentAdded': 'File attached',
  'chat.enterJourney': 'Enter guided journey',
  'chat.explore': 'Explore',
  'chat.journeyComplete': 'The information-gathering journey was completed successfully.',
  'chat.defaultDescription':
    'A smart engineering assistant that helps you choose the right service, estimate requirements, and start your journey with the EAM team.',
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
