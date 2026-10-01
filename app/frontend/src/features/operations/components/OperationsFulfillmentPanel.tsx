import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import {
  listOperationsProcurementOrders,
  listOperationsShipments,
} from '@/features/operations/api/fulfillmentClient';

const PO_STATUS_AR: Record<string, string> = {
  provisional: 'أولي',
  awaiting_partner: 'بانتظار الشريك',
  partner_accepted: 'قبل الشريك',
  partner_declined: 'رفض الشريك',
};

const SHIP_STATUS_AR: Record<string, string> = {
  awaiting_dispatch: 'بانتظار الشحن',
  dispatched: 'تم الشحن',
  in_transit: 'في الطريق',
  out_for_delivery: 'خارج للتسليم',
  delivered: 'مُسلَّم',
  delivery_failed: 'فشل التسليم',
};

export default function OperationsFulfillmentPanel() {
  const poQuery = useQuery({
    queryKey: ['operations', 'procurement-orders'],
    queryFn: () => listOperationsProcurementOrders(),
  });
  const shipQuery = useQuery({
    queryKey: ['operations', 'shipments', 'active'],
    queryFn: () => listOperationsShipments(),
  });

  const activeShipments = (shipQuery.data?.items ?? []).filter((s) => s.status !== 'delivered');

  return (
    <div className="mt-10 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">التوريد والتوصيل</h2>
        <button
          type="button"
          onClick={() => {
            void poQuery.refetch();
            void shipQuery.refetch();
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-soft-border px-2 py-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          تحديث
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gold/20 p-4">
          <h3 className="font-semibold mb-3">أوامر الشراء (PO)</h3>
          {poQuery.isLoading ? <p className="text-sm text-ink-secondary">جاري التحميل...</p> : null}
          {(poQuery.data?.items.length ?? 0) === 0 && !poQuery.isLoading ? (
            <p className="text-sm text-ink-secondary">لا توجد أوامر شراء بعد.</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
              {poQuery.data?.items.map((po) => (
                <li key={po.id} className="rounded-lg border border-soft-border px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs" dir="ltr">
                      {po.reference_code}
                    </span>
                    <span className="text-ink-secondary">{PO_STATUS_AR[po.status] ?? po.status}</span>
                  </div>
                  <Link
                    to={`/operations/service-requests/${po.service_request_id}`}
                    className="text-xs text-gold hover:underline"
                  >
                    فتح الطلب #{po.service_request_id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gold/20 p-4">
          <h3 className="font-semibold mb-3">شحنات نشطة</h3>
          {shipQuery.isLoading ? <p className="text-sm text-ink-secondary">جاري التحميل...</p> : null}
          {activeShipments.length === 0 && !shipQuery.isLoading ? (
            <p className="text-sm text-ink-secondary">لا شحنات قيد التنفيذ.</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
              {activeShipments.map((sh) => (
                <li key={sh.id} className="rounded-lg border border-soft-border px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs" dir="ltr">
                      {sh.reference_code}
                    </span>
                    <span>{SHIP_STATUS_AR[sh.status] ?? sh.status}</span>
                  </div>
                  {sh.tracking_number ? (
                    <p className="text-xs text-ink-secondary mt-1" dir="ltr">
                      {sh.tracking_number}
                    </p>
                  ) : null}
                  <Link
                    to={`/operations/service-requests/${sh.service_request_id}`}
                    className="text-xs text-gold hover:underline"
                  >
                    الطلب #{sh.service_request_id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
