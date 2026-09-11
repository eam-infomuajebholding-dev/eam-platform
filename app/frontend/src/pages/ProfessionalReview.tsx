import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import IntakeSnapshotSummary from '@/components/serviceRequests/IntakeSnapshotSummary';
import {
  getOperationsServiceRequest,
  listOperationsServiceRequests,
  qualifyServiceRequest,
  requestMoreInformation,
  startProfessionalReview,
} from '@/features/operations/api/operationsClient';
import QuoteProposalPanel from '@/features/operations/components/QuoteProposalPanel';
import { JOURNEY_TYPE_LABELS, resolveOperationalStage } from '@/features/service-requests/operationalStages';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'تم الاستلام',
  under_review: 'تحت المراجعة',
  awaiting_information: 'بانتظار معلومات',
  qualified: 'تم التأهيل',
};

export default function ProfessionalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = id ? Number.parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  const [customerMessage, setCustomerMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [journeyFilter, setJourneyFilter] = useState('');

  const listQuery = useQuery({
    queryKey: ['operations', 'service-requests', statusFilter, journeyFilter],
    queryFn: () =>
      listOperationsServiceRequests(statusFilter || undefined, journeyFilter || undefined),
    enabled: !requestId,
  });

  const detailQuery = useQuery({
    queryKey: ['operations', 'service-requests', requestId],
    queryFn: () => getOperationsServiceRequest(requestId as number),
    enabled: Number.isFinite(requestId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['operations', 'service-requests'] });
    if (requestId) {
      void queryClient.invalidateQueries({ queryKey: ['operations', 'service-requests', requestId] });
    }
  };

  const startReviewMutation = useMutation({
    mutationFn: () => startProfessionalReview(requestId as number, internalNote || undefined),
    onSuccess: invalidate,
  });

  const requestInfoMutation = useMutation({
    mutationFn: () =>
      requestMoreInformation(requestId as number, customerMessage, internalNote || undefined),
    onSuccess: () => {
      setCustomerMessage('');
      invalidate();
    },
  });

  const qualifyMutation = useMutation({
    mutationFn: () => qualifyServiceRequest(requestId as number, undefined, internalNote || undefined),
    onSuccess: invalidate,
  });

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-2xl font-bold font-tajawal text-gray-900 dark:text-white mb-6">
            مراجعة الطلبات المهنية
          </h1>

          {!requestId ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { value: '', label: 'الكل' },
                  { value: 'submitted', label: 'تم الاستلام' },
                  { value: 'under_review', label: 'تحت المراجعة' },
                  { value: 'awaiting_information', label: 'بانتظار معلومات' },
                  { value: 'qualified', label: 'تم التأهيل' },
                ].map((option) => (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={`rounded-full px-3 py-1 text-sm font-tajawal ${
                      statusFilter === option.value
                        ? 'bg-gold text-white'
                        : 'border border-gold/30 text-gray-700 dark:text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { value: '', label: 'كل الرحلات' },
                  ...Object.entries(JOURNEY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
                ].map((option) => (
                  <button
                    key={option.value || 'all-journeys'}
                    type="button"
                    onClick={() => setJourneyFilter(option.value)}
                    className={`rounded-full px-3 py-1 text-sm font-tajawal ${
                      journeyFilter === option.value
                        ? 'bg-gray-800 text-white dark:bg-white/20'
                        : 'border border-gray-300 text-gray-700 dark:border-white/20 dark:text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {listQuery.isLoading ? <p className="font-tajawal">جاري التحميل...</p> : null}
              {listQuery.data?.map((item) => (
                <Link
                  key={item.id}
                  to={`/operations/service-requests/${item.id}`}
                  className="block rounded-xl border border-gold/20 bg-white dark:bg-white/5 p-4 font-tajawal hover:border-gold/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{item.reference_code}</span>
                    <span className="text-sm text-gray-500">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-white/70">
                    {JOURNEY_TYPE_LABELS[item.journey_type] ?? item.journey_type}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}

          {requestId && detailQuery.data ? (
            <div className="space-y-6">
              <Link to="/operations/service-requests" className="text-sm text-gold hover:underline font-tajawal">
                ← العودة إلى قائمة المراجعة
              </Link>

              <div className="rounded-xl border border-gold/20 p-5 font-tajawal">
                <p className="text-sm text-gray-500">{detailQuery.data.reference_code}</p>
                <h2 className="text-xl font-bold mt-1">
                  {JOURNEY_TYPE_LABELS[detailQuery.data.journey_type] ?? detailQuery.data.journey_type}
                </h2>
                <p className="mt-2">
                  الحالة: {STATUS_LABELS[detailQuery.data.status] ?? detailQuery.data.status}
                </p>
                <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                  {resolveOperationalStage(detailQuery.data.status).description}
                </p>
              </div>

              <div>
                <h3 className="font-bold font-tajawal mb-3">لقطة الاستلام الأولية (مجمدة)</h3>
                <IntakeSnapshotSummary snapshot={detailQuery.data.intake_snapshot} />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3 font-tajawal">
                <h3 className="font-bold">إجراءات المراجعة</h3>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm"
                  placeholder="ملاحظة داخلية (لا تظهر للعميل)"
                />
                {detailQuery.data.status === 'submitted' ? (
                  <button
                    type="button"
                    onClick={() => startReviewMutation.mutate()}
                    disabled={startReviewMutation.isPending}
                    className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
                  >
                    بدء المراجعة المهنية
                  </button>
                ) : null}
                {detailQuery.data.status === 'under_review' ? (
                  <>
                    <textarea
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm"
                      placeholder="رسالة للعميل — ما المعلومات المطلوبة؟"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => requestInfoMutation.mutate()}
                        disabled={!customerMessage.trim() || requestInfoMutation.isPending}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        طلب معلومات إضافية
                      </button>
                      <button
                        type="button"
                        onClick={() => qualifyMutation.mutate()}
                        disabled={qualifyMutation.isPending}
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                      >
                        تأهيل الطلب
                      </button>
                    </div>
                  </>
                ) : null}
              </div>

              {detailQuery.data.status === 'qualified' ? (
                <div className="rounded-xl border border-gold/20 p-4">
                  <QuoteProposalPanel serviceRequestId={detailQuery.data.id} />
                </div>
              ) : null}

              <div>
                <h3 className="font-bold font-tajawal mb-3">سجل المراجعة</h3>
                <ul className="space-y-2 font-tajawal text-sm">
                  {detailQuery.data.transitions.map((transition) => (
                    <li key={transition.id} className="rounded-lg border px-3 py-2">
                      <p>
                        {transition.from_status} → {transition.to_status} · {transition.actor_role}
                      </p>
                      {transition.customer_message ? (
                        <p className="text-gray-600 dark:text-white/70 mt-1">
                          للعميل: {transition.customer_message}
                        </p>
                      ) : null}
                      {transition.internal_note ? (
                        <p className="text-gray-500 mt-1">داخلي: {transition.internal_note}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
