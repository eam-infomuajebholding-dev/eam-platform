export type ProcurementOrderSnapshot = {
  reference_code?: string;
  status?: string;
  total_amount?: number | null;
  delivery_location?: string | null;
  currency?: string;
};

const PO_STATUS_AR: Record<string, string> = {
  provisional: 'أولي',
  awaiting_partner: 'بانتظار تأكيد الشريك',
  partner_accepted: 'قبل الشريك',
  partner_declined: 'رفض الشريك',
};

export default function CustomerProcurementOrderCard({ order }: { order: ProcurementOrderSnapshot }) {
  if (!order?.reference_code) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gold/25 bg-surface-alt dark:bg-surface p-4 space-y-2" dir="rtl">
      <h3 className="font-bold text-ink">أمر التوريد (PO)</h3>
      <p className="text-sm">
        المرجع:{' '}
        <span className="font-mono text-xs" dir="ltr">
          {order.reference_code}
        </span>
      </p>
      {order.status ? (
        <p className="text-sm">
          <strong>الحالة:</strong> {PO_STATUS_AR[order.status] ?? order.status}
        </p>
      ) : null}
      {order.total_amount != null ? (
        <p className="text-sm text-ink-secondary">
          المبلغ الأولي: {order.total_amount} {order.currency ?? 'SAR'}
        </p>
      ) : null}
      {order.delivery_location ? (
        <p className="text-sm">
          <strong>التسليم:</strong> {order.delivery_location}
        </p>
      ) : null}
      <p className="text-xs text-ink-muted leading-relaxed">
        هذا أمر توريد أولي مرتبط بطلبكم. التسعير النهائي والدفع يتم عبر عرض السعر في «طلباتي» عند الجاهزية.
      </p>
    </div>
  );
}
