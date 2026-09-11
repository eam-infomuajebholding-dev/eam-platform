export const REAL_ESTATE_VALUATION_JOURNEY_TYPE = 'real_estate_valuation';

export interface RealEstateValuationContext {
  valuation_purpose?: string;
  asset_type?: string;
  location?: string;
  asset_description?: string;
  area_sqm?: number;
  ownership_status?: string;
  deed_available?: boolean;
  title_docs_available?: boolean;
  rent_roll_available?: boolean;
  plans_available?: boolean;
  document_notes?: string;
  inspection_readiness?: string;
  desired_timeline?: string;
  urgency?: string;
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
