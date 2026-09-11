export const FACILITY_MANAGEMENT_JOURNEY_TYPE = 'facility_management';

export interface FacilityManagementContext {
  facility_type?: string;
  location?: string;
  facility_scope?: string;
  operational_challenge?: string;
  service_maturity?: string;
  engagement_goal?: string;
  target_timeline?: string;
  urgency?: string;
  current_readiness?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
