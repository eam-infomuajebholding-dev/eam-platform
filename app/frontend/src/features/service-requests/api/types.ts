export type ServiceRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'awaiting_information'
  | 'qualified';

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

export interface PreliminaryBriefSnapshot {
  status?: string;
  assistance?: string;
  professional_review_required?: boolean;
  title?: string;
  understood_request?: string;
  project_intent?: Record<string, unknown>;
  land_summary?: Record<string, unknown>;
  missing_information?: string[];
  preliminary_considerations?: string[];
  recommended_next_step?: string;
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
  problem_statement?: string;
  desired_outcome?: string;
  discipline?: string;
  project_type?: string;
  project_description?: string;
  location?: string;
  objective?: string;
  current_stage?: string;
  design_readiness?: string;
  boq_readiness?: string;
  site_readiness?: string;
  scope_type?: string;
  procurement_goal?: string;
  budget_range?: string;
  desired_start?: string;
  urgency?: string;
  scope_confirmed?: boolean;
  valuation_purpose?: string;
  asset_type?: string;
  asset_description?: string;
  area_sqm?: number;
  ownership_status?: string;
  deed_available?: boolean;
  title_docs_available?: boolean;
  rent_roll_available?: boolean;
  plans_available?: boolean;
  inspection_readiness?: string;
  desired_timeline?: string;
  engagement_goal?: string;
  project_type?: string;
  project_stage?: string;
  project_objective?: string;
  current_status?: string;
  scope_clarity?: string;
  budget_state?: string;
  main_challenges?: string;
  top_risks?: string;
  stakeholder_notes?: string;
  maintenance_category?: string;
  issue_description?: string;
  severity_level?: string;
  access_readiness?: string;
  system_notes?: string;
  prior_maintenance?: boolean;
  service_notes?: string;
  facility_type?: string;
  facility_scope?: string;
  operational_challenge?: string;
  service_maturity?: string;
  target_timeline?: string;
  current_readiness?: string;
  space_type?: string;
  furnishing_goal?: string;
  style_direction?: string;
  functional_priorities?: string;
  room_scope?: string;
  procurement_preference?: string;
  preliminary_brief?: PreliminaryBriefSnapshot;
  draft_status?: string;
  assembled_at?: string;
}

export interface ServiceRequestActivityItem {
  id: number;
  from_status: string;
  to_status: string;
  customer_message?: string | null;
  event_label?: string | null;
  created_at?: string | null;
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
  activity?: ServiceRequestActivityItem[];
  pending_customer_action?: boolean;
}

export interface ServiceRequestListResponse {
  items: ServiceRequestSummary[];
}
