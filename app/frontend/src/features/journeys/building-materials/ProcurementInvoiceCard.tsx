import BuyerLiabilityTermsBlock from './BuyerLiabilityTermsBlock';

type LineItem = {
  description: string;
  quantity: number;
  unit?: string;
  unit_price?: number | null;
  line_total?: number | null;
};

type LiabilityTerms = {
  title?: string;
  version?: string;
  clauses?: { heading: string; body: string }[];
};

type Invoice = {
  title?: string;
  status?: string;
  line_items?: LineItem[];
  subtotal?: number | null;
  vat_amount?: number | null;
  total_amount?: number | null;
  currency?: string;
  payment_note?: string;
  buyer_liability_terms?: LiabilityTerms;
};

function formatMoney(value: number | null | undefined, currency = 'SAR'): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(value);
}

export default function ProcurementInvoiceCard({
  invoice,
  showLiabilityTerms = true,
}: {
  invoice: Invoice;
  showLiabilityTerms?: boolean;
}) {
  const items = invoice.line_items ?? [];

  return (
    <div className="rounded-xl border border-gold/30 bg-surface-elevated p-4 space-y-4" dir="rtl">
      <div>
        <h3 className="text-lg font-semibold text-gold">{invoice.title ?? 'فاتورة مواد البناء'}</h3>
        {invoice.status ? (
          <p className="text-xs text-ink-secondary mt-1">الحالة: {invoice.status}</p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-secondary">لا توجد بنود في الفاتورة بعد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-ink-secondary">
                <th className="py-2 text-right font-medium">المادة</th>
                <th className="py-2 text-right font-medium">الكمية</th>
                <th className="py-2 text-right font-medium">السعر</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.description}-${index}`} className="border-b border-gold/10">
                  <td className="py-2 pr-1">{item.description}</td>
                  <td className="py-2 whitespace-nowrap">
                    {item.quantity} {item.unit ?? ''}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {item.line_total != null
                      ? formatMoney(item.line_total, invoice.currency)
                      : item.unit_price != null
                        ? formatMoney(item.unit_price, invoice.currency)
                        : 'بانتظار التسعير'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-1 text-sm border-t border-gold/20 pt-3">
        <div className="flex justify-between">
          <span className="text-ink-secondary">المجموع الفرعي</span>
          <span>{formatMoney(invoice.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-secondary">ضريبة القيمة المضافة</span>
          <span>{formatMoney(invoice.vat_amount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold text-gold">
          <span>الإجمالي</span>
          <span>{formatMoney(invoice.total_amount, invoice.currency)}</span>
        </div>
      </div>

      {invoice.payment_note ? (
        <p className="text-xs text-ink-secondary leading-relaxed">{invoice.payment_note}</p>
      ) : null}

      {showLiabilityTerms ? (
        <BuyerLiabilityTermsBlock terms={invoice.buyer_liability_terms} compact />
      ) : null}
    </div>
  );
}
