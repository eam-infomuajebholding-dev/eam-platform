import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
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
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: customer360QueryKeys.workspace(user?.id),
    queryFn: getCustomerWorkspace,
    enabled: Boolean(user?.id),
  });

  const requests = data?.service_requests ?? [];

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-tajawal text-gray-900 dark:text-white">طلباتي</h1>
            <p className="mt-2 font-tajawal text-gray-600 dark:text-white/70">
              متابعة حالة طلبات الخدمة بعد إكمال الرحلات التشغيلية.
            </p>
          </div>

          {isLoading ? (
            <p className="font-tajawal text-gray-600 dark:text-white/70">جاري تحميل الطلبات...</p>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 font-tajawal">
              <p className="text-red-700 dark:text-red-200">تعذر تحميل الطلبات.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && data ? (
            <div className="mb-6 rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-4 font-tajawal text-sm text-gray-700 dark:text-white/80">
              <p>
                لديك {data.summary.service_request_count ?? requests.length} طلب
                {data.summary.active_journey_count ? ` · ${data.summary.active_journey_count} رحلة نشطة` : ''}
              </p>
            </div>
          ) : null}

          {!isLoading && !isError && requests.length === 0 ? (
            <div className="rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-8 text-center font-tajawal">
              <p className="text-lg text-gray-800 dark:text-white">لم تُقدّم أي طلبات بعد</p>
              <p className="mt-2 text-gray-600 dark:text-white/70">
                ابدأ رحلة بناء الفيلا من الصفحة الرئيسية لإنشاء طلبك الأول.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-white"
              >
                الذهاب إلى الصفحة الرئيسية
              </Link>
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
                    className="block rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-5 transition hover:border-gold/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-tajawal text-sm text-gray-500 dark:text-white/60">{item.reference_code}</p>
                        <p className="mt-1 text-xs font-tajawal text-gold">
                          {JOURNEY_TYPE_LABELS[item.journey_type] ?? item.journey_type}
                        </p>
                        <h2 className="mt-1 text-lg font-bold font-tajawal text-gray-900 dark:text-white">{title}</h2>
                        <p className="mt-1 font-tajawal text-sm text-gray-600 dark:text-white/70">
                          {item.journey_type === 'build_villa'
                            ? desiredServiceLabel(item.desired_service)
                            : stage.description}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                        <p className="mt-2 font-tajawal text-xs text-gray-600 dark:text-white/70">{stage.label}</p>
                        <p className="mt-1 font-tajawal text-xs text-gray-500 dark:text-white/60">
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
