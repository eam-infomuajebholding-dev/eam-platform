import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import IntakeSnapshotSummary from '@/components/serviceRequests/IntakeSnapshotSummary';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getQuotePaymentStatus } from '@/features/payments/api/paymentClient';
import {
  getServiceRequest,
  submitCustomerResponse,
} from '@/features/service-requests/api/serviceRequestClient';
import { serviceRequestQueryKeys } from '@/features/service-requests/queryKeys';
import CustomerQuoteView from '@/features/service-requests/components/CustomerQuoteView';
import CustomerProcurementOrderCard from '@/features/logistics/CustomerProcurementOrderCard';
import DeliveryLogisticsCard from '@/features/logistics/DeliveryLogisticsCard';
import {
  JOURNEY_TYPE_LABELS,
  resolveOperationalStage,
  resolvePaymentStage,
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
  const { t } = useLanguage();
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

  const paymentQuery = useQuery({
    queryKey: ['customer', 'payment-status', requestId],
    queryFn: () => getQuotePaymentStatus(requestId),
    enabled: Boolean(user?.id) && Number.isFinite(requestId),
    retry: false,
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

  const baseStage = data ? resolveOperationalStage(data.status) : null;
  const paymentStage = resolvePaymentStage(paymentQuery.data, {
    awaitingPayment: t('payment.stageAwaitingPayment'),
    awaitingPaymentDesc: t('payment.stageAwaitingPaymentDesc'),
    paid: t('payment.stagePaid'),
    paidDesc: t('payment.stagePaidDesc'),
  });
  const displayStage = paymentStage ?? baseStage;

  return (
    <Layout>
      <PageMeta title="تفاصيل الطلب — EAM" noIndex />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/my-requests" className="text-sm text-gold hover:underline">
            ← العودة إلى طلباتي
          </Link>

          {!Number.isFinite(requestId) ? (
            <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/20">
              <p className="text-amber-900 dark:text-amber-100">{t('customer.invalidRequest')}</p>
              <Link to="/my-requests" className="mt-3 inline-block text-sm text-gold hover:underline">
                ← {t('auth.myRequests')}
              </Link>
            </div>
          ) : null}

          {Number.isFinite(requestId) && isLoading ? (
            <p className="mt-8 text-ink-secondary">{t('site.loading')}</p>
          ) : null}

          {Number.isFinite(requestId) && isError ? (
            <div className="mt-8 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4">
              <p className="text-red-700 dark:text-red-200">{t('ops.loadDetailError')}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
              >
                {t('ops.retry')}
              </button>
            </div>
          ) : null}

          {Number.isFinite(requestId) && data ? (
            <div className="mt-8 space-y-6">
              <div>
                <p className="text-sm text-ink-muted">{data.reference_code}</p>
                <p className="mt-1 text-sm text-gold">
                  {JOURNEY_TYPE_LABELS[data.journey_type] ?? data.journey_type}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-ink">تفاصيل الطلب</h1>
              </div>

              <div className="rounded-xl border border-gold/20 bg-cream-light dark:bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-muted">الحالة</p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {STATUS_LABELS[data.status] ?? data.status}
                    </p>
                    <p className="mt-2 text-sm text-ink-secondary">{displayStage?.label}</p>
                    <p className="mt-1 text-xs text-ink-muted">{displayStage?.description}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-ink-muted">تاريخ التقديم</p>
                    <p className="mt-1 text-sm text-ink/80">{formatDate(data.created_at)}</p>
                  </div>
                </div>
              </div>

              {data.pending_customer_action ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4">
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

              <CustomerQuoteView requestId={data.id} />

              {data.intake_snapshot?.procurement_order ? (
                <CustomerProcurementOrderCard
                  order={data.intake_snapshot.procurement_order as Parameters<
                    typeof CustomerProcurementOrderCard
                  >[0]['order']}
                />
              ) : null}

              {data.intake_snapshot?.delivery_logistics ? (
                <DeliveryLogisticsCard logistics={data.intake_snapshot.delivery_logistics} />
              ) : null}

              <div>
                <h2 className="mb-3 text-lg font-bold text-ink">
                  لقطة الاستلام الأولية (مجمدة)
                </h2>
                <IntakeSnapshotSummary snapshot={data.intake_snapshot} />
              </div>

              {data.activity && data.activity.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-lg font-bold text-ink">
                    نشاط الطلب
                  </h2>
                  <ul className="space-y-2 text-sm">
                    {data.activity.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-soft-border/80 dark:border-white/10 px-3 py-2"
                      >
                        <p className="text-ink-muted">{formatDate(item.created_at)}</p>
                        {item.event_label ? (
                          <p className="mt-1 font-semibold text-ink">{item.event_label}</p>
                        ) : null}
                        {item.customer_message && item.customer_message !== item.event_label ? (
                          <p className="mt-1">{item.customer_message}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-xl border border-soft-border/80 dark:border-white/10 p-4 text-sm text-ink-secondary">
                <p>آخر تحديث: {formatDate(data.updated_at)}</p>
                {data.status === 'qualified' ? (
                  <p className="mt-2">عند إصدار عرض سعر للعميل يظهر أعلاه مع خيار الدفع الإلكتروني.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
