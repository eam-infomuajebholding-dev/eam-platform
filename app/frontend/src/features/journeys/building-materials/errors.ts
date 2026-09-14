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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { BuildingMaterialsContext } from './types';


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

export function emptyValues(): BuildingMaterialsStepValues {
  return {
    procurementGoal: '',
    materialCategory: '',
    projectContext: '',
    deliveryLocation: '',
    quantityScope: '',
    specificationsContext: '',
    targetTimeline: '',
    urgency: '',
    budgetContext: '',
    supplierContext: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: BuildingMaterialsContext): BuildingMaterialsStepValues {
  return {
    procurementGoal: context.procurement_goal ?? '',
    materialCategory: context.material_category ?? '',
    projectContext: context.project_context ?? '',
    deliveryLocation: context.delivery_location ?? '',
    quantityScope: context.quantity_scope ?? '',
    specificationsContext: context.specifications_context ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    supplierContext: context.supplier_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
