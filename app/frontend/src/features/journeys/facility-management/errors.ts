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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { FacilityManagementContext } from './types';


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

export function emptyValues(): FacilityManagementStepValues {
  return {
    facilityType: '',
    location: '',
    facilityScope: '',
    operationalChallenge: '',
    serviceMaturity: '',
    engagementGoal: '',
    targetTimeline: '',
    urgency: '',
    currentReadiness: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: FacilityManagementContext): FacilityManagementStepValues {
  return {
    facilityType: context.facility_type ?? '',
    location: context.location ?? '',
    facilityScope: context.facility_scope ?? '',
    operationalChallenge: context.operational_challenge ?? '',
    serviceMaturity: context.service_maturity ?? '',
    engagementGoal: context.engagement_goal ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    currentReadiness: context.current_readiness ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
