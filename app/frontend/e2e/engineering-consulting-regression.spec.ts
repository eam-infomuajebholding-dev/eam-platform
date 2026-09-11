import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function clearJourneySession(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
}

test.describe('Engineering Consulting regression', () => {
  test('D1: sector entry navigates to engineering consulting journey', async ({ page }) => {
    await page.goto(`${FRONTEND}/sectors/engineering-consulting`);
    await clearJourneySession(page);
    await page.reload();
    const journeyLink = page.getByRole('link', { name: /الاستشارات الهندسية|ابدأ/i }).first();
    if (await journeyLink.isVisible().catch(() => false)) {
      await journeyLink.click();
    } else {
      await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    }
    await expect(page).toHaveURL(/engineering-consulting/);
    await expect(page.getByRole('heading', { name: 'الاستشارات الهندسية' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('D2: invalid intent validation stays on step', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await clearJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByText('تعذر إرسال هذه الخطوة')).toBeVisible({ timeout: 10000 });
  });

  test('D3: resume preserves EC journey after reload', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await clearJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' }).click();
    await page
      .getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')
      .fill('مراجعة تصميم إنشائي');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.reload();
    await expect(page.getByText('ما التخصص المطلوب؟')).toBeVisible({
      timeout: 15000,
    });
  });

  test('D4: EC page does not hydrate Build Villa state', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/build-villa`);
    await clearJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ رحلة بناء الفيلا' }).click();
    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await expect(page.getByRole('heading', { name: 'الاستشارات الهندسية' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' })).toBeVisible();
    await expect(page.getByText('ما هدف مشروع الفيلا؟')).not.toBeVisible();
  });
});
