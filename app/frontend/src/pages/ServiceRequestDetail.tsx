import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import IntakeSnapshotSummary from '@/components/serviceRequests/IntakeSnapshotSummary';
import { getServiceRequest } from '@/serviceRequests/serviceRequestClient';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'تم الاستلام',
  under_review: 'قيد المراجعة',
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

export default function ServiceRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number.parseInt(id ?? '', 10);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['service-request', requestId],
    queryFn: () => getServiceRequest(requestId),
    enabled: Number.isFinite(requestId),
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/my-requests" className="font-tajawal text-sm text-gold hover:underline">
            ← العودة إلى طلباتي
          </Link>

          {isLoading ? (
            <p className="mt-8 font-tajawal text-gray-600 dark:text-white/70">جاري تحميل الطلب...</p>
          ) : null}

          {isError ? (
            <div className="mt-8 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 font-tajawal">
              <p className="text-red-700 dark:text-red-200">تعذر تحميل تفاصيل الطلب.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : null}

          {data ? (
            <div className="mt-8 space-y-6">
              <div>
                <p className="font-tajawal text-sm text-gray-500 dark:text-white/60">{data.reference_code}</p>
                <h1 className="mt-2 text-3xl font-bold font-tajawal text-gray-900 dark:text-white">تفاصيل الطلب</h1>
              </div>

              <div className="rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-5 font-tajawal">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-white/60">الحالة</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {STATUS_LABELS[data.status] ?? data.status}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 dark:text-white/60">تاريخ التقديم</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white/80">{formatDate(data.created_at)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-bold font-tajawal text-gray-900 dark:text-white">معلومات الطلب</h2>
                <IntakeSnapshotSummary snapshot={data.intake_snapshot} />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 font-tajawal text-sm text-gray-600 dark:text-white/70">
                <p>آخر تحديث: {formatDate(data.updated_at)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
