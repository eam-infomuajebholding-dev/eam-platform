import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Factories & suppliers journey', () => {
  test('route loads and starts journey', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/factories-suppliers`);
    await page.evaluate(() => {
      sessionStorage.removeItem('eam-active-journey-instance-id');
      sessionStorage.removeItem('eam-anonymous-session-id');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'المصانع والموردين' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'ابدأ رحلة الموردين' }).click();
    await expect(page.getByRole('heading', { name: 'دور المورد' })).toBeVisible({ timeout: 15000 });
  });
});
