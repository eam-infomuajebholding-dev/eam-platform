import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface GovernmentServicesStepValues {
  serviceCategory: string;
  propertyLocation: string;
  propertyType: string;
  requestSummary: string;
  documentsStatus: string;
  urgency: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export function extractFieldErrors(error: unknown): FieldValidationErrorDetail[] {
  if (!error || typeof error !== 'object') return [];
  const maybeResponse = error as {
    response?: { data?: { detail?: { errors?: FieldValidationErrorDetail[] } | string } };
    data?: { detail?: { errors?: FieldValidationErrorDetail[] } | string };
    detail?: { errors?: FieldValidationErrorDetail[] } | string;
  };
  const detail =
    maybeResponse.response?.data?.detail ?? maybeResponse.data?.detail ?? maybeResponse.detail;
  if (detail && typeof detail === 'object' && Array.isArray(detail.errors)) {
    return detail.errors;
  }
  return [];
}

export function getErrorMessage(errors: FieldValidationErrorDetail[], fallback: string): string {
  if (errors.length > 0) return errors.map((item) => item.message).join(' ');
  return fallback;
}

export function buildAdvanceInput(
  currentStep: string | null,
  values: GovernmentServicesStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'service_category':
      return { service_category: values.serviceCategory };
    case 'property_location':
      return { property_location: values.propertyLocation };
    case 'property_type':
      return { property_type: values.propertyType };
    case 'request_summary':
      return { request_summary: values.requestSummary };
    case 'documents_status':
      return { documents_status: values.documentsStatus };
    case 'urgency_context':
      return { urgency: values.urgency };
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
