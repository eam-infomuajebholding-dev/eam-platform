import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Delivery & warranty journey', () => {
  test('route loads and starts journey', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/delivery-warranty`);
    await page.evaluate(() => {
      sessionStorage.removeItem('eam-active-journey-instance-id');
      sessionStorage.removeItem('eam-anonymous-session-id');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التسليم وخدمات الملاك' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'ابدأ رحلة التسليم/الضمان' }).click();
    await expect(page.getByRole('heading', { name: 'سياق التسليم' })).toBeVisible({ timeout: 15000 });
  });
});
