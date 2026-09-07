export type ServiceRequestStatus = 'submitted' | 'under_review';

export interface ServiceRequestSummary {
  id: number;
  reference_code: string;
  journey_type: string;
  request_type: string;
  status: ServiceRequestStatus | string;
  city?: string | null;
  desired_service?: string | null;
  created_at?: string | null;
}

export interface ServiceRequestIntakeSnapshot {
  snapshot_version: number;
  journey_type?: string;
  city?: string;
  land_ownership_type?: string;
  land_area_sqm?: number;
  has_documents?: boolean;
  document_notes?: string;
  document_refs?: Array<{ label: string; url?: string | null }>;
  desired_service?: string;
  draft_status?: string;
  assembled_at?: string;
}

export interface ServiceRequestDetail {
  id: number;
  reference_code: string;
  journey_type: string;
  request_type: string;
  status: ServiceRequestStatus | string;
  intake_snapshot: ServiceRequestIntakeSnapshot;
  journey_instance_id: number;
  source_channel?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServiceRequestListResponse {
  items: ServiceRequestSummary[];
}
