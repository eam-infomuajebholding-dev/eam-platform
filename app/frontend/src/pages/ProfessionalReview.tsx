import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import PageMeta from '@/components/PageMeta';
import IntakeSnapshotSummary from '@/components/serviceRequests/IntakeSnapshotSummary';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getOperationsServiceRequest,
  listOperationsServiceRequests,
  qualifyServiceRequest,
  requestMoreInformation,
  startProfessionalReview,
} from '@/features/operations/api/operationsClient';
import CommercialEngagementPanel from '@/features/operations/components/CommercialEngagementPanel';
import QuoteProposalPanel from '@/features/operations/components/QuoteProposalPanel';
import OperationsFulfillmentPanel from '@/features/operations/components/OperationsFulfillmentPanel';
import OperationsProcurementCard from '@/features/operations/components/OperationsProcurementCard';
import OperationsShipmentTimeline from '@/features/operations/components/OperationsShipmentTimeline';
import DeliveryLogisticsCard from '@/features/logistics/DeliveryLogisticsCard';
import { listOperationsPartners } from '@/features/partners/api/partnersClient';
import { JOURNEY_TYPE_LABELS, resolveOperationalStage } from '@/features/service-requests/operationalStages';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'تم الاستلام',
  under_review: 'تحت المراجعة',
  awaiting_information: 'بانتظار معلومات',
  qualified: 'تم التأهيل',
};

const PARTNER_ASSIGNMENT_AR: Record<string, string> = {
  pending_partner: 'بانتظار الشريك',
  accepted: 'قبل الشريك',
  declined: 'رفض الشريك',
};

export default function ProfessionalReviewPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const requestId = id ? Number.parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  const [customerMessage, setCustomerMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '');
  const [journeyFilter, setJourneyFilter] = useState(() => searchParams.get('journey_type') ?? '');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [partnerAssignmentFilter, setPartnerAssignmentFilter] = useState(
    () => searchParams.get('partner_assignment_status') ?? '',
  );

  const partnersQuery = useQuery({
    queryKey: ['operations', 'partners'],
    queryFn: listOperationsPartners,
    enabled: !requestId,
  });

  const listQuery = useQuery({
    queryKey: [
      'operations',
      'service-requests',
      statusFilter,
      journeyFilter,
      partnerFilter,
      partnerAssignmentFilter,
    ],
    queryFn: () =>
      listOperationsServiceRequests(
        statusFilter || undefined,
        journeyFilter || undefined,
        partnerFilter ? Number.parseInt(partnerFilter, 10) : undefined,
        partnerAssignmentFilter || undefined,
      ),
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
      <PageMeta title="مراجعة الطلبات — EAM" noIndex />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-2xl font-bold text-ink mb-6">
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
                    className={`rounded-full px-3 py-1 text-sm ${
                      statusFilter === option.value
                        ? 'bg-gold text-white'
                        : 'border border-gold/30 text-ink-secondary'
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
                    className={`rounded-full px-3 py-1 text-sm ${
                      journeyFilter === option.value
                        ? 'bg-dark-card text-white dark:bg-white/20'
                        : 'border border-soft-border text-ink-secondary dark:border-white/20 dark:text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <label className="text-sm text-ink-secondary">الشريك:</label>
                <select
                  value={partnerFilter}
                  onChange={(e) => setPartnerFilter(e.target.value)}
                  className="rounded-lg border border-soft-border px-2 py-1 text-sm min-w-[160px]"
                >
                  <option value="">كل الشركاء</option>
                  {partnersQuery.data?.items.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.display_name_ar}
                    </option>
                  ))}
                </select>
                <select
                  value={partnerAssignmentFilter}
                  onChange={(e) => setPartnerAssignmentFilter(e.target.value)}
                  className="rounded-lg border border-soft-border px-2 py-1 text-sm min-w-[160px]"
                >
                  <option value="">إسناد الشريك (الكل)</option>
                  <option value="pending_partner">بانتظار الشريك</option>
                  <option value="accepted">مقبول</option>
                  <option value="declined">مرفوض</option>
                </select>
              </div>
              {listQuery.isLoading ? (
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('ops.loading')}
                </div>
              ) : null}
              {listQuery.isError ? (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950/20">
                  <p className="text-red-800 dark:text-red-200">{t('ops.loadError')}</p>
                  <button
                    type="button"
                    onClick={() => void listQuery.refetch()}
                    className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t('ops.retry')}
                  </button>
                </div>
              ) : null}
              {!listQuery.isLoading && !listQuery.isError && listQuery.data?.length === 0 ? (
                <p className="text-ink-secondary">{t('ops.emptyList')}</p>
              ) : null}
              {listQuery.data?.map((item) => (
                <Link
                  key={item.id}
                  to={`/operations/service-requests/${item.id}`}
                  className="block rounded-xl border border-gold/20 bg-cream-light dark:bg-surface p-4 hover:border-gold/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{item.reference_code}</span>
                    <span className="text-sm text-ink-muted">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {JOURNEY_TYPE_LABELS[item.journey_type] ?? item.journey_type}
                  </p>
                  {item.partner_assignment_status && item.partner_assignment_status !== 'none' ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      إسناد الشريك:{' '}
                      {PARTNER_ASSIGNMENT_AR[item.partner_assignment_status] ?? item.partner_assignment_status}
                    </p>
                  ) : null}
                </Link>
              ))}
              <OperationsFulfillmentPanel />
            </div>
          ) : null}

          {requestId && detailQuery.isLoading ? (
            <div className="flex items-center gap-2 text-ink-secondary">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('site.loading')}
            </div>
          ) : null}

          {requestId && detailQuery.isError ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950/20">
              <p className="text-red-800 dark:text-red-200">{t('ops.notFound')}</p>
              <Link to="/operations/service-requests" className="mt-3 inline-block text-sm text-gold hover:underline">
                ← العودة إلى قائمة المراجعة
              </Link>
            </div>
          ) : null}

          {requestId && detailQuery.data ? (
            <div className="space-y-6">
              <Link to="/operations/service-requests" className="text-sm text-gold hover:underline">
                ← العودة إلى قائمة المراجعة
              </Link>

              <div className="rounded-xl border border-gold/20 p-5">
                <p className="text-sm text-ink-muted">{detailQuery.data.reference_code}</p>
                <h2 className="text-xl font-bold mt-1">
                  {JOURNEY_TYPE_LABELS[detailQuery.data.journey_type] ?? detailQuery.data.journey_type}
                </h2>
                <p className="mt-2">
                  الحالة: {STATUS_LABELS[detailQuery.data.status] ?? detailQuery.data.status}
                </p>
                <p className="text-sm text-ink-secondary mt-1">
                  {resolveOperationalStage(detailQuery.data.status).description}
                </p>
                {detailQuery.data.partner_assignment_status &&
                detailQuery.data.partner_assignment_status !== 'none' ? (
                  <p className="text-sm mt-2">
                    إسناد الشريك:{' '}
                    {PARTNER_ASSIGNMENT_AR[detailQuery.data.partner_assignment_status] ??
                      detailQuery.data.partner_assignment_status}
                    {detailQuery.data.partner_org_id != null
                      ? ` · org #${detailQuery.data.partner_org_id}`
                      : null}
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="font-bold mb-3">لقطة الاستلام الأولية (مجمدة)</h3>
                <IntakeSnapshotSummary
                  snapshot={detailQuery.data.intake_snapshot}
                  view="operations"
                />
              </div>

              <div className="rounded-xl border border-soft-border/80 dark:border-white/10 p-4 space-y-3">
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

              <CommercialEngagementPanel
                serviceRequestId={detailQuery.data.id}
                audience="ops"
              />

              <OperationsProcurementCard serviceRequestId={detailQuery.data.id} />
              {detailQuery.data.intake_snapshot?.delivery_logistics ? (
                <DeliveryLogisticsCard
                  logistics={detailQuery.data.intake_snapshot.delivery_logistics as Parameters<
                    typeof DeliveryLogisticsCard
                  >[0]['logistics']}
                />
              ) : null}
              <OperationsShipmentTimeline serviceRequestId={detailQuery.data.id} />

              <div>
                <h3 className="font-bold mb-3">سجل المراجعة</h3>
                <ul className="space-y-2 text-sm">
                  {detailQuery.data.transitions.map((transition) => (
                    <li key={transition.id} className="rounded-lg border px-3 py-2">
                      <p>
                        {transition.from_status} → {transition.to_status} · {transition.actor_role}
                      </p>
                      {transition.customer_message ? (
                        <p className="text-ink-secondary mt-1">
                          للعميل: {transition.customer_message}
                        </p>
                      ) : null}
                      {transition.internal_note ? (
                        <p className="text-ink-muted mt-1">داخلي: {transition.internal_note}</p>
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
