import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  verifyCheckoutSession,
  verifyCheckoutSessionOnce,
  type CheckoutVerifyResult,
} from '@/features/payments/api/paymentClient';
import { serviceRequestQueryKeys } from '@/features/service-requests/queryKeys';

type ConfirmPhase = 'loading' | 'confirmed' | 'processing' | 'failed' | 'missing_session';

function resolvePhase(result: CheckoutVerifyResult | null, error: boolean): ConfirmPhase {
  if (error) return 'failed';
  if (!result) return 'loading';
  if (result.paid) return 'confirmed';
  if (result.payment_status === 'unpaid' || result.status === 'open') {
    return 'processing';
  }
  return 'failed';
}

export default function PaymentSuccess() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [phase, setPhase] = useState<ConfirmPhase>(sessionId ? 'loading' : 'missing_session');
  const [requestId, setRequestId] = useState<number | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [manualRetrying, setManualRetrying] = useState(false);

  const applyResult = useCallback(
    (result: CheckoutVerifyResult) => {
      setRequestId(result.service_request_id ?? null);
      setReceiptUrl(result.receipt_url ?? null);
      setPhase(resolvePhase(result, false));
      if (result.service_request_id) {
        void queryClient.invalidateQueries({ queryKey: ['customer', 'quote', result.service_request_id] });
        void queryClient.invalidateQueries({
          queryKey: ['customer', 'payment-status', result.service_request_id],
        });
        void queryClient.invalidateQueries({
          queryKey: serviceRequestQueryKeys.detail(user?.id, result.service_request_id),
        });
      }
    },
    [queryClient, user?.id],
  );

  useEffect(() => {
    if (!sessionId) {
      setPhase('missing_session');
      return;
    }

    let cancelled = false;
    setPhase('loading');
    void verifyCheckoutSession(sessionId)
      .then((result) => {
        if (!cancelled) applyResult(result);
      })
      .catch(() => {
        if (!cancelled) setPhase('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [applyResult, sessionId]);

  const handleManualRetry = async () => {
    if (!sessionId) return;
    setManualRetrying(true);
    try {
      const result = await verifyCheckoutSessionOnce(sessionId);
      applyResult(result);
    } catch {
      setPhase('failed');
    } finally {
      setManualRetrying(false);
    }
  };

  const title =
    phase === 'loading'
      ? t('payment.successPending')
      : phase === 'confirmed'
        ? t('payment.successTitle')
        : phase === 'processing'
          ? t('payment.successPending')
          : phase === 'missing_session'
            ? t('payment.successFailed')
            : t('payment.successFailed');

  const body =
    phase === 'loading'
      ? t('payment.successRetryNote')
      : phase === 'confirmed'
        ? t('payment.successBody')
        : phase === 'processing'
          ? t('payment.successStillProcessing')
          : phase === 'missing_session'
            ? t('payment.successMissingSession')
            : t('payment.successFailed');

  const StatusIcon =
    phase === 'loading' || manualRetrying
      ? Loader2
      : phase === 'confirmed'
        ? CheckCircle2
        : phase === 'processing'
          ? Loader2
          : XCircle;

  return (
    <Layout>
      <PageMeta title={t('payment.successTitle')} description={t('payment.successBody')} />
      <section className="py-20">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <StatusIcon
            className={`mx-auto mb-4 h-14 w-14 ${
              phase === 'confirmed'
                ? 'text-emerald-600'
                : phase === 'failed' || phase === 'missing_session'
                  ? 'text-destructive'
                  : 'animate-spin text-gold'
            }`}
            aria-hidden
          />
          <h1 className="text-2xl font-bold text-ink dark:text-white">{title}</h1>
          <p className="mt-4 text-ink-secondary" role="status" aria-live="polite">
            {body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(phase === 'processing' || phase === 'failed') && sessionId ? (
              <Button type="button" disabled={manualRetrying} onClick={() => void handleManualRetry()}>
                {manualRetrying ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t('payment.successPending')}
                  </>
                ) : (
                  t('payment.retryConfirm')
                )}
              </Button>
            ) : null}
            {receiptUrl ? (
              <Button asChild>
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  {t('payment.viewReceipt')}
                </a>
              </Button>
            ) : null}
            {requestId ? (
              <Button variant={receiptUrl ? 'outline' : 'default'} asChild>
                <Link to={`/my-requests/${requestId}`}>{t('payment.backToRequest')}</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link to="/my-requests">{t('payment.viewRequests')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
