export const REAL_ESTATE_MARKETING_JOURNEY_TYPE = 'real_estate_marketing';

export interface RealEstateMarketingContext {
  marketing_goal?: string;
  property_description?: string;
  property_location?: string;
  target_audience?: string;
  marketing_stage?: string;
  existing_assets?: string;
  channels_interest?: string;
  target_timeline?: string;
  urgency?: string;
  budget_context?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
