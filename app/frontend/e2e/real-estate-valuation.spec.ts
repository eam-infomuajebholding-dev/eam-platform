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

test.describe('Real Estate Valuation journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/real-estate-valuation`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التقييم العقاري' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية التقييم العقاري' }).click();
    await expect(page.getByRole('heading', { name: 'غرض التقييم' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'غرض التقييم' }).selectOption({ label: 'بيع' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'نوع الأصل' }).selectOption({ label: 'فيلا' });
    await continueStep(page);

    await page.getByPlaceholder('المدينة / الموقع').fill('الرياض');
    await continueStep(page);

    await page
      .getByPlaceholder('صف العقار واستخدامه والحالة العامة...')
      .fill('فيلا سكنية في حي راقٍ بحاجة لتقييم قبل البيع');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'سياق الملكية' }).selectOption({ label: 'مالك' });
    await continueStep(page);

    await continueStep(page);

    await page.getByRole('combobox', { name: 'جاهزية المعاينة' }).selectOption({ label: 'يمكن المعاينة' });
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج التقييم؟').fill('خلال شهر');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'هدف الخدمة' }).selectOption({ label: 'تقييم رسمي' });
    await continueStep(page);

    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية التقييم العقاري')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية التقييم العقاري. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية التقييم العقاري.')).toBeVisible({ timeout: 15000 });
  });

  test('duplicate active valuation journey is blocked on restart', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/real-estate-valuation`);
    await resetJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية التقييم العقاري' }).click();
    await expect(page.getByRole('heading', { name: 'غرض التقييم' })).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND}/journeys/real-estate-valuation`);
    await expect(page.getByRole('heading', { name: 'غرض التقييم' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'ابدأ رحلة جاهزية التقييم العقاري' })).not.toBeVisible();
  });
});
