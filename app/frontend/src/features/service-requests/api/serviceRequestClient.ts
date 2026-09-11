import { client } from '@/lib/api';
import type { ServiceRequestDetail, ServiceRequestListResponse } from './types';

async function invokeServiceRequests<T>(url: string, method: 'GET'): Promise<T> {
  const response = await client.apiCall.invoke({ url, method });
  return response.data as T;
}

export async function listServiceRequests(): Promise<ServiceRequestListResponse['items']> {
  const response = await invokeServiceRequests<ServiceRequestListResponse>(
    '/api/v1/service-requests',
    'GET',
  );
  return response.items;
}

export async function getServiceRequest(requestId: number): Promise<ServiceRequestDetail> {
  return invokeServiceRequests<ServiceRequestDetail>(`/api/v1/service-requests/${requestId}`, 'GET');
}

export async function submitCustomerResponse(
  requestId: number,
  message: string,
): Promise<ServiceRequestDetail> {
  const response = await client.apiCall.invoke({
    url: `/api/v1/service-requests/${requestId}/customer-response`,
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return response.data as ServiceRequestDetail;
}
