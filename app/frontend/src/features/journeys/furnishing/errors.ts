import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface FurnishingStepValues {
  spaceType: string;
  projectStage: string;
  furnishingGoal: string;
  styleDirection: string;
  functionalPriorities: string;
  roomScope: string;
  budgetRange: string;
  targetTimeline: string;
  urgency: string;
  procurementPreference: string;
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
  values: FurnishingStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'space_type':
      return { space_type: values.spaceType };
    case 'project_stage':
      return { project_stage: values.projectStage };
    case 'furnishing_goal':
      return { furnishing_goal: values.furnishingGoal };
    case 'style_direction':
      return { style_direction: values.styleDirection };
    case 'functional_priorities':
      return { functional_priorities: values.functionalPriorities };
    case 'room_scope':
      return { room_scope: values.roomScope };
    case 'budget_range':
      return { budget_range: values.budgetRange };
    case 'timeline_context':
      return {
        target_timeline: values.targetTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'procurement_preference':
      return { procurement_preference: values.procurementPreference };
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
