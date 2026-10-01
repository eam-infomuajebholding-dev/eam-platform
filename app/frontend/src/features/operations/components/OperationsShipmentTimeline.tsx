import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOperationsShipment,
  listOperationsShipments,
  updateOperationsShipmentStatus,
} from '@/features/operations/api/fulfillmentClient';

const NEXT_OPS: Record<string, { status: string; label: string }> = {
  awaiting_dispatch: { status: 'dispatched', label: 'تسجيل شحن (ops)' },
  dispatched: { status: 'in_transit', label: 'في الطريق (ops)' },
  in_transit: { status: 'delivered', label: 'تسليم (ops)' },
  out_for_delivery: { status: 'delivered', label: 'تسليم (ops)' },
};

export default function OperationsShipmentTimeline({ serviceRequestId }: { serviceRequestId: number }) {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: ['operations', 'shipments', 'sr', serviceRequestId],
    queryFn: async () => {
      const { items } = await listOperationsShipments({ service_request_id: serviceRequestId });
      return items[0] ?? null;
    },
  });

  const shipmentId = listQuery.data?.id;
  const detailQuery = useQuery({
    queryKey: ['operations', 'shipment', shipmentId],
    queryFn: () => getOperationsShipment(shipmentId!),
    enabled: shipmentId != null,
  });

  const statusMutation = useMutation({
    mutationFn: (toStatus: string) =>
      updateOperationsShipmentStatus(shipmentId!, { status: toStatus, note: 'تحديث من ops' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations', 'shipments'] });
      await queryClient.invalidateQueries({ queryKey: ['operations', 'shipment', shipmentId] });
      await queryClient.invalidateQueries({ queryKey: ['operations', 'service-requests', serviceRequestId] });
    },
  });

  if (listQuery.isLoading) return null;
  if (!listQuery.data) return null;

  const currentStatus = detailQuery.data?.status ?? listQuery.data.status;
  const next = NEXT_OPS[currentStatus];

  return (
    <div className="rounded-xl border border-gold/20 p-4 space-y-2" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">سجل التوصيل ({listQuery.data.reference_code})</h3>
        {next ? (
          <button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate(next.status)}
            className="rounded-lg border border-gold px-2 py-1 text-xs font-semibold text-gold disabled:opacity-60"
          >
            {next.label}
          </button>
        ) : null}
      </div>
      <p className="text-xs text-ink-secondary">الحالة: {currentStatus}</p>
      <ul className="text-sm space-y-2">
        {(detailQuery.data?.events ?? []).map((ev) => (
          <li key={ev.id} className="rounded border px-2 py-1">
            <span className="text-ink-secondary">{ev.from_status}</span>
            {' → '}
            <span className="font-medium">{ev.to_status}</span>
            <span className="text-xs text-ink-muted"> · {ev.actor_role}</span>
            {ev.note ? <p className="text-xs mt-0.5">{ev.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
