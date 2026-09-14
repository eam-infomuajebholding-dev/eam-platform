import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getCustomerWorkspace } from '@/features/customer-workspace/api/customer360Client';
import { customer360QueryKeys } from '@/features/customer-workspace/queryKeys';
import {
  DESIRED_SERVICE_OPTIONS,
} from '@/features/journeys/build-villa/constants';
import {
  JOURNEY_TYPE_LABELS,
  resolveOperationalStage,
} from '@/features/service-requests/operationalStages';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'تم استلام الطلب',
  under_review: 'تحت المراجعة المهنية',
  awaiting_information: 'نحتاج معلومات إضافية',
  qualified: 'تم تأهيل الطلب',
};

function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function desiredServiceLabel(value?: string | null): string {
  if (!value) {
    return '—';
  }
  return DESIRED_SERVICE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function CustomerWorkspace() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: customer360QueryKeys.workspace(user?.id),
    queryFn: getCustomerWorkspace,
    enabled: Boolean(user?.id),
  });

  const requests = data?.service_requests ?? [];

  return (
    <Layout>
      <PageMeta title="طلباتي — EAM" noIndex />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">طلباتي</h1>
            <p className="mt-2 text-ink-secondary">
              متابعة حالة طلبات الخدمة بعد إكمال الرحلات التشغيلية.
            </p>
          </div>

          {isLoading ? (
            <p className="text-ink-secondary">{t('site.loading')}</p>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4">
              <p className="text-red-700 dark:text-red-200">{t('ops.loadError')}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
              >
                {t('ops.retry')}
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && data ? (
            <div className="mb-6 rounded-xl border border-gold/20 bg-cream-light dark:bg-surface p-4 text-sm text-ink-secondary">
              <p>
                لديك {data.summary.service_request_count ?? requests.length} طلب
                {data.summary.active_journey_count ? ` · ${data.summary.active_journey_count} رحلة نشطة` : ''}
              </p>
            </div>
          ) : null}

          {!isLoading && !isError && requests.length === 0 ? (
            <div className="rounded-xl border border-gold/20 bg-cream-light dark:bg-surface p-8 text-center">
              <p className="text-lg text-ink">{t('customer.emptyRequests')}</p>
              <p className="mt-2 text-ink-secondary">{t('customer.exploreServices')}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/services"
                  className="inline-flex rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {t('nav.services')}
                </Link>
                <Link
                  to="/"
                  className="inline-flex rounded-xl border border-gold/30 px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  {t('common.backHome')}
                </Link>
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((item) => {
                const stage = resolveOperationalStage(item.status);
                const title =
                  item.journey_type === 'engineering_consulting'
                    ? 'طلب استشارة هندسية'
                    : item.city ?? 'طلب بناء فيلا';
                return (
                  <Link
                    key={item.id}
                    to={`/my-requests/${item.id}`}
                    className="block rounded-xl border border-gold/20 bg-cream-light dark:bg-surface p-5 transition hover:border-gold/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink-muted">{item.reference_code}</p>
                        <p className="mt-1 text-xs text-gold">
                          {JOURNEY_TYPE_LABELS[item.journey_type] ?? item.journey_type}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-ink">{title}</h2>
                        <p className="mt-1 text-sm text-ink-secondary">
                          {item.journey_type === 'build_villa'
                            ? desiredServiceLabel(item.desired_service)
                            : stage.description}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                        <p className="mt-2 text-xs text-ink-secondary">{stage.label}</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
