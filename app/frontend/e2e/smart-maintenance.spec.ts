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

test.describe('Smart Maintenance journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/smart-maintenance`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التشغيل والصيانة الذكية' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية الصيانة الذكية' }).click();
    await expect(page.getByRole('heading', { name: 'نوع الصيانة' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'نوع الصيانة' }).selectOption({ label: 'تكييف / HVAC' });
    await continueStep(page);

    await page.getByPlaceholder('المدينة / الموقع / المبنى').fill('الرياض - برج مكتبي');
    await continueStep(page);

    await page
      .getByPlaceholder('صف المشكلة أو عطل الصيانة المطلوب...')
      .fill('تكييف مركزي لا يبرد بشكل كافٍ في الطابق الثالث');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'درجة الأولوية' }).selectOption({ label: 'عالي' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'جاهزية الوصول' }).selectOption({ label: 'يمكن الوصول' });
    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await page.getByRole('combobox', { name: 'هدف الخدمة' }).selectOption({ label: 'إصلاح تصحيحي' });
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج المعالجة؟').fill('خلال أسبوع');
    await continueStep(page);

    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية الصيانة الذكية')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية الصيانة الذكية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية الصيانة الذكية.')).toBeVisible({ timeout: 15000 });
  });

  test('duplicate active maintenance journey is blocked on restart', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/smart-maintenance`);
    await resetJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية الصيانة الذكية' }).click();
    await expect(page.getByRole('heading', { name: 'نوع الصيانة' })).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND}/journeys/smart-maintenance`);
    await expect(page.getByRole('heading', { name: 'نوع الصيانة' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'ابدأ رحلة جاهزية الصيانة الذكية' })).not.toBeVisible();
  });
});
