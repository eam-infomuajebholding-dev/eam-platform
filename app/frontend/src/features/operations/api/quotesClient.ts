import { client } from '@/lib/api';

export interface QuoteLineItem {
  id: number;
  description: string;
  quantity: string;
  unit_price: string;
  sort_order: number;
  line_total: string;
}

export interface QuoteDetail {
  id: number;
  service_request_id: number;
  reference_code: string;
  status: string;
  currency: string;
  subtotal: string;
  vat_rate: string;
  vat_amount: string;
  total_amount: string;
  valid_until?: string | null;
  issued_at?: string | null;
  created_by_user_id: string;
  approved_by_user_id?: string | null;
  internal_note?: string | null;
  line_items: QuoteLineItem[];
}

async function invokeQuotes<T>(url: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  const response = await client.apiCall.invoke({
    url,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return response.data as T;
}

export async function getQuoteForServiceRequest(requestId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/service-requests/${requestId}/quote`, 'GET');
}

export async function createQuoteDraft(requestId: number, internalNote?: string): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/service-requests/${requestId}/quotes`, 'POST', {
    internal_note: internalNote ?? null,
  });
}

export async function addQuoteLineItem(
  quoteId: number,
  description: string,
  quantity: string,
  unitPrice: string,
): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/quotes/${quoteId}/line-items`, 'POST', {
    description,
    quantity,
    unit_price: unitPrice,
  });
}

export async function deleteQuoteLineItem(quoteId: number, lineItemId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(
    `/api/v1/operations/quotes/${quoteId}/line-items/${lineItemId}`,
    'DELETE',
  );
}

export async function submitQuoteForApproval(quoteId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/quotes/${quoteId}/submit`, 'POST');
}

export async function approveQuote(quoteId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/quotes/${quoteId}/approve`, 'POST');
}

export async function issueQuote(quoteId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/operations/quotes/${quoteId}/issue`, 'POST');
}

export async function getCustomerIssuedQuote(requestId: number): Promise<QuoteDetail> {
  return invokeQuotes<QuoteDetail>(`/api/v1/service-requests/${requestId}/quote`, 'GET');
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  pending_approval: 'بانتظار الموافقة',
  approved: 'معتمد',
  issued: 'صادر للعميل',
  cancelled: 'ملغى',
};

export function formatSar(value: string | number): string {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
}
