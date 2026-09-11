export const REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE = 'real_estate_development';

export interface RealEstateDevelopmentContext {
  asset_context?: string;
  asset_location?: string;
  development_objective?: string;
  intended_use?: string;
  current_status?: string;
  known_constraints?: string;
  documents_readiness?: string;
  target_timeline?: string;
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
