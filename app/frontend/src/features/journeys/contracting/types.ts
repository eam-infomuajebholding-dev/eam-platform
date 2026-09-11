export const CONTRACTING_JOURNEY_TYPE = 'contracting';

export interface ContractingPreliminaryBrief {
  status: string;
  assistance: string;
  professional_review_required: boolean;
  title: string;
  understood_request?: string;
  missing_information?: string[];
  preliminary_considerations?: string[];
  recommended_next_step?: string;
  readiness?: Record<string, unknown>;
}

export interface ContractingContext {
  project_type?: string;
  project_description?: string;
  current_stage?: string;
  location?: string;
  design_readiness?: string;
  boq_readiness?: string;
  site_readiness?: string;
  scope_type?: string;
  procurement_goal?: string;
  desired_start?: string;
  urgency?: string;
  budget_range?: string;
  requirements_notes?: string;
  experience_type?: string;
  drawings_available?: boolean;
  boq_available?: boolean;
  permits_available?: boolean;
  site_photos_available?: boolean;
  document_notes?: string;
  preliminary_brief?: ContractingPreliminaryBrief;
  intake_draft?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
