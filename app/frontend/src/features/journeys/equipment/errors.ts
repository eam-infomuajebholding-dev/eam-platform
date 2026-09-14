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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { EquipmentContext } from './types';


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

export function emptyValues(): EquipmentStepValues {
  return {
    equipmentNeed: '',
    equipmentCategory: '',
    usageContext: '',
    location: '',
    engagementType: '',
    specificationsContext: '',
    targetTimeline: '',
    urgency: '',
    budgetContext: '',
    readinessContext: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: EquipmentContext): EquipmentStepValues {
  return {
    equipmentNeed: context.equipment_need ?? '',
    equipmentCategory: context.equipment_category ?? '',
    usageContext: context.usage_context ?? '',
    location: context.location ?? '',
    engagementType: context.engagement_type ?? '',
    specificationsContext: context.specifications_context ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    readinessContext: context.readiness_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
