export const FURNISHING_JOURNEY_TYPE = 'furnishing';

export interface FurnishingContext {
  space_type?: string;
  project_stage?: string;
  furnishing_goal?: string;
  style_direction?: string;
  functional_priorities?: string;
  room_scope?: string;
  budget_range?: string;
  target_timeline?: string;
  urgency?: string;
  procurement_preference?: string;
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
