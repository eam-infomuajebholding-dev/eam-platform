import { client } from '@/lib/api';

async function invoke<T>(url: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const response = await client.apiCall.invoke({
    url,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return response.data as T;
}

export type PartnerMe = {
  partner_org_id: number;
  partner_slug: string;
  display_name_ar: string;
  role: string;
};

export type PartnerOrderSummary = {
  id: number;
  reference_code: string;
  journey_type: string;
  status: string;
  partner_assignment_status: string;
  created_at?: string | null;
};

export async function fetchPartnerMe(): Promise<PartnerMe> {
  return invoke('/api/v1/partner/me', 'GET');
}

export async function listPartnerOrders(assignmentStatus?: string): Promise<{ items: PartnerOrderSummary[] }> {
  const q = assignmentStatus ? `?assignment_status=${encodeURIComponent(assignmentStatus)}` : '';
  return invoke(`/api/v1/partner/service-requests${q}`, 'GET');
}

export async function respondPartnerOrder(
  requestId: number,
  body: { accept: boolean; decline_reason?: string },
): Promise<PartnerOrderSummary> {
  return invoke(`/api/v1/partner/service-requests/${requestId}/respond`, 'POST', body);
}
