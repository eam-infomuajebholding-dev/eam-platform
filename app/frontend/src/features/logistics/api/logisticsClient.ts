import { client } from '@/lib/api';

export type DeliveryShipmentSummary = {
  id: number;
  reference_code: string;
  service_request_id: number;
  status: string;
  delivery_address?: string | null;
  carrier_name?: string | null;
  tracking_number?: string | null;
};

export async function listPartnerDeliveryShipments(status?: string): Promise<{ items: DeliveryShipmentSummary[] }> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await client.apiCall.invoke({
    url: `/api/v1/partner/delivery-shipments${q}`,
    method: 'GET',
  });
  return response.data as { items: DeliveryShipmentSummary[] };
}

export async function updatePartnerShipmentStatus(
  shipmentId: number,
  body: {
    status: string;
    tracking_number?: string;
    carrier_name?: string;
    note?: string;
  },
): Promise<DeliveryShipmentSummary> {
  const response = await client.apiCall.invoke({
    url: `/api/v1/partner/delivery-shipments/${shipmentId}/status`,
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.data as DeliveryShipmentSummary;
}
