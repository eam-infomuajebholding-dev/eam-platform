import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface RealEstateDevelopmentStepValues {
  assetContext: string;
  assetLocation: string;
  developmentObjective: string;
  intendedUse: string;
  currentStatus: string;
  knownConstraints: string;
  documentsReadiness: string;
  targetTimeline: string;
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
  values: RealEstateDevelopmentStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'asset_context':
      return { asset_context: values.assetContext };
    case 'asset_location':
      return { asset_location: values.assetLocation };
    case 'development_objective':
      return { development_objective: values.developmentObjective };
    case 'intended_use':
      return { intended_use: values.intendedUse };
    case 'current_status':
      return { current_status: values.currentStatus };
    case 'constraints_context':
      return values.knownConstraints.trim() ? { known_constraints: values.knownConstraints } : {};
    case 'documents_readiness':
      return { documents_readiness: values.documentsReadiness };
    case 'timeline_context':
      return {
        target_timeline: values.targetTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
