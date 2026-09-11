import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Owner Command Center route', () => {
  test('redirects unauthenticated users away from command center', async ({ page }) => {
    await page.goto(`${FRONTEND}/command-center`);
    await expect(page).not.toHaveURL(/\/command-center$/);
  });
});
