import { client } from '@/lib/api';

export type PlatformReadiness = {
  overall: 'READY' | 'DEGRADED' | 'BLOCKED';
  core_operational: boolean;
  blockers: { id: string; label_ar: string; detail_ar: string }[];
  pending_external: { id: string; label_ar: string; detail_ar: string; env_keys?: string | null }[];
  pending_business: { id: string; label_ar: string; detail_ar: string }[];
  alembic: { expected_head: string; current_head?: string | null; aligned: boolean };
  auth: { jwt_configured: boolean; oidc_configured: boolean };
  payments: { checkout_ready: boolean; mode: string };
};

export async function fetchPlatformReadiness(): Promise<PlatformReadiness> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/platform/readiness',
    method: 'GET',
  });
  return response.data as PlatformReadiness;
}
