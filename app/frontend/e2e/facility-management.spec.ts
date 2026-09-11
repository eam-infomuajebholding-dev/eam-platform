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

test.describe('Facility Management journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/facility-management`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'إدارة المرافق' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية إدارة المرافق' }).click();
    await expect(page.getByRole('heading', { name: 'نوع المنشأة' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'نوع المنشأة' }).selectOption({ label: 'تجاري' });
    await continueStep(page);

    await page.getByPlaceholder('أين تقع المنشأة أو الأصل؟').fill('الرياض — برج مكتبي');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'نطاق المرافق' }).selectOption({ label: 'مبنى كامل' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'التحدي التشغيلي' }).selectOption({ label: 'كفاءة التشغيل' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'نضج خدمات إدارة المرافق' }).selectOption({ label: 'مختلط' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'هدف التعاقد' }).selectOption({ label: 'مراجعة جاهزية' });
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج البدء أو اتخاذ القرار؟').fill('خلال شهر');
    await continueStep(page);

    await page
      .getByPlaceholder('ما الوضع التشغيلي الحالي أو التحديات المعروفة؟ (اختياري)')
      .fill('عمليات جزئية بدون عقد موحد');
    await continueStep(page);

    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية إدارة المرافق')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية إدارة المرافق. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية إدارة المرافق.')).toBeVisible({ timeout: 15000 });
  });
});
