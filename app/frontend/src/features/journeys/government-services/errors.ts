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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { GovernmentServicesContext } from './types';


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

export function emptyValues(): GovernmentServicesStepValues {
  return {
    serviceCategory: '',
    propertyLocation: '',
    propertyType: '',
    requestSummary: '',
    documentsStatus: '',
    urgency: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: GovernmentServicesContext): GovernmentServicesStepValues {
  return {
    serviceCategory: context.service_category ?? '',
    propertyLocation: context.property_location ?? '',
    propertyType: context.property_type ?? '',
    requestSummary: context.request_summary ?? '',
    documentsStatus: context.documents_status ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
