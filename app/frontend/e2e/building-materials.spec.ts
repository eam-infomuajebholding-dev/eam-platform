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

test.describe('Building Materials journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/building-materials`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'مواد البناء' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة مواد البناء' }).click();
    await expect(page.getByRole('heading', { name: 'هدف التوريد' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'ما هدفك من التوريد؟' }).selectOption({ label: 'توريد لمشروع' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما فئة المواد المطلوبة؟' }).selectOption({ label: 'هيكلية' });
    await continueStep(page);

    await page
      .getByPlaceholder('صف المشروع أو سياق التوريد المطلوب...')
      .fill('توريد مواد هيكلية لمشروع سكني — موجز أولي قبل أي عرض سعر');
    await continueStep(page);

    await page.getByPlaceholder('أين موقع التسليم؟ (المدينة/الموقع)').fill('الرياض — موقع المشروع');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما نطاق الكميات المتوقع؟' }).selectOption({ label: 'متوسط' });
    await continueStep(page);

    await page
      .getByPlaceholder('مواصفات أو معايير المواد إن وُجدت — اختياري')
      .fill('حديد تسليح وأسمنت حسب المواصفات المحلية');
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج التوريد أو اتخاذ القرار؟').fill('خلال شهرين');
    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'موجز جاهزية التوريد' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('موجز أولي لجاهزية توريد مواد البناء')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية توريد مواد البناء الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة مواد البناء.')).toBeVisible({ timeout: 15000 });
  });
});
