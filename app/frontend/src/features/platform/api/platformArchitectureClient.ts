import { client } from '@/lib/api';

export type PlatformArchitectureSector = {
  sector_number: number;
  sector_slug: string;
  title_ar: string;
  business_capability: string;
  journey_type: string | null;
  journey_status: string;
  business_services: string[];
  business_objects: string[];
  experience: { marketing_route: string; journey_route: string | null };
  notes_ar?: string;
};

export type PlatformArchitectureResponse = {
  schema_version: string;
  layer_model: string[];
  workflow_authority: string;
  platform_business_services: { id: string; label_ar: string; authority: string }[];
  sectors: PlatformArchitectureSector[];
  summary: {
    sector_count: number;
    live_journey_count: number;
    planned_or_blocked_sectors: number;
  };
};

export async function fetchPlatformArchitecture(): Promise<PlatformArchitectureResponse> {
  const response = await client.apiCall.invoke({
    url: '/api/v1/platform/architecture',
    method: 'GET',
  });
  return response.data as PlatformArchitectureResponse;
}
