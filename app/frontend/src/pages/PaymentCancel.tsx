import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentCancel() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const requestId = Number.parseInt(searchParams.get('request_id') ?? '', 10);
  const hasRequest = Number.isFinite(requestId);

  useEffect(() => {
    if (hasRequest) {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'payment-status', requestId] });
      void queryClient.invalidateQueries({ queryKey: ['customer', 'quote', requestId] });
    }
  }, [queryClient, hasRequest, requestId]);

  return (
    <Layout>
      <PageMeta title={t('payment.cancelTitle')} description={t('payment.cancelBody')} />
      <section className="py-20">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <h1 className="text-2xl font-bold text-ink dark:text-white">{t('payment.cancelTitle')}</h1>
          <p className="mt-4 text-ink-secondary">{t('payment.cancelBody')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {hasRequest ? (
              <>
                <Button asChild>
                  <Link to={`/my-requests/${requestId}#quote`}>{t('payment.tryAgainPay')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/my-requests/${requestId}`}>{t('payment.backToRequest')}</Link>
                </Button>
              </>
            ) : null}
            <Button variant={hasRequest ? 'outline' : 'default'} asChild>
              <Link to="/my-requests">{t('payment.viewRequests')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
