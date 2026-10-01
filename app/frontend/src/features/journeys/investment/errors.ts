export interface InvestmentStepValues {
  investorProfile: string;
  interestFocus: string;
  capitalHorizon: string;
  geographyFocus: string;
  riskComfort: string;
  regulatoryNotes: string;
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

import type { InvestmentContext } from './types';

export function buildAdvanceInput(
  currentStep: string | null,
  values: InvestmentStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'investor_profile':
      return { investor_profile: values.investorProfile };
    case 'interest_focus':
      return { interest_focus: values.interestFocus };
    case 'capital_horizon':
      return { capital_horizon: values.capitalHorizon };
    case 'geography_focus':
      return { geography_focus: values.geographyFocus };
    case 'risk_comfort':
      return { risk_comfort: values.riskComfort };
    case 'compliance_context':
      return values.regulatoryNotes.trim() ? { regulatory_notes: values.regulatoryNotes } : {};
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

export function emptyValues(): InvestmentStepValues {
  return {
    investorProfile: '',
    interestFocus: '',
    capitalHorizon: '',
    geographyFocus: '',
    riskComfort: '',
    regulatoryNotes: '',
    documentsReadiness: '',
    targetTimeline: '',
    urgency: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: InvestmentContext): InvestmentStepValues {
  return {
    ...emptyValues(),
    investorProfile: String(context.investor_profile ?? ''),
    interestFocus: String(context.interest_focus ?? ''),
    capitalHorizon: String(context.capital_horizon ?? ''),
    geographyFocus: String(context.geography_focus ?? ''),
    riskComfort: String(context.risk_comfort ?? ''),
    regulatoryNotes: String(context.regulatory_notes ?? ''),
    documentsReadiness: String(context.documents_readiness ?? ''),
    targetTimeline: String(context.target_timeline ?? ''),
    urgency: String(context.urgency ?? ''),
    scopeConfirmed: context.scope_confirmed === true,
    submitConfirmed: context.submit_confirmed === true,
  };
}
