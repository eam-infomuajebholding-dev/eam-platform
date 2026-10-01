export type InternalReviewAndApprovalSnapshot = {
  title_ar?: string;
  subject_ar?: string;
  body_ar?: string;
  buyer_liability_terms_version?: string;
  buyer_liability_terms_accepted_at?: string;
  invoice_confirmed?: boolean;
  internal_approval_status?: string;
};

type Props = {
  record: InternalReviewAndApprovalSnapshot;
};

function formatAcceptedAt(value?: string): string {
  if (!value) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

export default function InternalReviewApprovalBlock({ record }: Props) {
  if (!record.body_ar?.trim()) {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-dashed border-slate-400/50 bg-slate-500/5 p-4 space-y-2 text-sm"
      dir="rtl"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {record.title_ar ?? 'داخلية — للاطلاع والموافقة'}
      </p>
      {record.subject_ar ? <p className="font-semibold text-ink">{record.subject_ar}</p> : null}
      <p className="text-ink-secondary leading-relaxed whitespace-pre-wrap">{record.body_ar}</p>
      <div className="border-t border-slate-400/20 pt-2 text-xs text-ink-secondary space-y-1">
        <p>
          <strong>إصدار الشروط:</strong> {record.buyer_liability_terms_version ?? '—'}
        </p>
        <p>
          <strong>موافقة المشتري:</strong>{' '}
          {record.buyer_liability_terms_accepted_at
            ? formatAcceptedAt(record.buyer_liability_terms_accepted_at)
            : '—'}
        </p>
        <p>
          <strong>تأكيد الفاتورة:</strong> {record.invoice_confirmed ? 'نعم' : '—'}
        </p>
        <p>
          <strong>حالة الموافقة الداخلية:</strong>{' '}
          {record.internal_approval_status === 'pending' ? 'بانتظار الاطلاع والموافقة' : (record.internal_approval_status ?? '—')}
        </p>
      </div>
    </div>
  );
}
