import { client } from '@/lib/api';
import type { ServiceRequestSummary } from '@/features/service-requests/api/types';

export interface CustomerProfileSummary {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface ActiveJourneySummary {
  id: number;
  journey_type: string;
  current_step_key: string;
  status: string;
  updated_at?: string | null;
}

export interface Customer360Response {
  profile: CustomerProfileSummary;
  service_requests: ServiceRequestSummary[];
  active_journeys: ActiveJourneySummary[];
  summary: {
    service_request_count?: number;
    active_journey_count?: number;
    service_request_status_counts?: Record<string, number>;
  };
}

export async function getCustomerWorkspace(): Promise<Customer360Response> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/customer/workspace',
    method: 'GET',
  });
  return response.data as Customer360Response;
}
