export type DeliveryLogisticsSnapshot = {
  reference_code?: string;
  status?: string;
  status_label_ar?: string;
  delivery_address?: string;
  carrier_name?: string | null;
  tracking_number?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
};

const STEPS = [
  { key: 'awaiting_dispatch', label: 'تجهيز' },
  { key: 'dispatched', label: 'شحن' },
  { key: 'in_transit', label: 'في الطريق' },
  { key: 'out_for_delivery', label: 'تسليم' },
  { key: 'delivered', label: 'مكتمل' },
];

function stepIndex(status: string): number {
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === 'delivery_failed') return 2;
  if (status === 'cancelled') return -1;
  return 0;
}

export default function DeliveryLogisticsCard({ logistics }: { logistics: DeliveryLogisticsSnapshot }) {
  if (!logistics?.reference_code) {
    return null;
  }

  const current = stepIndex(logistics.status ?? '');
  const failed = logistics.status === 'delivery_failed';

  return (
    <div className="rounded-xl border border-gold/25 bg-surface-alt dark:bg-surface p-4 space-y-3" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-ink">تتبّع التوصيل</h3>
        <span className="text-xs font-mono" dir="ltr">
          {logistics.reference_code}
        </span>
      </div>

      {failed ? (
        <p className="text-sm text-red-600">تعذّر التسليم — سيتواصل معك فريق EAM.</p>
      ) : (
        <ol className="flex justify-between gap-1 text-[10px] sm:text-xs text-center">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className={`flex-1 rounded py-1 ${
                i <= current ? 'bg-gold/20 text-ink font-semibold' : 'bg-black/5 text-ink-secondary'
              }`}
            >
              {step.label}
            </li>
          ))}
        </ol>
      )}

      <p className="text-sm">
        <strong>الحالة:</strong> {logistics.status_label_ar ?? logistics.status ?? '—'}
      </p>
      {logistics.delivery_address ? (
        <p className="text-sm">
          <strong>العنوان:</strong> {logistics.delivery_address}
        </p>
      ) : null}
      {logistics.carrier_name ? (
        <p className="text-sm">
          <strong>الناقل:</strong> {logistics.carrier_name}
        </p>
      ) : null}
      {logistics.tracking_number ? (
        <p className="text-sm">
          <strong>التتبع:</strong>{' '}
          <span dir="ltr" className="font-mono">
            {logistics.tracking_number}
          </span>
        </p>
      ) : null}
    </div>
  );
}
