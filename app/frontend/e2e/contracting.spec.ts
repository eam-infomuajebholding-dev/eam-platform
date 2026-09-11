import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function resetJourneySession(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
}

async function continueStep(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'متابعة' }).click();
}

test.describe('Contracting journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/contracting`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'المقاولات والتشييد' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية المقاولات' }).click();
    await expect(page.getByRole('heading', { name: 'سياق المشروع' })).toBeVisible({ timeout: 15000 });

    await page.locator('select').nth(0).selectOption({ label: 'بناء جديد' });
    await page.locator('select').nth(1).selectOption({ label: 'تصميم' });
    await page.getByPlaceholder('صف المشروع ومتطلبات التنفيذ...').fill('مشروع فيلا سكنية جاهزة للتنفيذ');
    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'موقع المشروع' })).toBeVisible({ timeout: 15000 });
    await page.getByPlaceholder('المدينة / الموقع').fill('الرياض');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'جاهزية التصميم' }).selectOption({ label: 'مخططات معمارية' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'جاهزية BOQ' }).selectOption({ label: 'جزئي' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'جاهزية الموقع' }).selectOption({ label: 'الموقع جاهز/متاح' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'نوع النطاق' }).selectOption({ label: 'مقاول عام' });
    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'هدف الشراء/التنفيذ' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('combobox', { name: 'هدف الشراء/التنفيذ' }).selectOption({ label: 'البحث عن مقاول' });
    await continueStep(page);

    await page.getByPlaceholder('متى ترغب بالبدء؟').fill('خلال 3 أشهر');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'سياق الميزانية' }).selectOption({ label: '1 – 3 مليون' });
    await continueStep(page);

    await continueStep(page);
    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية المقاولات')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية المقاولات. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية المقاولات.')).toBeVisible({ timeout: 15000 });
  });

  test('duplicate active contracting journey is blocked on restart', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/contracting`);
    await resetJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية المقاولات' }).click();
    await expect(page.getByRole('heading', { name: 'سياق المشروع' })).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND}/journeys/contracting`);
    await expect(page.getByRole('heading', { name: 'سياق المشروع' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'ابدأ رحلة جاهزية المقاولات' })).not.toBeVisible();
  });
});
