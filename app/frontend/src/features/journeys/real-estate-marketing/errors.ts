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

export {
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

import type { RealEstateMarketingContext } from './types';


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

export function emptyValues(): RealEstateMarketingStepValues {
  return {
    marketingGoal: '',
    propertyDescription: '',
    propertyLocation: '',
    targetAudience: '',
    marketingStage: '',
    existingAssets: '',
    channelsInterest: '',
    targetTimeline: '',
    urgency: '',
    budgetContext: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: RealEstateMarketingContext): RealEstateMarketingStepValues {
  return {
    marketingGoal: context.marketing_goal ?? '',
    propertyDescription: context.property_description ?? '',
    propertyLocation: context.property_location ?? '',
    targetAudience: context.target_audience ?? '',
    marketingStage: context.marketing_stage ?? '',
    existingAssets: context.existing_assets ?? '',
    channelsInterest: context.channels_interest ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}
