import { client } from '@/lib/api';
import type { CommandCenterOverview, CommandSearchResponse, EvidenceResponse, ExecutiveBrief } from '../types';

async function invoke<T>(url: string): Promise<T> {
  const response = await client.apiCall.invoke({ url, method: 'GET' });
  return response.data as T;
}

export async function fetchCommandCenterOverview(): Promise<CommandCenterOverview> {
  return invoke<CommandCenterOverview>('/api/v1/operations/command-center/overview');
}

export async function fetchExecutiveBrief(question?: string): Promise<ExecutiveBrief> {
  const suffix = question ? `?question=${encodeURIComponent(question)}` : '';
  return invoke<ExecutiveBrief>(`/api/v1/operations/command-center/executive-brief${suffix}`);
}

export async function fetchMetricEvidence(metricId: string): Promise<EvidenceResponse> {
  return invoke<EvidenceResponse>(`/api/v1/operations/command-center/evidence/${metricId}`);
}

export async function searchCommandCenter(query: string): Promise<CommandSearchResponse> {
  return invoke<CommandSearchResponse>(
    `/api/v1/operations/command-center/search?q=${encodeURIComponent(query)}`,
  );
}
