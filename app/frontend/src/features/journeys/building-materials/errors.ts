export interface BuildingMaterialsStepValues {
  intakeChannel: string;
  materialsList: string;
  materialsImageUrl: string;
  assistantTranscript: string;
  requesterName: string;
  requesterPhone: string;
  otpCode: string;
  deliveryLocation: string;
  invoiceConfirmed: boolean;
  buyerLiabilityTermsAccepted: boolean;
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
    case 'materials_intake':
      return {
        intake_channel: values.intakeChannel || 'mixed',
        ...(values.materialsList.trim() ? { materials_list: values.materialsList } : {}),
        ...(values.assistantTranscript.trim()
          ? { assistant_transcript: values.assistantTranscript }
          : {}),
        ...(values.materialsImageUrl.trim() ? { materials_image_url: values.materialsImageUrl } : {}),
      };
    case 'requester_identity':
      return {
        requester_name: values.requesterName,
        requester_phone: values.requesterPhone,
      };
    case 'phone_verification':
      return { otp_code: values.otpCode };
    case 'delivery_location':
      return { delivery_location: values.deliveryLocation };
    case 'invoice_confirm':
      return {
        invoice_confirmed: values.invoiceConfirmed,
        buyer_liability_terms_accepted: values.buyerLiabilityTermsAccepted,
      };
    default:
      return {};
  }
}

export function emptyValues(): BuildingMaterialsStepValues {
  return {
    intakeChannel: 'mixed',
    materialsList: '',
    materialsImageUrl: '',
    assistantTranscript: '',
    requesterName: '',
    requesterPhone: '',
    otpCode: '',
    deliveryLocation: '',
    invoiceConfirmed: false,
    buyerLiabilityTermsAccepted: false,
  };
}

export function syncFromContext(context: BuildingMaterialsContext): BuildingMaterialsStepValues {
  return {
    intakeChannel: context.intake_channel ?? 'mixed',
    materialsList: context.materials_list ?? '',
    materialsImageUrl: context.materials_image_url ?? '',
    assistantTranscript: context.assistant_transcript ?? '',
    requesterName: context.requester_name ?? '',
    requesterPhone: context.requester_phone ?? context.requester_phone_normalized ?? '',
    otpCode: '',
    deliveryLocation: context.delivery_location ?? '',
    invoiceConfirmed: context.invoice_confirmed ?? false,
    buyerLiabilityTermsAccepted: context.buyer_liability_terms_accepted ?? false,
  };
}
