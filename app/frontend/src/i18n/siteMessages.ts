/** Site-wide shell copy (404, errors, auth, ops loading). */

export type SiteMessageKey =
  | 'site.notFound.title'
  | 'site.notFound.body'
  | 'site.skipToContent'
  | 'site.error.title'
  | 'site.error.body'
  | 'site.error.retry'
  | 'site.error.home'
  | 'site.error.myRequests'
  | 'site.loading'
  | 'auth.processing'
  | 'auth.error.title'
  | 'auth.error.returnHome'
  | 'auth.error.countdown'
  | 'auth.optionalLogin'
  | 'ops.loading'
  | 'ops.emptyList'
  | 'ops.loadError'
  | 'ops.notFound'
  | 'ops.retry'
  | 'customer.emptyRequests'
  | 'customer.exploreServices'
  | 'customer.invalidRequest'
  | 'journey.anonymousHint'
  | 'journey.completed'
  | 'journey.progress'
  | 'journey.continue'
  | 'journey.completeSubmit'
  | 'journey.selectPlaceholder'
  | 'journey.resumeHint'
  | 'journey.resumeButton'
  | 'journey.revisitError'
  | 'journey.completedSuccess'
  | 'journey.goToMyRequests'
  | 'journey.hydrating'
  | 'journey.confirm.scope'
  | 'journey.confirm.submit'
  | 'journey.option.urgency.standard'
  | 'journey.option.urgency.soon'
  | 'journey.option.urgency.urgent'
  | 'auth.logoutSuccess'
  | 'auth.logoutRedirect'
  | 'admin.verifying'
  | 'admin.deniedTitle'
  | 'admin.deniedBody'
  | 'admin.currentAccount'
  | 'admin.roleRegular'
  | 'admin.switchAccount'
  | 'admin.goBack'
  | 'ops.loadDetailError';

export const SITE_MESSAGES_AR: Record<SiteMessageKey, string> = {
  'site.notFound.title': 'الصفحة غير موجودة',
  'site.notFound.body': 'تعذّر العثور على الصفحة المطلوبة. تحقق من الرابط أو عد إلى الرئيسية.',
  'site.skipToContent': 'تخطي إلى المحتوى',
  'site.error.title': 'حدث خطأ غير متوقع',
  'site.error.body': 'تعذّر تحميل هذه الصفحة. جرّب تحديث المتصفح أو العودة للرئيسية.',
  'site.error.retry': 'إعادة المحاولة',
  'site.error.home': 'الرئيسية',
  'site.error.myRequests': 'طلباتي',
  'site.loading': 'جاري التحميل…',
  'auth.processing': 'جاري إتمام تسجيل الدخول…',
  'auth.error.title': 'خطأ في المصادقة',
  'auth.error.returnHome': 'العودة للرئيسية',
  'auth.error.countdown': 'سيتم التحويل للرئيسية خلال {seconds} ثانية',
  'auth.optionalLogin': 'تسجيل الدخول اختياري',
  'ops.loading': 'جاري تحميل الطلبات…',
  'ops.emptyList': 'لا توجد طلبات مطابقة للفلتر الحالي.',
  'ops.loadError': 'تعذّر تحميل قائمة الطلبات.',
  'ops.notFound': 'الطلب غير موجود أو لا يمكن الوصول إليه.',
  'ops.retry': 'إعادة المحاولة',
  'customer.emptyRequests': 'لم تُقدّم أي طلبات بعد',
  'customer.exploreServices': 'استكشف خدمات EAM وابدأ رحلة لإنشاء طلبك الأول.',
  'customer.invalidRequest': 'معرّف الطلب غير صالح.',
  'journey.anonymousHint': 'الرحلة متاحة بدون تسجيل —',
  'journey.completed': 'اكتملت الرحلة',
  'journey.progress': 'التقدم: {current} / {total}',
  'journey.continue': 'متابعة',
  'journey.completeSubmit': 'إنهاء وإرسال الطلب',
  'journey.selectPlaceholder': 'اختر…',
  'journey.resumeHint': 'لديك رحلة سابقة — يمكنك متابعتها من حيث توقفت.',
  'journey.resumeButton': 'متابعة الرحلة السابقة',
  'journey.revisitError': 'تعذّر العودة لتعديل هذا القسم.',
  'journey.completedSuccess': 'تم إرسال الطلب بنجاح.',
  'journey.goToMyRequests': 'الانتقال إلى طلباتي',
  'journey.hydrating': 'جاري تحميل الرحلة…',
  'journey.confirm.scope': 'أؤكد أن المعلومات المقدمة صحيحة إلى أفضل علمي.',
  'journey.confirm.submit': 'أؤكد رغبتي في إرسال الطلب للمراجعة المهنية.',
  'journey.option.urgency.standard': 'عادي',
  'journey.option.urgency.soon': 'قريباً',
  'journey.option.urgency.urgent': 'عاجل',
  'auth.logoutSuccess': 'تم تسجيل الخروج بنجاح',
  'auth.logoutRedirect': 'جاري التحويل للرئيسية…',
  'admin.verifying': 'جاري التحقق من الصلاحيات…',
  'admin.deniedTitle': 'صلاحيات غير كافية',
  'admin.deniedBody': 'الحساب الحالي لا يملك صلاحيات المسؤول.',
  'admin.currentAccount': 'الحساب الحالي:',
  'admin.roleRegular': 'مستخدم عادي',
  'admin.switchAccount': 'تبديل الحساب',
  'admin.goBack': 'رجوع',
  'ops.loadDetailError': 'تعذّر تحميل تفاصيل الطلب.',
};

export const SITE_MESSAGES_EN: Record<SiteMessageKey, string> = {
  'site.notFound.title': 'Page not found',
  'site.notFound.body': 'We could not find that page. Check the link or return home.',
  'site.skipToContent': 'Skip to content',
  'site.error.title': 'Something went wrong',
  'site.error.body': 'This page could not load. Try refreshing or return home.',
  'site.error.retry': 'Try again',
  'site.error.home': 'Home',
  'site.error.myRequests': 'My requests',
  'site.loading': 'Loading…',
  'auth.processing': 'Completing sign-in…',
  'auth.error.title': 'Authentication error',
  'auth.error.returnHome': 'Return home',
  'auth.error.countdown': 'Redirecting home in {seconds}s',
  'auth.optionalLogin': 'Sign in (optional)',
  'ops.loading': 'Loading requests…',
  'ops.emptyList': 'No requests match the current filters.',
  'ops.loadError': 'Could not load the request list.',
  'ops.notFound': 'Request not found or inaccessible.',
  'ops.retry': 'Retry',
  'customer.emptyRequests': 'No requests yet',
  'customer.exploreServices': 'Explore EAM services and start a journey to create your first request.',
  'customer.invalidRequest': 'Invalid request ID.',
  'journey.anonymousHint': 'This journey works without signing in —',
  'journey.completed': 'Journey completed',
  'journey.progress': 'Progress: {current} / {total}',
  'journey.continue': 'Continue',
  'journey.completeSubmit': 'Finish and submit',
  'journey.selectPlaceholder': 'Select…',
  'journey.resumeHint': 'You have a previous journey — pick up where you left off.',
  'journey.resumeButton': 'Resume previous journey',
  'journey.revisitError': 'Could not go back to edit that section.',
  'journey.completedSuccess': 'Your request was submitted successfully.',
  'journey.goToMyRequests': 'Go to my requests',
  'journey.hydrating': 'Loading journey…',
  'journey.confirm.scope': 'I confirm the information provided is accurate to the best of my knowledge.',
  'journey.confirm.submit': 'I confirm I want to submit this request for professional review.',
  'journey.option.urgency.standard': 'Standard',
  'journey.option.urgency.soon': 'Soon',
  'journey.option.urgency.urgent': 'Urgent',
  'auth.logoutSuccess': 'Signed out successfully',
  'auth.logoutRedirect': 'Redirecting to home…',
  'admin.verifying': 'Verifying permissions…',
  'admin.deniedTitle': 'Insufficient permissions',
  'admin.deniedBody': 'Your current account does not have administrator rights.',
  'admin.currentAccount': 'Current account:',
  'admin.roleRegular': 'Regular user',
  'admin.switchAccount': 'Switch account',
  'admin.goBack': 'Go back',
  'ops.loadDetailError': 'Could not load request details.',
};
