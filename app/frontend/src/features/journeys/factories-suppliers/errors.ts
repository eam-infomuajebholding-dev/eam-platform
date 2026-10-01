export interface FactoriesSuppliersStepValues {
  supplierRole: string;
  productCategory: string;
  supplyCoverage: string;
  qualityStandards: string;
  partnershipIntent: string;
  targetTimeline: string;
  urgency: string;
  currentReadiness: string;
  scopeConfirmed: boolean;
  submitConfirmed: boolean;
}

export { extractFieldErrors, getErrorMessage } from '@/features/journeys/core/journeyErrors';

import type { FactoriesSuppliersContext } from './types';

export function buildAdvanceInput(
  currentStep: string | null,
  values: FactoriesSuppliersStepValues,
): Record<string, unknown> {
  switch (currentStep) {
    case 'supplier_role':
      return { supplier_role: values.supplierRole };
    case 'product_category':
      return { product_category: values.productCategory };
    case 'supply_coverage':
      return { supply_coverage: values.supplyCoverage };
    case 'quality_standards':
      return { quality_standards: values.qualityStandards };
    case 'partnership_intent':
      return { partnership_intent: values.partnershipIntent };
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

export function emptyValues(): FactoriesSuppliersStepValues {
  return {
    supplierRole: '',
    productCategory: '',
    supplyCoverage: '',
    qualityStandards: '',
    partnershipIntent: '',
    targetTimeline: '',
    urgency: '',
    currentReadiness: '',
    scopeConfirmed: false,
    submitConfirmed: false,
  };
}

export function syncFromContext(context: FactoriesSuppliersContext): FactoriesSuppliersStepValues {
  return {
    ...emptyValues(),
    supplierRole: String(context.supplier_role ?? ''),
    productCategory: String(context.product_category ?? ''),
    supplyCoverage: String(context.supply_coverage ?? ''),
    qualityStandards: String(context.quality_standards ?? ''),
    partnershipIntent: String(context.partnership_intent ?? ''),
    targetTimeline: String(context.target_timeline ?? ''),
    urgency: String(context.urgency ?? ''),
    currentReadiness: String(context.current_readiness ?? ''),
    scopeConfirmed: context.scope_confirmed === true,
    submitConfirmed: context.submit_confirmed === true,
  };
}
