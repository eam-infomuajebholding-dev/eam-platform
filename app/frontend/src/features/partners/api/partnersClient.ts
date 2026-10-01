import { client } from '@/lib/api';

async function invoke<T>(url: string, method: 'GET' | 'POST' | 'PATCH', body?: unknown): Promise<T> {
  const response = await client.apiCall.invoke({
    url,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return response.data as T;
}

export type PartnerResolveResponse = {
  partner: {
    slug: string;
    display_name_ar: string;
    display_name_en?: string | null;
    sector_slugs: string[];
    journey_types: string[];
    status: string;
    outlets: { outlet_code: string; name_ar: string; city?: string | null }[];
  };
  outlet?: {
    outlet_code: string;
    name_ar: string;
    city?: string | null;
  } | null;
  sample_journey_links: { journey_type: string; path: string }[];
};

export type PartnerOrganizationSummary = {
  id: number;
  slug: string;
  legal_name: string;
  display_name_ar: string;
  status: string;
  journey_types: string[];
  sector_slugs: string[];
  contact_email?: string | null;
};

export type PartnerOrganizationDetail = PartnerOrganizationSummary & {
  internal_notes?: string | null;
  outlets: {
    id: number;
    outlet_code: string;
    name_ar: string;
    city?: string | null;
    is_active: boolean;
  }[];
  sample_journey_links: { journey_type: string; path: string }[];
};

export async function resolvePartner(partner: string, outlet?: string | null): Promise<PartnerResolveResponse> {
  const params = new URLSearchParams({ partner });
  if (outlet) {
    params.set('outlet', outlet);
  }
  return invoke<PartnerResolveResponse>(`/api/v1/partners/resolve?${params.toString()}`, 'GET');
}

export async function listOperationsPartners(): Promise<{ items: PartnerOrganizationSummary[] }> {
  return invoke('/api/v1/operations/partners', 'GET');
}

export async function createOperationsPartner(body: Record<string, unknown>): Promise<PartnerOrganizationSummary> {
  return invoke('/api/v1/operations/partners', 'POST', body);
}

export async function getOperationsPartner(orgId: number): Promise<PartnerOrganizationDetail> {
  return invoke(`/api/v1/operations/partners/${orgId}`, 'GET');
}

export async function updateOperationsPartner(
  orgId: number,
  body: Record<string, unknown>,
): Promise<PartnerOrganizationSummary> {
  return invoke(`/api/v1/operations/partners/${orgId}`, 'PATCH', body);
}

export async function createOperationsPartnerOutlet(
  orgId: number,
  body: Record<string, unknown>,
): Promise<{ id: number; outlet_code: string; name_ar: string }> {
  return invoke(`/api/v1/operations/partners/${orgId}/outlets`, 'POST', body);
}

export async function inviteOperationsPartnerMember(
  orgId: number,
  body: { user_email: string; role?: string },
): Promise<{ id: number; user_id: string; role: string }> {
  return invoke(`/api/v1/operations/partners/${orgId}/members`, 'POST', body);
}

export type PartnerApiKeyCreated = {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  api_key: string;
  message?: string;
};

export type PartnerApiKeySummary = {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
};

export async function createOperationsPartnerApiKey(
  orgId: number,
  body: { name: string; scopes?: string[] },
): Promise<PartnerApiKeyCreated> {
  return invoke(`/api/v1/operations/partners/${orgId}/api-keys`, 'POST', body);
}

export async function listOperationsPartnerApiKeys(orgId: number): Promise<PartnerApiKeySummary[]> {
  return invoke(`/api/v1/operations/partners/${orgId}/api-keys`, 'GET');
}

export type PartnerWebhookCreated = {
  id: number;
  url: string;
  event_types: string[];
  signing_secret: string;
};

export type PartnerWebhookSummary = {
  id: number;
  url: string;
  event_types: string[];
  description?: string | null;
  is_active: boolean;
};

export async function createOperationsPartnerWebhook(
  orgId: number,
  body: { url: string; description?: string; event_types?: string[] },
): Promise<PartnerWebhookCreated> {
  return invoke(`/api/v1/operations/partners/${orgId}/webhooks`, 'POST', body);
}

export async function listOperationsPartnerWebhooks(orgId: number): Promise<PartnerWebhookSummary[]> {
  return invoke(`/api/v1/operations/partners/${orgId}/webhooks`, 'GET');
}

export type PartnerWebhookDeliverySummary = {
  id: number;
  subscription_id: number;
  event_type: string;
  response_status?: number | null;
  success: boolean;
  error_message?: string | null;
  created_at?: string | null;
};

export async function listOperationsPartnerWebhookDeliveries(
  orgId: number,
): Promise<PartnerWebhookDeliverySummary[]> {
  return invoke(`/api/v1/operations/partners/${orgId}/webhook-deliveries`, 'GET');
}
