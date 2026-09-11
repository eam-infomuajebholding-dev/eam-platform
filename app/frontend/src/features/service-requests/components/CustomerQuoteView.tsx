import { useQuery } from '@tanstack/react-query';
import {
  QUOTE_STATUS_LABELS,
  formatSar,
  getCustomerIssuedQuote,
} from '@/features/operations/api/quotesClient';

interface Props {
  requestId: number;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(value));
}

export default function CustomerQuoteView({ requestId }: Props) {
  const quoteQuery = useQuery({
    queryKey: ['customer', 'quote', requestId],
    queryFn: () => getCustomerIssuedQuote(requestId),
    retry: false,
  });

  if (quoteQuery.isLoading || quoteQuery.isError || !quoteQuery.data) {
    return null;
  }

  const quote = quoteQuery.data;

  return (
    <div className="rounded-xl border border-gold/25 bg-gold/5 p-5 font-tajawal">
      <h3 className="text-lg font-bold text-ink dark:text-white">
        عرض سعر — {quote.reference_code}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-white/70">
        {QUOTE_STATUS_LABELS[quote.status] ?? quote.status} · صالح حتى {formatDate(quote.valid_until)}
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        {quote.line_items.map((item) => (
          <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-gold/10 pb-2">
            <span>{item.description}</span>
            <span>
              {item.quantity} × {formatSar(item.unit_price)} = {formatSar(item.line_total)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 text-sm">
        <p>المجموع الفرعي: {formatSar(quote.subtotal)}</p>
        <p>ضريبة القيمة المضافة (15%): {formatSar(quote.vat_amount)}</p>
        <p className="text-base font-bold">الإجمالي: {formatSar(quote.total_amount)}</p>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        هذا عرض أولي — الأسعار بالريال السعودي حصراً للضريبة. للقبول أو الاستفسار تواصل مع فريق EAM.
      </p>
    </div>
  );
}
