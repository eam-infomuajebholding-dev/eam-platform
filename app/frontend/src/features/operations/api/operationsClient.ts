import { client } from '@/lib/api';

export interface OperationsServiceRequestSummary {
  id: number;
  reference_code: string;
  journey_type: string;
  request_type: string;
  status: string;
  user_id: string;
  created_at?: string;
}

export interface ServiceRequestTransition {
  id: number;
  from_status: string;
  to_status: string;
  actor_user_id: string;
  actor_role: string;
  reason?: string | null;
  customer_message?: string | null;
  internal_note?: string | null;
  created_at?: string;
}

export interface OperationsServiceRequestDetail extends OperationsServiceRequestSummary {
  intake_snapshot: Record<string, unknown>;
  journey_instance_id: number;
  source_channel?: string | null;
  updated_at?: string;
  transitions: ServiceRequestTransition[];
}

async function invokeOperations<T>(url: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const response = await client.apiCall.invoke({
    url,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return response.data as T;
}

export async function listOperationsServiceRequests(
  status?: string,
  journeyType?: string,
): Promise<OperationsServiceRequestSummary[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (journeyType) params.set('journey_type', journeyType);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await invokeOperations<{ items: OperationsServiceRequestSummary[] }>(
    `/api/v1/operations/service-requests${query}`,
    'GET',
  );
  return response.items;
}

export async function recordInternalNote(
  requestId: number,
  internalNote: string,
): Promise<OperationsServiceRequestDetail> {
  return invokeOperations<OperationsServiceRequestDetail>(
    `/api/v1/operations/service-requests/${requestId}/internal-note`,
    'POST',
    { internal_note: internalNote },
  );
}

export async function getOperationsServiceRequest(
  requestId: number,
): Promise<OperationsServiceRequestDetail> {
  return invokeOperations<OperationsServiceRequestDetail>(
    `/api/v1/operations/service-requests/${requestId}`,
    'GET',
  );
}

export async function startProfessionalReview(
  requestId: number,
  internalNote?: string,
): Promise<OperationsServiceRequestDetail> {
  return invokeOperations<OperationsServiceRequestDetail>(
    `/api/v1/operations/service-requests/${requestId}/start-review`,
    'POST',
    { internal_note: internalNote ?? null },
  );
}

export async function requestMoreInformation(
  requestId: number,
  customerMessage: string,
  internalNote?: string,
): Promise<OperationsServiceRequestDetail> {
  return invokeOperations<OperationsServiceRequestDetail>(
    `/api/v1/operations/service-requests/${requestId}/request-information`,
    'POST',
    { customer_message: customerMessage, internal_note: internalNote ?? null },
  );
}

export async function qualifyServiceRequest(
  requestId: number,
  reason?: string,
  internalNote?: string,
): Promise<OperationsServiceRequestDetail> {
  return invokeOperations<OperationsServiceRequestDetail>(
    `/api/v1/operations/service-requests/${requestId}/qualify`,
    'POST',
    { reason: reason ?? null, internal_note: internalNote ?? null },
  );
}
