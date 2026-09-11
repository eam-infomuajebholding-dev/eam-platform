import { expect, test } from '@playwright/test';
import {
  customerSensitiveQueryKeyPrefixes,
  serviceRequestQueryKeys,
} from '../src/features/service-requests/queryKeys';

test.describe('Service request query cache keys', () => {
  test('keys are user-scoped and distinct across accounts', () => {
    const userA = serviceRequestQueryKeys.all('user-a');
    const userB = serviceRequestQueryKeys.all('user-b');
    expect(userA).not.toEqual(userB);
    expect(userA[1]).toBe('user-a');
    expect(userB[1]).toBe('user-b');
  });

  test('detail keys include user and request id', () => {
    const key = serviceRequestQueryKeys.detail('user-a', 42);
    expect(key).toEqual(['service-request', 'user-a', 42]);
  });

  test('logout clear prefixes cover customer caches', () => {
    expect(customerSensitiveQueryKeyPrefixes.map((p) => p[0])).toEqual([
      'service-requests',
      'service-request',
    ]);
  });
});
