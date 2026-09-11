import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function clearJourneySession(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
}

async function startGovernmentServices(page: import('@playwright/test').Page) {
  await page.goto(`${FRONTEND}/journeys/government-services`);
  await clearJourneySession(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'الخدمات الحكومية' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'ابدأ رحلة الخدمات الحكومية' }).click();
  await expect(page.getByText('نوع الخدمة')).toBeVisible({ timeout: 15000 });
}

test.describe('Government Services journey (anonymous)', () => {
  test('starts at service_category', async ({ page }) => {
    await startGovernmentServices(page);
    await expect(page.getByText('التقدم: 1 / 10')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'نوع الخدمة' })).toBeVisible();
  });

  test('validates empty service category', async ({ page }) => {
    await startGovernmentServices(page);
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByText('تعذر إرسال هذه الخطوة')).toBeVisible({ timeout: 10000 });
  });
});
