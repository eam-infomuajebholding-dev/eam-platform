import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function resetJourneySession(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
}

test.describe('Investment journey (anonymous)', () => {
  test('starts and advances first steps', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/investment`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'الاستثمار' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'ابدأ رحلة الاهتمام الاستثماري' }).click();
    await expect(page.getByRole('heading', { name: 'صفة المستثمر' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'صفة المستثمر' }).selectOption({ label: 'فرد' });
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByRole('heading', { name: 'محور الاهتمام' })).toBeVisible({ timeout: 10000 });
  });
});
