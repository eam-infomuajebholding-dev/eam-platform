import { client } from '@/lib/api';

export type ProcurementOrderSummary = {
  id: number;
  reference_code: string;
  service_request_id: number;
  status: string;
  total_amount?: number | null;
  delivery_location?: string | null;
  partner_org_id?: number | null;
};

export type DeliveryShipmentSummary = {
  id: number;
  reference_code: string;
  service_request_id: number;
  procurement_order_id: number;
  status: string;
  delivery_address?: string | null;
  carrier_name?: string | null;
  tracking_number?: string | null;
  partner_org_id?: number | null;
  updated_at?: string | null;
};

export type DeliveryShipmentEvent = {
  id: number;
  from_status: string;
  to_status: string;
  actor_role: string;
  note?: string | null;
  created_at?: string | null;
};

export type DeliveryShipmentDetail = DeliveryShipmentSummary & {
  events: DeliveryShipmentEvent[];
};

async function get<T>(url: string): Promise<T> {
  const response = await client.apiCall.invoke({ url, method: 'GET' });
  return response.data as T;
}

export async function listOperationsProcurementOrders(params?: {
  partner_org_id?: number;
  service_request_id?: number;
  status?: string;
}): Promise<{ items: ProcurementOrderSummary[] }> {
  const q = new URLSearchParams();
  if (params?.partner_org_id != null) q.set('partner_org_id', String(params.partner_org_id));
  if (params?.service_request_id != null) q.set('service_request_id', String(params.service_request_id));
  if (params?.status) q.set('status', params.status);
  const query = q.toString() ? `?${q.toString()}` : '';
  return get(`/api/v1/operations/procurement-orders${query}`);
}

export async function listOperationsShipments(params?: {
  partner_org_id?: number;
  service_request_id?: number;
  status?: string;
}): Promise<{ items: DeliveryShipmentSummary[] }> {
  const q = new URLSearchParams();
  if (params?.partner_org_id != null) q.set('partner_org_id', String(params.partner_org_id));
  if (params?.service_request_id != null) q.set('service_request_id', String(params.service_request_id));
  if (params?.status) q.set('status', params.status);
  const query = q.toString() ? `?${q.toString()}` : '';
  return get(`/api/v1/operations/logistics/shipments${query}`);
}

export async function getOperationsShipment(shipmentId: number): Promise<DeliveryShipmentDetail> {
  return get(`/api/v1/operations/logistics/shipments/${shipmentId}`);
}

export async function updateOperationsShipmentStatus(
  shipmentId: number,
  body: {
    status: string;
    note?: string;
    carrier_name?: string;
    tracking_number?: string;
  },
): Promise<DeliveryShipmentSummary> {
  const response = await client.apiCall.invoke({
    url: `/api/v1/operations/logistics/shipments/${shipmentId}/status`,
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.data as DeliveryShipmentSummary;
}
