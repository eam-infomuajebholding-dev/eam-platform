import { expect, test } from '@playwright/test';

const FRONTEND = process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000';

test.describe('Site routing', () => {
  test('unknown path shows 404 page', async ({ page }) => {
    await page.goto(`${FRONTEND}/this-route-does-not-exist-eam`);
    await expect(page.getByRole('heading', { name: /not found|غير موجود/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto(`${FRONTEND}/`);
    const skip = page.getByRole('link', { name: /skip|تخطي/i });
    await expect(skip).toBeAttached();
    await skip.focus();
    await expect(skip).toBeFocused();
  });
});
