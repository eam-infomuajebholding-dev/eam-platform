export const GOVERNMENT_SERVICES_JOURNEY_TYPE = 'government_services';

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface GovernmentServicesContext {
  service_category?: string;
  property_location?: string;
  property_type?: string;
  request_summary?: string;
  documents_status?: string;
  urgency?: string;
  preliminary_brief?: Record<string, unknown>;
  scope_confirmed?: boolean;
  submit_confirmed?: boolean;
}
