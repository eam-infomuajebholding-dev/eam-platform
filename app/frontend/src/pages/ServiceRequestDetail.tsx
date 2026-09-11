import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import IntakeSnapshotSummary from '@/components/serviceRequests/IntakeSnapshotSummary';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getServiceRequest,
  submitCustomerResponse,
} from '@/features/service-requests/api/serviceRequestClient';
import { serviceRequestQueryKeys } from '@/features/service-requests/queryKeys';
import {
  JOURNEY_TYPE_LABELS,
  resolveOperationalStage,
} from '@/features/service-requests/operationalStages';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'تم الاستلام',
  under_review: 'تحت المراجعة المهنية',
  awaiting_information: 'مطلوب معلومات إضافية',
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

export default function ServiceRequestDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const requestId = Number.parseInt(id ?? '', 10);
  const queryClient = useQueryClient();
  const [customerReply, setCustomerReply] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: serviceRequestQueryKeys.detail(user?.id, requestId),
    queryFn: () => getServiceRequest(requestId),
    enabled: Boolean(user?.id) && Number.isFinite(requestId),
  });

  const responseMutation = useMutation({
    mutationFn: (message: string) => submitCustomerResponse(requestId, message),
    onSuccess: () => {
      setCustomerReply('');
      void queryClient.invalidateQueries({
        queryKey: serviceRequestQueryKeys.detail(user?.id, requestId),
      });
    },
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
                <p className="mt-1 text-sm font-tajawal text-gold">
                  {JOURNEY_TYPE_LABELS[data.journey_type] ?? data.journey_type}
                </p>
                <h1 className="mt-2 text-3xl font-bold font-tajawal text-gray-900 dark:text-white">تفاصيل الطلب</h1>
              </div>

              <div className="rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-5 font-tajawal">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-white/60">الحالة</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {STATUS_LABELS[data.status] ?? data.status}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
                      {resolveOperationalStage(data.status).label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
                      {resolveOperationalStage(data.status).description}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 dark:text-white/60">تاريخ التقديم</p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-white/80">{formatDate(data.created_at)}</p>
                  </div>
                </div>
              </div>

              {data.pending_customer_action ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 font-tajawal">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    EAM يحتاج معلومات إضافية
                  </p>
                  <textarea
                    value={customerReply}
                    onChange={(e) => setCustomerReply(e.target.value)}
                    className="mt-3 w-full min-h-[100px] rounded-lg border px-3 py-2 text-sm"
                    placeholder="اكتب ردك أو المعلومات المطلوبة..."
                  />
                  <button
                    type="button"
                    onClick={() => responseMutation.mutate(customerReply)}
                    disabled={!customerReply.trim() || responseMutation.isPending}
                    className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    إرسال الرد
                  </button>
                </div>
              ) : null}

              <div>
                <h2 className="mb-3 text-lg font-bold font-tajawal text-gray-900 dark:text-white">
                  لقطة الاستلام الأولية (مجمدة)
                </h2>
                <IntakeSnapshotSummary snapshot={data.intake_snapshot} />
              </div>

              {data.activity && data.activity.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-lg font-bold font-tajawal text-gray-900 dark:text-white">
                    نشاط الطلب
                  </h2>
                  <ul className="space-y-2 font-tajawal text-sm">
                    {data.activity.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2"
                      >
                        <p className="text-gray-500">{formatDate(item.created_at)}</p>
                        {item.event_label ? (
                          <p className="mt-1 font-semibold text-gray-800 dark:text-white">{item.event_label}</p>
                        ) : null}
                        {item.customer_message && item.customer_message !== item.event_label ? (
                          <p className="mt-1">{item.customer_message}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 font-tajawal text-sm text-gray-600 dark:text-white/70">
                <p>آخر تحديث: {formatDate(data.updated_at)}</p>
                {data.status === 'qualified' ? (
                  <p className="mt-2">يتم إعداد نطاق/عرض الخدمة عند الجاهزية التجارية.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
