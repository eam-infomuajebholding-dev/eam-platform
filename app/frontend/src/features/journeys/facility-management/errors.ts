import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface FacilityManagementStepValues {
  facilityType: string;
  location: string;
  facilityScope: string;
  operationalChallenge: string;
  serviceMaturity: string;
  engagementGoal: string;
  targetTimeline: string;
  urgency: string;
  currentReadiness: string;
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
  values: FacilityManagementStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'facility_type':
      return { facility_type: values.facilityType };
    case 'asset_location':
      return { location: values.location };
    case 'facility_scope':
      return { facility_scope: values.facilityScope };
    case 'operational_challenge':
      return { operational_challenge: values.operationalChallenge };
    case 'service_maturity':
      return { service_maturity: values.serviceMaturity };
    case 'engagement_goal':
      return { engagement_goal: values.engagementGoal };
    case 'timeline_context':
      return {
        target_timeline: values.targetTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'readiness_context':
      return values.currentReadiness.trim() ? { current_readiness: values.currentReadiness } : {};
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
