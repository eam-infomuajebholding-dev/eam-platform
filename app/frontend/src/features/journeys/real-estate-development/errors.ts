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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { RealEstateDevelopmentContext } from './types';


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

export function emptyValues(): RealEstateDevelopmentStepValues {
  return {
    assetContext: '',
    assetLocation: '',
    developmentObjective: '',
    intendedUse: '',
    currentStatus: '',
    knownConstraints: '',
    documentsReadiness: '',
    targetTimeline: '',
    urgency: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: RealEstateDevelopmentContext): RealEstateDevelopmentStepValues {
  return {
    assetContext: context.asset_context ?? '',
    assetLocation: context.asset_location ?? '',
    developmentObjective: context.development_objective ?? '',
    intendedUse: context.intended_use ?? '',
    currentStatus: context.current_status ?? '',
    knownConstraints: context.known_constraints ?? '',
    documentsReadiness: context.documents_readiness ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
