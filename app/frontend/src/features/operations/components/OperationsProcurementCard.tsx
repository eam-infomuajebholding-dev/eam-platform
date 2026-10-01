import { useQuery } from '@tanstack/react-query';
import { listOperationsProcurementOrders } from '@/features/operations/api/fulfillmentClient';

const PO_STATUS_AR: Record<string, string> = {
  provisional: 'أولي',
  awaiting_partner: 'بانتظار الشريك',
  partner_accepted: 'قبل الشريك',
  partner_declined: 'رفض الشريك',
};

export default function OperationsProcurementCard({ serviceRequestId }: { serviceRequestId: number }) {
  const query = useQuery({
    queryKey: ['operations', 'procurement-orders', 'sr', serviceRequestId],
    queryFn: async () => {
      const { items } = await listOperationsProcurementOrders({ service_request_id: serviceRequestId });
      return items[0] ?? null;
    },
  });

  if (query.isLoading || !query.data) return null;

  const po = query.data;

  return (
    <div className="rounded-xl border border-gold/20 p-4 space-y-2" dir="rtl">
      <h3 className="font-bold">أمر الشراء (PO)</h3>
      <p className="text-sm">
        <span className="font-mono text-xs" dir="ltr">
          {po.reference_code}
        </span>
        {' · '}
        {PO_STATUS_AR[po.status] ?? po.status}
      </p>
      {po.total_amount != null ? (
        <p className="text-sm text-ink-secondary">المبلغ الأولي: {po.total_amount} SAR</p>
      ) : null}
      {po.delivery_location ? (
        <p className="text-sm">
          <strong>التسليم:</strong> {po.delivery_location}
        </p>
      ) : null}
    </div>
  );
}
