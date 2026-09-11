import type { QueryClient } from '@tanstack/react-query';

import { customerSensitiveQueryKeyPrefixes } from '@/features/service-requests/queryKeys';

/** Remove customer-specific cached queries on logout / account switch. */
export function clearCustomerSensitiveQueries(queryClient: QueryClient): void {
  for (const prefix of customerSensitiveQueryKeyPrefixes) {
    queryClient.removeQueries({ queryKey: [...prefix] });
  }
}
