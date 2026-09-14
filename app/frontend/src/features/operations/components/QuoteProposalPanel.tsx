import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  QUOTE_STATUS_LABELS,
  addQuoteLineItem,
  approveQuote,
  createQuoteDraft,
  deleteQuoteLineItem,
  formatSar,
  getQuoteForServiceRequest,
  issueQuote,
  submitQuoteForApproval,
  type QuoteDetail,
} from '@/features/operations/api/quotesClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOpsPaymentStatus, getPaymentConfig } from '@/features/payments/api/paymentClient';

interface Props {
  serviceRequestId: number;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(value));
}

export default function QuoteProposalPanel({ serviceRequestId }: Props) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [createNote, setCreateNote] = useState('');

  const quoteQuery = useQuery({
    queryKey: ['operations', 'quotes', serviceRequestId],
    queryFn: () => getQuoteForServiceRequest(serviceRequestId),
    retry: false,
  });

  const paymentQuery = useQuery({
    queryKey: ['operations', 'payment-status', serviceRequestId],
    queryFn: () => getOpsPaymentStatus(serviceRequestId),
    enabled:
      quoteQuery.isSuccess &&
      (quoteQuery.data?.status === 'issued' || quoteQuery.data?.status === 'paid'),
    retry: false,
  });

  const paymentConfigQuery = useQuery({
    queryKey: ['payments', 'config'],
    queryFn: getPaymentConfig,
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['operations', 'quotes', serviceRequestId] });
  };

  const createMutation = useMutation({
    mutationFn: () => createQuoteDraft(serviceRequestId, createNote || undefined),
    onSuccess: invalidate,
  });

  const addLineMutation = useMutation({
    mutationFn: (quoteId: number) =>
      addQuoteLineItem(quoteId, description.trim(), quantity, unitPrice),
    onSuccess: () => {
      setDescription('');
      setQuantity('1');
      setUnitPrice('');
      invalidate();
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: ({ quoteId, lineItemId }: { quoteId: number; lineItemId: number }) =>
      deleteQuoteLineItem(quoteId, lineItemId),
    onSuccess: invalidate,
  });

  const submitMutation = useMutation({
    mutationFn: (quoteId: number) => submitQuoteForApproval(quoteId),
    onSuccess: invalidate,
  });

  const approveMutation = useMutation({
    mutationFn: (quoteId: number) => approveQuote(quoteId),
    onSuccess: invalidate,
  });

  const issueMutation = useMutation({
    mutationFn: (quoteId: number) => issueQuote(quoteId),
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ['operations', 'payment-status', serviceRequestId] });
    },
  });

  const quote = quoteQuery.data as QuoteDetail | undefined;
  const isEditable = quote?.status === 'draft';
  const isPending = createMutation.isPending || addLineMutation.isPending || submitMutation.isPending;

  if (quoteQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">جاري تحميل العرض...</p>;
  }

  if (quoteQuery.isError && !quote) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-secondary">
          لا يوجد عرض سعر بعد. أنشئ مسودة من البنود التي يحددها المراجع المهني — لا تسعير تلقائي.
        </p>
        <textarea
          value={createNote}
          onChange={(e) => setCreateNote(e.target.value)}
          className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm"
          placeholder="ملاحظة داخلية للعرض (اختياري)"
        />
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
        >
          إنشاء مسودة عرض سعر
        </button>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold">عرض سعر — {quote.reference_code}</h3>
          <p className="text-sm text-ink-secondary">
            الحالة: {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {quote.status === 'issued' ? (
            <p className="text-sm text-green-700 dark:text-green-300">
              صالح حتى {formatDate(quote.valid_until)}
            </p>
          ) : null}
          {paymentQuery.data?.paid || quote.status === 'paid' ? (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              مدفوع
              {paymentQuery.data?.paid_at
                ? ` · ${formatDate(paymentQuery.data.paid_at)}`
                : ''}
            </span>
          ) : paymentQuery.data?.status === 'failed' ? (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
              {t('payment.failedBadge')}
            </span>
          ) : paymentQuery.data?.status === 'expired' ? (
            <span className="rounded-full bg-slate-500/15 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('payment.expiredBadge')}
            </span>
          ) : quote.status === 'issued' && paymentQuery.data?.payments_enabled ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
              {t('payment.stageAwaitingPayment')}
            </span>
          ) : null}
        </div>
      </div>

      {paymentConfigQuery.data?.payments_enabled &&
      !paymentConfigQuery.data?.webhook_configured &&
      quote.status === 'issued' ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          {t('payment.webhookWarning')}
        </p>
      ) : null}

      {paymentQuery.data?.receipt_url ? (
        <p className="text-sm">
          <a
            href={paymentQuery.data.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-2"
          >
            إيصال Stripe
          </a>
        </p>
      ) : null}

      {quote.line_items.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-alt dark:bg-surface">
                <th className="px-3 py-2 text-right">البند</th>
                <th className="px-3 py-2 text-right">الكمية</th>
                <th className="px-3 py-2 text-right">السعر</th>
                <th className="px-3 py-2 text-right">الإجمالي</th>
                {isEditable ? <th className="px-3 py-2" /> : null}
              </tr>
            </thead>
            <tbody>
              {quote.line_items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{formatSar(item.unit_price)}</td>
                  <td className="px-3 py-2">{formatSar(item.line_total)}</td>
                  {isEditable ? (
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          deleteLineMutation.mutate({ quoteId: quote.id, lineItemId: item.id })
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">لا توجد بنود بعد.</p>
      )}

      <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-sm space-y-1">
        <p>المجموع الفرعي: {formatSar(quote.subtotal)}</p>
        <p>ضريبة القيمة المضافة (15%): {formatSar(quote.vat_amount)}</p>
        <p className="font-bold">الإجمالي: {formatSar(quote.total_amount)}</p>
        <p className="text-xs text-ink-muted">العملة: {quote.currency} · الأسعار حصرية للضريبة</p>
      </div>

      {isEditable ? (
        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-semibold">إضافة بند</p>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="وصف البند"
          />
          <div className="flex flex-wrap gap-2">
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 rounded-lg border px-3 py-2 text-sm"
              placeholder="الكمية"
            />
            <input
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-36 rounded-lg border px-3 py-2 text-sm"
              placeholder="السعر (ر.س)"
            />
            <button
              type="button"
              onClick={() => addLineMutation.mutate(quote.id)}
              disabled={!description.trim() || !unitPrice || isPending}
              className="rounded-lg bg-dark-card px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white/20"
            >
              إضافة
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {quote.status === 'draft' ? (
          <button
            type="button"
            onClick={() => submitMutation.mutate(quote.id)}
            disabled={quote.line_items.length === 0 || isPending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            إرسال للموافقة
          </button>
        ) : null}
        {quote.status === 'pending_approval' ? (
          <button
            type="button"
            onClick={() => approveMutation.mutate(quote.id)}
            disabled={approveMutation.isPending}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
          >
            موافقة المالك (OWNER_DELEGATE)
          </button>
        ) : null}
        {quote.status === 'approved' ? (
          <button
            type="button"
            onClick={() => issueMutation.mutate(quote.id)}
            disabled={issueMutation.isPending}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
          >
            إصدار للعميل (30 يوم)
          </button>
        ) : null}
      </div>
    </div>
  );
}
