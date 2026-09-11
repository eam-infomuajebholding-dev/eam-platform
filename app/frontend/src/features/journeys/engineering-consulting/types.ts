export type EngineeringDiscipline =
  | 'architectural'
  | 'civil_structural'
  | 'mechanical'
  | 'electrical'
  | 'multidisciplinary'
  | 'other';

export type EngineeringProjectType = 'new_build' | 'renovation' | 'assessment' | 'feasibility' | 'other';

export const ENGINEERING_CONSULTING_JOURNEY_TYPE = 'engineering_consulting';

export interface PreliminaryBrief {
  status: string;
  assistance: string;
  professional_review_required: boolean;
  title: string;
  understood_request?: string;
  discipline_label?: string;
  preliminary_considerations?: string[];
  recommended_next_step?: string;
  missing_information?: string[];
}

export interface EngineeringConsultingContext {
  problem_statement?: string;
  desired_outcome?: string;
  discipline?: EngineeringDiscipline;
  project_type?: EngineeringProjectType;
  location?: string;
  objective?: string;
  current_stage?: string;
  urgency?: string;
  has_documents?: boolean;
  document_notes?: string;
  preliminary_brief?: PreliminaryBrief;
  intake_draft?: Record<string, unknown>;
  scope_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
