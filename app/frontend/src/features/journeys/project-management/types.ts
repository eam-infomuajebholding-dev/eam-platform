export const PROJECT_MANAGEMENT_JOURNEY_TYPE = 'project_management';

export interface ProjectManagementContext {
  project_type?: string;
  project_stage?: string;
  project_objective?: string;
  current_status?: string;
  scope_clarity?: string;
  desired_timeline?: string;
  urgency?: string;
  budget_state?: string;
  main_challenges?: string;
  top_risks?: string;
  stakeholder_notes?: string;
  engagement_goal?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
