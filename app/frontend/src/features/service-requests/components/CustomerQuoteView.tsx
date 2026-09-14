import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  QUOTE_STATUS_LABELS,
  formatSar,
  getCustomerIssuedQuote,
} from '@/features/operations/api/quotesClient';
import {
  PaymentClientError,
  createQuoteCheckout,
  getQuotePaymentStatus,
} from '@/features/payments/api/paymentClient';

interface Props {
  requestId: number;
}

function formatDate(value?: string | null, locale = 'ar-SA'): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

export default function CustomerQuoteView({ requestId }: Props) {
  const { t, language } = useLanguage();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const dateLocale = language.startsWith('ar') ? 'ar-SA' : 'en-GB';

  const quoteQuery = useQuery({
    queryKey: ['customer', 'quote', requestId],
    queryFn: () => getCustomerIssuedQuote(requestId),
    retry: false,
  });

  const paymentQuery = useQuery({
    queryKey: ['customer', 'payment-status', requestId],
    queryFn: () => getQuotePaymentStatus(requestId),
    enabled: quoteQuery.isSuccess,
    retry: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => createQuoteCheckout(requestId),
    onMutate: () => setCheckoutError(null),
    onSuccess: (session) => {
      window.location.assign(session.url);
    },
    onError: (err) => {
      if (err instanceof PaymentClientError && err.code === 'not_configured') {
        setCheckoutError(t('payment.notConfigured'));
      } else if (err instanceof PaymentClientError && err.code === 'bad_request') {
        setCheckoutError(err.message || t('payment.errorGeneric'));
      } else {
        setCheckoutError(t('payment.errorGeneric'));
      }
    },
  });

  if (quoteQuery.isLoading || paymentQuery.isLoading) {
    return (
      <div
        id="quote"
        className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/5 p-5 text-sm text-ink-secondary"
      >
        <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden />
        {t('payment.quoteLoading')}
      </div>
    );
  }

  if (quoteQuery.isError) {
    return (
      <div
        id="quote"
        className="rounded-xl border border-red-300/50 bg-red-50/50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200"
      >
        {t('payment.quoteError')}
      </div>
    );
  }

  if (!quoteQuery.data) {
    return null;
  }

  const quote = quoteQuery.data;
  const payment = paymentQuery.data;
  const isPaid = payment?.paid || quote.status === 'paid';
  const canPay = payment?.can_pay && !isPaid;
  const paymentsEnabled = payment?.payments_enabled ?? false;
  const webhookGap = paymentsEnabled && payment?.webhook_configured === false;
  const awaitingOnlineSetup =
    paymentQuery.isSuccess && quote.status === 'issued' && !isPaid && !canPay && !paymentsEnabled;

  return (
    <div id="quote" className="rounded-xl border border-gold/25 bg-gold/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">
            {t('payment.quoteTitle')} — {quote.reference_code}
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            {QUOTE_STATUS_LABELS[quote.status] ?? quote.status} · {t('payment.quoteValidUntil')}{' '}
            {formatDate(quote.valid_until, dateLocale)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isPaid ? (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t('payment.paidBadge')}
            </span>
          ) : payment?.status === 'failed' ? (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
              {t('payment.failedBadge')}
            </span>
          ) : payment?.status === 'expired' ? (
            <span className="rounded-full bg-slate-500/15 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('payment.expiredBadge')}
            </span>
          ) : null}
        </div>
      </div>

      {webhookGap ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          {t('payment.webhookWarning')}
        </p>
      ) : null}

      {paymentQuery.isError ? (
        <p className="mt-3 text-xs text-destructive">{t('payment.quoteError')}</p>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm">
        {quote.line_items.map((item) => (
          <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-gold/10 pb-2">
            <span>{item.description}</span>
            <span>
              {item.quantity} × {formatSar(item.unit_price)} = {formatSar(item.line_total)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 text-sm">
        <p>
          {t('payment.subtotal')}: {formatSar(quote.subtotal)}
        </p>
        <p>
          {t('payment.vat')}: {formatSar(quote.vat_amount)}
        </p>
        <p className="text-base font-bold">
          {t('payment.total')}: {formatSar(quote.total_amount)}
        </p>
      </div>

      {isPaid ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{t('payment.paidNote')}</p>
          {payment?.receipt_url ? (
            <Button variant="outline" size="sm" asChild>
              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                {t('payment.viewReceipt')}
              </a>
            </Button>
          ) : null}
        </div>
      ) : canPay ? (
        <div className="mt-5 space-y-3">
          <Button
            className="w-full sm:w-auto"
            size="lg"
            disabled={checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate()}
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t('payment.processing')}
              </>
            ) : (
              t('payment.payNow')
            )}
          </Button>
          <p className="text-xs text-ink-muted">{t('payment.secureNote')}</p>
          {checkoutError ? <p className="text-xs text-destructive">{checkoutError}</p> : null}
        </div>
      ) : awaitingOnlineSetup ? (
        <p className="mt-3 text-xs text-ink-muted">{t('payment.notConfigured')}</p>
      ) : paymentQuery.isSuccess && !payment?.can_pay && quote.status === 'issued' ? (
        <p className="mt-3 text-xs text-ink-muted">{t('payment.expiredNote')}</p>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">{t('payment.contactFallback')}</p>
      )}
    </div>
  );
}
