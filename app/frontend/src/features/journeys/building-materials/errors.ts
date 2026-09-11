import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface BuildingMaterialsStepValues {
  procurementGoal: string;
  materialCategory: string;
  projectContext: string;
  deliveryLocation: string;
  quantityScope: string;
  specificationsContext: string;
  targetTimeline: string;
  urgency: string;
  budgetContext: string;
  supplierContext: string;
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
  values: BuildingMaterialsStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'procurement_goal':
      return { procurement_goal: values.procurementGoal };
    case 'material_category':
      return { material_category: values.materialCategory };
    case 'project_context':
      return { project_context: values.projectContext };
    case 'delivery_location':
      return { delivery_location: values.deliveryLocation };
    case 'quantity_scope':
      return { quantity_scope: values.quantityScope };
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
    case 'supplier_context':
      return values.supplierContext.trim() ? { supplier_context: values.supplierContext } : {};
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
