import { client } from '@/lib/api';
import type { CommandCenterOverview, CommandSearchResponse, EvidenceResponse, ExecutiveBrief } from '../types';

export type CommandCenterDelegation = {
  id: number;
  delegate_user_id: string;
  delegate_email: string;
  delegate_name?: string | null;
  granted_by_user_id: string;
  permissions: string[];
  note?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
};

async function invoke<T>(url: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: unknown): Promise<T> {
  const response = await client.apiCall.invoke({ url, method, ...(body ? { data: body } : {}) });
  return response.data as T;
}

export async function fetchCommandCenterOverview(): Promise<CommandCenterOverview> {
  return invoke<CommandCenterOverview>('/api/v1/operations/command-center/overview');
}

export async function fetchExecutiveBrief(
  question?: string,
  hints?: { locale?: 'ar' | 'en'; route?: string },
): Promise<ExecutiveBrief> {
  const params = new URLSearchParams();
  if (question) params.set('question', question);
  params.set('locale', hints?.locale ?? 'ar');
  params.set('route', hints?.route ?? '/command-center');
  return invoke<ExecutiveBrief>(`/api/v1/operations/command-center/executive-brief?${params.toString()}`);
}

export async function fetchMetricEvidence(metricId: string): Promise<EvidenceResponse> {
  return invoke<EvidenceResponse>(`/api/v1/operations/command-center/evidence/${metricId}`);
}

export async function searchCommandCenter(query: string): Promise<CommandSearchResponse> {
  return invoke<CommandSearchResponse>(
    `/api/v1/operations/command-center/search?q=${encodeURIComponent(query)}`,
  );
}

export async function fetchCommandCenterDelegations(): Promise<CommandCenterDelegation[]> {
  return invoke<CommandCenterDelegation[]>('/api/v1/operations/command-center/delegations');
}

export async function createCommandCenterDelegation(payload: {
  delegate_email: string;
  note?: string;
}): Promise<CommandCenterDelegation> {
  return invoke<CommandCenterDelegation>(
    '/api/v1/operations/command-center/delegations',
    'POST',
    payload,
  );
}

export async function revokeCommandCenterDelegation(delegationId: number): Promise<void> {
  await invoke<void>(`/api/v1/operations/command-center/delegations/${delegationId}`, 'DELETE');
}
