import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getCustomerCommercialEngagement } from '@/features/service-requests/api/serviceRequestClient';
import { getOperationsCommercialEngagement } from '@/features/operations/api/operationsClient';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  serviceRequestId: number;
  audience: 'customer' | 'ops';
}

function formatDate(value?: string | null, locale = 'ar-SA'): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export default function CommercialEngagementPanel({ serviceRequestId, audience }: Props) {
  const { t, language } = useLanguage();
  const dateLocale = language.startsWith('ar') ? 'ar-SA' : 'en-GB';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['commercial-engagement', audience, serviceRequestId],
    queryFn: () =>
      audience === 'ops'
        ? getOperationsCommercialEngagement(serviceRequestId)
        : getCustomerCommercialEngagement(serviceRequestId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-ink-secondary">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {t('payment.engagementLoading')}
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
      <h3 className="text-lg font-bold text-ink dark:text-white">{t('payment.engagementTitle')}</h3>
      <p className="mt-1 text-xs text-ink-muted">{t('payment.engagementNote')}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {data.contract_reference ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-muted">{t('payment.contractRef')}</dt>
            <dd className="font-semibold text-ink">{data.contract_reference}</dd>
          </div>
        ) : null}
        {data.contract_accepted_at ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-muted">{t('payment.contractAcceptedAt')}</dt>
            <dd>{formatDate(data.contract_accepted_at, dateLocale)}</dd>
          </div>
        ) : null}
        {data.operational_project_reference ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-muted">{t('payment.operationalProjectRef')}</dt>
            <dd className="font-semibold text-ink">{data.operational_project_reference}</dd>
          </div>
        ) : null}
        {data.operational_project_status ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-muted">{t('payment.operationalProjectStatus')}</dt>
            <dd>{data.operational_project_status}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
