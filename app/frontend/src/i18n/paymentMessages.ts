/** Payment flow copy (Stripe Checkout for issued quotes). */

export type PaymentMessageKey =
  | 'payment.payNow'
  | 'payment.processing'
  | 'payment.paidBadge'
  | 'payment.paidNote'
  | 'payment.expiredNote'
  | 'payment.secureNote'
  | 'payment.errorGeneric'
  | 'payment.successTitle'
  | 'payment.successBody'
  | 'payment.successPending'
  | 'payment.cancelTitle'
  | 'payment.cancelBody'
  | 'payment.backToRequest'
  | 'payment.viewRequests'
  | 'payment.notConfigured'
  | 'payment.successFailed'
  | 'payment.quoteTitle'
  | 'payment.quoteValidUntil'
  | 'payment.subtotal'
  | 'payment.vat'
  | 'payment.total'
  | 'payment.contactFallback'
  | 'payment.viewReceipt'
  | 'payment.successRetryNote'
  | 'payment.webhookWarning'
  | 'payment.failedBadge'
  | 'payment.expiredBadge'
  | 'payment.successStillProcessing'
  | 'payment.successMissingSession'
  | 'payment.retryConfirm'
  | 'payment.tryAgainPay'
  | 'payment.quoteLoading'
  | 'payment.quoteError'
  | 'payment.stageAwaitingPayment'
  | 'payment.stageAwaitingPaymentDesc'
  | 'payment.stagePaid'
  | 'payment.stagePaidDesc'
  | 'payment.acceptQuote'
  | 'payment.acceptProcessing'
  | 'payment.acceptTermsNote';

export const PAYMENT_MESSAGES_AR: Record<PaymentMessageKey, string> = {
  'payment.payNow': 'ادفع الآن — دفع آمن',
  'payment.processing': 'جاري التحويل إلى الدفع…',
  'payment.paidBadge': 'تم الدفع',
  'payment.paidNote': 'شكراً — تم استلام دفعتك بنجاح.',
  'payment.expiredNote': 'انتهت صلاحية عرض السعر. تواصل مع فريق EAM لتجديد العرض.',
  'payment.secureNote': 'الدفع عبر Stripe — بطاقات مدى، Visa، Mastercard، Apple Pay، وغيرها حسب توفرها.',
  'payment.errorGeneric': 'تعذّر بدء الدفع. حاول مجدداً أو تواصل مع الدعم.',
  'payment.successTitle': 'تم الدفع بنجاح',
  'payment.successBody': 'تم تأكيد دفعتك. سيتابع فريق EAM تنفيذ طلبك.',
  'payment.successPending': 'جاري تأكيد الدفع…',
  'payment.cancelTitle': 'تم إلغاء الدفع',
  'payment.cancelBody': 'لم تكتمل عملية الدفع. يمكنك المحاولة مجدداً من صفحة الطلب.',
  'payment.backToRequest': 'العودة إلى الطلب',
  'payment.viewRequests': 'طلباتي',
  'payment.notConfigured': 'الدفع الإلكتروني قيد الإعداد — تواصل مع فريق EAM لإتمام الدفع.',
  'payment.successFailed': 'تعذّر تأكيد الدفع. إن خُصم المبلغ، تواصل مع الدعم مع رقم الطلب.',
  'payment.quoteTitle': 'عرض سعر',
  'payment.quoteValidUntil': 'صالح حتى',
  'payment.subtotal': 'المجموع الفرعي',
  'payment.vat': 'ضريبة القيمة المضافة (15%)',
  'payment.total': 'الإجمالي',
  'payment.contactFallback': 'للاستفسار تواصل مع فريق EAM.',
  'payment.viewReceipt': 'عرض إيصال Stripe',
  'payment.successRetryNote': 'جاري تأكيد الدفع — قد يستغرق بضع ثوانٍ بعد العودة من Stripe.',
  'payment.webhookWarning': 'Stripe مفعّل بدون webhook — قد يتأخر تأكيد الدفع.',
  'payment.failedBadge': 'فشل الدفع',
  'payment.expiredBadge': 'انتهت جلسة الدفع',
  'payment.successStillProcessing': 'الدفع قيد المعالجة — قد يستغرق تأكيد webhook بضع دقائق.',
  'payment.successMissingSession': 'رابط التأكيد غير مكتمل. افتح صفحة الطلب للتحقق من حالة الدفع.',
  'payment.retryConfirm': 'إعادة تأكيد الدفع',
  'payment.tryAgainPay': 'المحاولة مجدداً',
  'payment.quoteLoading': 'جاري تحميل عرض السعر…',
  'payment.quoteError': 'تعذّر تحميل عرض السعر.',
  'payment.stageAwaitingPayment': 'بانتظار الدفع',
  'payment.stageAwaitingPaymentDesc': 'عرض السعر جاهز — يمكنك إتمام الدفع الآمن أدناه.',
  'payment.stagePaid': 'تم الدفع',
  'payment.stagePaidDesc': 'تم استلام الدفع — يتابع فريق EAM تنفيذ طلبك.',
  'payment.acceptQuote': 'أقبل عرض السعر والشروط',
  'payment.acceptProcessing': 'جاري تسجيل القبول…',
  'payment.acceptTermsNote':
    'يُنشأ سجل عقد إلكتروني ومشروع تشغيلي — دون استبدال عقد موقّع عند طلب الجهة المنظمة.',
};

export const PAYMENT_MESSAGES_EN: Record<PaymentMessageKey, string> = {
  'payment.payNow': 'Pay now — secure checkout',
  'payment.processing': 'Redirecting to checkout…',
  'payment.paidBadge': 'Paid',
  'payment.paidNote': 'Thank you — your payment was received.',
  'payment.expiredNote': 'This quote has expired. Contact EAM to renew it.',
  'payment.secureNote': 'Powered by Stripe — mada, Visa, Mastercard, Apple Pay, and more when available.',
  'payment.errorGeneric': 'Could not start checkout. Try again or contact support.',
  'payment.successTitle': 'Payment successful',
  'payment.successBody': 'Your payment is confirmed. The EAM team will proceed with your request.',
  'payment.successPending': 'Confirming payment…',
  'payment.cancelTitle': 'Payment cancelled',
  'payment.cancelBody': 'Checkout was not completed. You can try again from your request page.',
  'payment.backToRequest': 'Back to request',
  'payment.viewRequests': 'My requests',
  'payment.notConfigured': 'Online checkout is being configured — contact EAM to complete payment.',
  'payment.successFailed': 'Could not confirm payment. If you were charged, contact support with your request ID.',
  'payment.quoteTitle': 'Quote',
  'payment.quoteValidUntil': 'Valid until',
  'payment.subtotal': 'Subtotal',
  'payment.vat': 'VAT (15%)',
  'payment.total': 'Total',
  'payment.contactFallback': 'Contact the EAM team for questions.',
  'payment.viewReceipt': 'View Stripe receipt',
  'payment.successRetryNote': 'Confirming payment — this may take a few seconds after returning from Stripe.',
  'payment.webhookWarning': 'Stripe is enabled without webhooks — payment confirmation may be delayed.',
  'payment.failedBadge': 'Payment failed',
  'payment.expiredBadge': 'Checkout expired',
  'payment.successStillProcessing': 'Payment is processing — webhook confirmation may take a few minutes.',
  'payment.successMissingSession': 'Confirmation link is incomplete. Open your request to check payment status.',
  'payment.retryConfirm': 'Retry confirmation',
  'payment.tryAgainPay': 'Try again',
  'payment.quoteLoading': 'Loading quote…',
  'payment.quoteError': 'Could not load quote.',
  'payment.stageAwaitingPayment': 'Awaiting payment',
  'payment.stageAwaitingPaymentDesc': 'Your quote is ready — complete secure checkout below.',
  'payment.stagePaid': 'Paid',
  'payment.stagePaidDesc': 'Payment received — the EAM team will proceed with your request.',
  'payment.acceptQuote': 'Accept quote and terms',
  'payment.acceptProcessing': 'Recording acceptance…',
  'payment.acceptTermsNote':
    'Creates an electronic contract record and operational project — does not replace a signed contract when required.',
};
