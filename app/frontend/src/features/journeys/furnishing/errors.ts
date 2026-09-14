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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { FurnishingContext } from './types';


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

export function emptyValues(): FurnishingStepValues {
  return {
    spaceType: '',
    projectStage: '',
    furnishingGoal: '',
    styleDirection: '',
    functionalPriorities: '',
    roomScope: '',
    budgetRange: '',
    targetTimeline: '',
    urgency: '',
    procurementPreference: '',
    currentReadiness: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: FurnishingContext): FurnishingStepValues {
  return {
    spaceType: context.space_type ?? '',
    projectStage: context.project_stage ?? '',
    furnishingGoal: context.furnishing_goal ?? '',
    styleDirection: context.style_direction ?? '',
    functionalPriorities: context.functional_priorities ?? '',
    roomScope: context.room_scope ?? '',
    budgetRange: context.budget_range ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    procurementPreference: context.procurement_preference ?? '',
    currentReadiness: context.current_readiness ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
