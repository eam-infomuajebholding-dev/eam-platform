import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import {
  fetchPartnerMe,
  listPartnerOrders,
  respondPartnerOrder,
} from '@/features/partners/api/partnerPortalClient';
import {
  listPartnerDeliveryShipments,
  updatePartnerShipmentStatus,
} from '@/features/logistics/api/logisticsClient';

const SHIP_STATUS_AR: Record<string, string> = {
  awaiting_dispatch: 'بانتظار الشحن',
  dispatched: 'تم الشحن',
  in_transit: 'في الطريق',
  out_for_delivery: 'خارج للتسليم',
  delivered: 'مُسلَّم',
  delivery_failed: 'فشل التسليم',
  cancelled: 'ملغى',
};

export default function PartnerPortalPage() {
  const queryClient = useQueryClient();
  const [dispatchTargetId, setDispatchTargetId] = useState<number | null>(null);
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const meQuery = useQuery({ queryKey: ['partner', 'me'], queryFn: fetchPartnerMe });
  const ordersQuery = useQuery({
    queryKey: ['partner', 'orders', 'pending'],
    queryFn: () => listPartnerOrders('pending_partner'),
  });

  const shipmentsQuery = useQuery({
    queryKey: ['partner', 'shipments'],
    queryFn: () => listPartnerDeliveryShipments(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      respondPartnerOrder(id, { accept }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['partner', 'orders'] });
      await queryClient.invalidateQueries({ queryKey: ['partner', 'shipments'] });
    },
  });

  const shipMutation = useMutation({
    mutationFn: ({
      id,
      status,
      tracking_number,
      carrier_name,
    }: {
      id: number;
      status: string;
      tracking_number?: string;
      carrier_name?: string;
    }) => updatePartnerShipmentStatus(id, { status, tracking_number, carrier_name }),
    onSuccess: async () => {
      setDispatchTargetId(null);
      setCarrierName('');
      setTrackingNumber('');
      await queryClient.invalidateQueries({ queryKey: ['partner', 'shipments'] });
    },
  });

  const openDispatchForm = (shipmentId: number) => {
    setDispatchTargetId(shipmentId);
    setCarrierName('');
    setTrackingNumber('');
  };

  return (
    <Layout>
      <PageMeta title="بوابة الشركاء | EAM" />
      <section className="py-12 md:py-16 bg-cream-light dark:bg-background min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-3xl" dir="rtl">
          <h1 className="gold-text text-2xl md:text-3xl font-bold font-display mb-2">بوابة الشركاء</h1>
          {meQuery.data ? (
            <p className="text-ink-secondary mb-6">{meQuery.data.display_name_ar}</p>
          ) : null}

          <div className="rounded-2xl border border-gold/20 bg-cream dark:bg-dark p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-ink">طلبات بانتظار قبولكم</h2>
            {ordersQuery.isLoading ? (
              <p className="text-sm text-ink-secondary">جاري التحميل...</p>
            ) : (ordersQuery.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-ink-secondary">لا توجد طلبات معلّقة حالياً.</p>
            ) : (
              <ul className="space-y-3">
                {ordersQuery.data?.items.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-gold/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="text-sm">
                      <p className="font-semibold">{order.reference_code}</p>
                      <p className="text-ink-secondary">{order.journey_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={respondMutation.isPending}
                        onClick={() => respondMutation.mutate({ id: order.id, accept: true })}
                        className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        قبول
                      </button>
                      <button
                        type="button"
                        disabled={respondMutation.isPending}
                        onClick={() => respondMutation.mutate({ id: order.id, accept: false })}
                        className="rounded-lg border border-soft-border px-3 py-1.5 text-xs font-semibold"
                      >
                        رفض
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-gold/20 bg-cream dark:bg-dark p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-ink">شحنات التوصيل</h2>
            {shipmentsQuery.isLoading ? (
              <p className="text-sm text-ink-secondary">جاري التحميل...</p>
            ) : (shipmentsQuery.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-ink-secondary">لا توجد شحنات نشطة — تظهر بعد قبول الطلب.</p>
            ) : (
              <ul className="space-y-3">
                {shipmentsQuery.data?.items.map((sh) => (
                  <li key={sh.id} className="rounded-xl border border-gold/15 px-4 py-3 space-y-2">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-semibold" dir="ltr">
                        {sh.reference_code}
                      </span>
                      <span className="text-ink-secondary">{SHIP_STATUS_AR[sh.status] ?? sh.status}</span>
                    </div>
                    {sh.delivery_address ? (
                      <p className="text-xs text-ink-secondary">{sh.delivery_address}</p>
                    ) : null}
                    {sh.tracking_number ? (
                      <p className="text-xs" dir="ltr">
                        {sh.carrier_name ? `${sh.carrier_name}: ` : ''}
                        {sh.tracking_number}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {sh.status === 'awaiting_dispatch' ? (
                        dispatchTargetId === sh.id ? (
                          <div className="w-full space-y-2 rounded-lg border border-gold/30 p-3">
                            <p className="text-xs text-ink-secondary">
                              أدخل الناقل ورقم التتبع قبل تسجيل «تم الشحن».
                            </p>
                            <input
                              type="text"
                              value={carrierName}
                              onChange={(e) => setCarrierName(e.target.value)}
                              placeholder="اسم الناقل"
                              className="w-full rounded border px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="رقم التتبع"
                              className="w-full rounded border px-2 py-1 text-sm"
                              dir="ltr"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  shipMutation.isPending ||
                                  !trackingNumber.trim() ||
                                  !carrierName.trim()
                                }
                                onClick={() =>
                                  shipMutation.mutate({
                                    id: sh.id,
                                    status: 'dispatched',
                                    tracking_number: trackingNumber.trim(),
                                    carrier_name: carrierName.trim(),
                                  })
                                }
                                className="rounded-lg bg-gold px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                تأكيد الشحن
                              </button>
                              <button
                                type="button"
                                onClick={() => setDispatchTargetId(null)}
                                className="rounded-lg border px-3 py-1 text-xs"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={shipMutation.isPending}
                            onClick={() => openDispatchForm(sh.id)}
                            className="rounded-lg bg-gold px-3 py-1 text-xs font-semibold text-white"
                          >
                            تجهيز للشحن
                          </button>
                        )
                      ) : null}
                      {sh.status === 'dispatched' ? (
                        <button
                          type="button"
                          disabled={shipMutation.isPending}
                          onClick={() => shipMutation.mutate({ id: sh.id, status: 'in_transit' })}
                          className="rounded-lg border border-gold px-3 py-1 text-xs font-semibold text-gold"
                        >
                          في الطريق
                        </button>
                      ) : null}
                      {sh.status === 'in_transit' || sh.status === 'out_for_delivery' ? (
                        <button
                          type="button"
                          disabled={shipMutation.isPending}
                          onClick={() => shipMutation.mutate({ id: sh.id, status: 'delivered' })}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          تم التسليم
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-xs text-ink-secondary leading-relaxed">
            للتكامل الآلي (ERP/POS): استخدم مفتاح API وWebhooks من فريق EAM. التحقق من التوقيع عبر
            رأس <span dir="ltr">X-EAM-Signature</span> و الطابع <span dir="ltr">X-EAM-Timestamp</span>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
