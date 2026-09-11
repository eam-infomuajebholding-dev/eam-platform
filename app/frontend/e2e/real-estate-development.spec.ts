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

test.describe('Real Estate Development journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/real-estate-development`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التطوير العقاري' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة التطوير العقاري' }).click();
    await expect(page.getByRole('heading', { name: 'سياق الأصل' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'ما سياق الأصل أو الفرصة؟' }).selectOption({ label: 'أرض مملوكة' });
    await continueStep(page);

    await page.getByPlaceholder('أين يقع الأصل؟ (المدينة/الحي)').fill('الرياض — حي النرجس');
    await continueStep(page);

    await page
      .getByPlaceholder('صف هدفك التطويري — ما الذي تريد تحقيقه؟')
      .fill('أريد استكشاف خيارات تطوير أرض سكنية بشكل أولي قبل أي دراسة جدوى');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'الاستخدام المستهدف' }).selectOption({ label: 'سكني' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'الحالة الحالية للأصل' }).selectOption({ label: 'أرض خام' });
    await continueStep(page);

    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما حالة المستندات المتاحة؟' }).selectOption({ label: 'لدي بعض المستندات' });
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج البدء أو اتخاذ القرار؟').fill('خلال 6 أشهر');
    await continueStep(page);

    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'لقطة الفرصة الأولية' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('لقطة فرصة تطوير أولية')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز لقطة فرصة التطوير الأولية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة التطوير العقاري.')).toBeVisible({ timeout: 15000 });
  });
});
