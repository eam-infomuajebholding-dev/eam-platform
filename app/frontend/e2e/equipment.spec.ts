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

test.describe('Equipment journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/equipment`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'المعدات والآلات' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة المعدات والآلات' }).click();
    await expect(page.getByRole('heading', { name: 'حاجة المعدات' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'ما حاجتك من المعدات؟' }).selectOption({ label: 'استئجار معدات' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما فئة المعدات المطلوبة؟' }).selectOption({ label: 'آلات ثقيلة' });
    await continueStep(page);

    await page
      .getByPlaceholder('صف سياق الاستخدام أو المشروع الذي تحتاج المعدات له...')
      .fill('حفار لأعمال حفر أساسات — موجز أولي قبل أي عرض سعر');
    await continueStep(page);

    await page.getByPlaceholder('أين موقع التشغيل؟ (المدينة/الموقع)').fill('جدة — موقع المشروع');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما نوع التعاقد المطلوب؟' }).selectOption({ label: 'إيجار' });
    await continueStep(page);

    await page
      .getByPlaceholder('مواصفات أو قدرة أو موديل المعدات — اختياري')
      .fill('حفار 20 طن — مدة شهر');
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج المعدات أو اتخاذ القرار؟').fill('خلال أسبوعين');
    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'موجز جاهزية المعدات' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('موجز أولي لجاهزية المعدات والآلات')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية المعدات والآلات الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة المعدات والآلات.')).toBeVisible({ timeout: 15000 });
  });
});
