import { client } from '@/lib/api';

export interface PaymentStatus {
  quote_id: number;
  service_request_id: number;
  status: string;
  paid: boolean;
  amount?: string | null;
  currency: string;
  paid_at?: string | null;
  can_pay: boolean;
  quote_status?: string | null;
  payments_enabled: boolean;
  webhook_configured?: boolean;
  receipt_url?: string | null;
}

export interface PaymentConfig {
  payments_enabled: boolean;
  webhook_configured: boolean;
  checkout_ready: boolean;
  mode: 'test' | 'live' | 'unset' | string;
  currency: string;
  frontend_url_configured: boolean;
}

export interface CheckoutSession {
  session_id: string;
  url: string;
}

export interface CheckoutVerifyResult {
  session_id: string;
  status: string;
  payment_status: string;
  paid: boolean;
  quote_id?: number | null;
  service_request_id?: number | null;
  amount_total: number;
  currency: string;
  receipt_url?: string | null;
}

export type PaymentErrorCode = 'not_configured' | 'not_found' | 'bad_request' | 'gateway' | 'generic';

export class PaymentClientError extends Error {
  readonly code: PaymentErrorCode;

  constructor(message: string, code: PaymentErrorCode) {
    super(message);
    this.name = 'PaymentClientError';
    this.code = code;
  }
}

function classifyPaymentError(status: number, detail?: string): PaymentClientError {
  const message = detail ?? 'Payment request failed';
  if (status === 400 && /not configured|online payments/i.test(message)) {
    return new PaymentClientError(message, 'not_configured');
  }
  if (status === 404) {
    return new PaymentClientError(message, 'not_found');
  }
  if (status === 400) {
    return new PaymentClientError(message, 'bad_request');
  }
  if (status === 502 || status === 503) {
    return new PaymentClientError(message, 'gateway');
  }
  return new PaymentClientError(message, 'generic');
}

async function invokePayments<T>(url: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  try {
    const response = await client.apiCall.invoke({
      url,
      method,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return response.data as T;
  } catch (error) {
    const err = error as { status?: number; response?: { status?: number; data?: { detail?: string } }; message?: string };
    const status = err.status ?? err.response?.status ?? 0;
    const detail =
      typeof err.response?.data?.detail === 'string'
        ? err.response.data.detail
        : err.message;
    if (status > 0) {
      throw classifyPaymentError(status, detail);
    }
    throw new PaymentClientError(detail ?? 'Payment request failed', 'generic');
  }
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  return invokePayments<PaymentConfig>('/api/v1/payments/config', 'GET');
}

export async function getQuotePaymentStatus(requestId: number): Promise<PaymentStatus> {
  return invokePayments<PaymentStatus>(`/api/v1/payments/service-requests/${requestId}/status`, 'GET');
}

export async function createQuoteCheckout(requestId: number): Promise<CheckoutSession> {
  return invokePayments<CheckoutSession>(`/api/v1/payments/service-requests/${requestId}/checkout`, 'POST');
}

const VERIFY_RETRY_MS = [0, 2000, 4000, 8000, 8000];

export async function verifyCheckoutSessionOnce(sessionId: string): Promise<CheckoutVerifyResult> {
  return invokePayments<CheckoutVerifyResult>(`/api/v1/payments/checkout/${sessionId}`, 'GET');
}

export async function verifyCheckoutSession(sessionId: string): Promise<CheckoutVerifyResult> {
  let lastError: unknown;
  let lastResult: CheckoutVerifyResult | null = null;
  for (let attempt = 0; attempt < VERIFY_RETRY_MS.length; attempt += 1) {
    if (VERIFY_RETRY_MS[attempt] > 0) {
      await new Promise((resolve) => setTimeout(resolve, VERIFY_RETRY_MS[attempt]));
    }
    try {
      const result = await verifyCheckoutSessionOnce(sessionId);
      lastResult = result;
      if (result.paid) {
        return result;
      }
      if (attempt === VERIFY_RETRY_MS.length - 1) {
        return result;
      }
    } catch (error) {
      lastError = error;
      if (attempt === VERIFY_RETRY_MS.length - 1) {
        throw error;
      }
    }
  }
  if (lastResult) {
    return lastResult;
  }
  throw lastError ?? new PaymentClientError('Could not verify checkout session', 'generic');
}

export async function getOpsPaymentStatus(requestId: number): Promise<PaymentStatus> {
  return invokePayments<PaymentStatus>(
    `/api/v1/payments/operations/service-requests/${requestId}/status`,
    'GET',
  );
}
