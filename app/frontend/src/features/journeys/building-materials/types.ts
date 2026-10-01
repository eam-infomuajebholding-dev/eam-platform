export const BUILDING_MATERIALS_JOURNEY_TYPE = 'building_materials';

export interface BuildingMaterialsContext {
  intake_channel?: string;
  materials_list?: string;
  materials_image_url?: string;
  assistant_transcript?: string;
  requester_name?: string;
  requester_phone?: string;
  requester_phone_normalized?: string;
  phone_verified?: boolean;
  delivery_location?: string;
  procurement_invoice?: Record<string, unknown>;
  invoice_confirmed?: boolean;
  buyer_liability_terms_accepted?: boolean;
  buyer_liability_terms_version?: string;
}

export interface FieldValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}
