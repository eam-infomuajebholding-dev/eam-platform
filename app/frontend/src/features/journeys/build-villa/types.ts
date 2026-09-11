export type LandOwnershipType = 'owned' | 'leased' | 'planning_to_acquire' | 'other';

export type DesiredService = 'design_only' | 'supervision' | 'execution' | 'full_service';

export type BudgetRange =
  | 'under_1m'
  | '1m_2m'
  | '2m_5m'
  | '5m_10m'
  | 'over_10m'
  | 'prefer_not_say';

export type DesiredStart =
  | 'asap'
  | 'within_3_months'
  | 'within_6_months'
  | 'within_1_year'
  | 'flexible';

export type DesignStyle =
  | 'modern'
  | 'contemporary'
  | 'classic'
  | 'minimal'
  | 'traditional_local'
  | 'unsure'
  | 'need_help';

export interface DocumentRef {
  label: string;
  url?: string | null;
}

export interface PreliminaryVillaBrief {
  status: string;
  assistance: string;
  professional_review_required: boolean;
  title: string;
  disclaimer?: string;
  project_objective?: string;
  location?: { city?: string };
  land_summary?: {
    ownership_type?: LandOwnershipType;
    ownership_label?: string;
    area_sqm?: number;
    has_documents?: boolean;
    document_notes?: string;
    document_refs?: DocumentRef[];
  };
  household_summary?: {
    household_size?: number;
    use_summary?: string;
    accessibility_needs?: string;
    staff_areas_needed?: string;
    future_expansion_notes?: string;
  };
  space_program_summary?: {
    floors?: number;
    bedrooms?: number;
    selected_spaces?: string[];
    space_notes?: string;
  };
  budget_context?: {
    budget_range?: BudgetRange;
    budget_range_label?: string;
  };
  timeline_context?: {
    desired_start?: DesiredStart;
    desired_start_label?: string;
    urgency?: string;
  };
  design_direction?: {
    design_style?: DesignStyle;
    design_style_label?: string;
    design_notes?: string;
  };
  requested_eam_scope?: {
    desired_service?: DesiredService;
    desired_service_label?: string;
  };
  missing_information?: string[];
  preliminary_considerations?: string[];
  recommended_next_step?: string;
  generated_at?: string;
}

export interface BuildVillaContext {
  project_objective?: string;
  city?: string;
  land_ownership_type?: LandOwnershipType;
  land_area_sqm?: number;
  household_size?: number;
  use_summary?: string;
  accessibility_needs?: string;
  staff_areas_needed?: string;
  future_expansion_notes?: string;
  floors?: number;
  bedrooms?: number;
  selected_spaces?: string[];
  space_notes?: string;
  budget_range?: BudgetRange;
  desired_start?: DesiredStart;
  urgency?: string;
  design_style?: DesignStyle;
  design_notes?: string;
  has_documents?: boolean;
  document_notes?: string;
  document_refs?: DocumentRef[];
  desired_service?: DesiredService;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
  draft_status?: string;
  preliminary_brief?: PreliminaryVillaBrief;
  intake_draft?: BuildVillaIntakeDraft;
}

export interface BuildVillaIntakeDraft {
  journey_type: 'build_villa';
  project_objective?: string;
  city?: string;
  land_ownership_type?: LandOwnershipType;
  land_area_sqm?: number;
  household_size?: number;
  use_summary?: string;
  budget_range?: BudgetRange;
  desired_start?: DesiredStart;
  design_style?: DesignStyle;
  has_documents?: boolean;
  document_notes?: string;
  document_refs?: DocumentRef[];
  desired_service?: DesiredService;
  preliminary_brief?: PreliminaryVillaBrief;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
  draft_status: string;
  assembled_at: string;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface JourneyValidationErrorResponse {
  errors: FieldValidationErrorDetail[];
}

export const BUILD_VILLA_JOURNEY_TYPE = 'build_villa';

export const BUILD_VILLA_STEPS = [
  'project_intent',
  'city',
  'land_ownership',
  'land_area',
  'household_needs',
  'space_program',
  'budget_context',
  'timeline_context',
  'design_direction',
  'documents_context',
  'desired_service',
  'summary_review',
  'brief_review',
  'scope_confirm',
  'submit_confirm',
  'intake_complete',
] as const;

export type BuildVillaStepKey = (typeof BUILD_VILLA_STEPS)[number];
