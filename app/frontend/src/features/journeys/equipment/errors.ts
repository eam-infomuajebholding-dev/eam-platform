import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface EquipmentStepValues {
  equipmentNeed: string;
  equipmentCategory: string;
  usageContext: string;
  location: string;
  engagementType: string;
  specificationsContext: string;
  targetTimeline: string;
  urgency: string;
  budgetContext: string;
  readinessContext: string;
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
  values: EquipmentStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'equipment_need':
      return { equipment_need: values.equipmentNeed };
    case 'equipment_category':
      return { equipment_category: values.equipmentCategory };
    case 'usage_context':
      return { usage_context: values.usageContext };
    case 'location':
      return { location: values.location };
    case 'engagement_type':
      return { engagement_type: values.engagementType };
    case 'specifications_context':
      return values.specificationsContext.trim()
        ? { specifications_context: values.specificationsContext }
        : {};
    case 'timeline_context':
      return {
        target_timeline: values.targetTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'budget_context':
      return values.budgetContext.trim() ? { budget_context: values.budgetContext } : {};
    case 'readiness_context':
      return values.readinessContext.trim() ? { readiness_context: values.readinessContext } : {};
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
