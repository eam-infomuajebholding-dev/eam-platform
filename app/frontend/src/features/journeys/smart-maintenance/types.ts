export const SMART_MAINTENANCE_JOURNEY_TYPE = 'smart_maintenance';

export interface SmartMaintenanceContext {
  maintenance_category?: string;
  location?: string;
  issue_description?: string;
  severity_level?: string;
  access_readiness?: string;
  system_notes?: string;
  prior_maintenance?: boolean;
  service_notes?: string;
  engagement_goal?: string;
  desired_timeline?: string;
  urgency?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
