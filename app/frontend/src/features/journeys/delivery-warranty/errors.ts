export interface DeliveryWarrantyStepValues {
  handoverContext: string;
  propertyLocation: string;
  projectReference: string;
  issueDescription: string;
  documentationState: string;
  ownerObjective: string;
  targetTimeline: string;
  urgency: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export { extractFieldErrors, getErrorMessage } from '@/features/journeys/core/journeyErrors';

import type { DeliveryWarrantyContext } from './types';

export function buildAdvanceInput(
  currentStep: string | null,
  values: DeliveryWarrantyStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'handover_context':
      return { handover_context: values.handoverContext };
    case 'property_location':
      return { property_location: values.propertyLocation };
    case 'project_reference':
      return values.projectReference.trim() ? { project_reference: values.projectReference } : {};
    case 'issue_description':
      return { issue_description: values.issueDescription };
    case 'documentation_state':
      return { documentation_state: values.documentationState };
    case 'owner_objective':
      return { owner_objective: values.ownerObjective };
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

export function emptyValues(): DeliveryWarrantyStepValues {
  return {
    handoverContext: '',
    propertyLocation: '',
    projectReference: '',
    issueDescription: '',
    documentationState: '',
    ownerObjective: '',
    targetTimeline: '',
    urgency: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: DeliveryWarrantyContext): DeliveryWarrantyStepValues {
  return {
    ...emptyValues(),
    handoverContext: String(context.handover_context ?? ''),
    propertyLocation: String(context.property_location ?? ''),
    projectReference: String(context.project_reference ?? ''),
    issueDescription: String(context.issue_description ?? ''),
    documentationState: String(context.documentation_state ?? ''),
    ownerObjective: String(context.owner_objective ?? ''),
    targetTimeline: String(context.target_timeline ?? ''),
    urgency: String(context.urgency ?? ''),
    scopeConfirmed: context.scope_confirmed === true,
    submitConfirmed: context.submit_confirmed === true,
  };
}
