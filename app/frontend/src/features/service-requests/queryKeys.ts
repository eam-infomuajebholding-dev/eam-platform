/** User-scoped React Query keys for Service Request customer data. */

export const serviceRequestQueryKeys = {
  all: (userId: string | null | undefined) => ['service-requests', userId ?? 'anonymous'] as const,
  detail: (userId: string | null | undefined, requestId: number | string) =>
    ['service-request', userId ?? 'anonymous', requestId] as const,
};

export const customerSensitiveQueryKeyPrefixes = [
  ['service-requests'],
  ['service-request'],
] as const;
