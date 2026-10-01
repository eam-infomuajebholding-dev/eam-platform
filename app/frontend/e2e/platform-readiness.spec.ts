import { expect, test } from '@playwright/test';

const BACKEND = process.env.PLAYWRIGHT_BACKEND_URL ?? 'http://127.0.0.1:8000';

test.describe('Platform readiness API', () => {
  test('readiness returns core operational without OIDC', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/v1/platform/readiness`);
    expect(resp.ok()).toBeTruthy();
    const body = (await resp.json()) as {
      overall: string;
      core_operational: boolean;
      live_journey_count: number;
      alembic: { aligned: boolean };
    };
    expect(body.live_journey_count).toBe(13);
    expect(body.core_operational).toBe(true);
    expect(body.alembic.aligned).toBe(true);
    expect(['READY', 'DEGRADED', 'BLOCKED']).toContain(body.overall);
  });
});
