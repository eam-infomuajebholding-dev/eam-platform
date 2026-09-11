import type { FieldValidationErrorDetail } from './types';

export type { FieldValidationErrorDetail };

export interface RealEstateMarketingStepValues {
  marketingGoal: string;
  propertyDescription: string;
  propertyLocation: string;
  targetAudience: string;
  marketingStage: string;
  existingAssets: string;
  channelsInterest: string;
  targetTimeline: string;
  urgency: string;
  budgetContext: string;
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
  values: RealEstateMarketingStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'marketing_goal':
      return { marketing_goal: values.marketingGoal };
    case 'property_description':
      return { property_description: values.propertyDescription };
    case 'property_location':
      return { property_location: values.propertyLocation };
    case 'target_audience':
      return { target_audience: values.targetAudience };
    case 'marketing_stage':
      return { marketing_stage: values.marketingStage };
    case 'existing_assets':
      return { existing_assets: values.existingAssets };
    case 'channels_context':
      return values.channelsInterest.trim() ? { channels_interest: values.channelsInterest } : {};
    case 'timeline_context':
      return {
        target_timeline: values.targetTimeline,
        ...(values.urgency ? { urgency: values.urgency } : {}),
      };
    case 'budget_context':
      return values.budgetContext.trim() ? { budget_context: values.budgetContext } : {};
    case 'scope_confirm':
      return { scope_confirmed: values.scopeConfirmed };
    case 'submit_confirm':
      return { submit_confirmed: values.submitConfirmed };
    default:
      return {};
  }
}
