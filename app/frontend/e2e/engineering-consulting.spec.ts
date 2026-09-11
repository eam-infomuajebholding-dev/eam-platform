import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Engineering Consulting journey (anonymous)', () => {
  test('starts journey, reaches preliminary brief, completes anonymously', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await page.evaluate(() => {
      sessionStorage.removeItem('eam-active-journey-instance-id');
      sessionStorage.removeItem('eam-anonymous-session-id');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'الاستشارات الهندسية' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' }).click();

    await page
      .getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')
      .fill('نحتاج مراجعة تصميم إنشائي لمبنى تجاري في الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: 'إنشائي / مدني' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.locator('select').selectOption({ label: 'مشروع جديد' });
    await page.getByPlaceholder('الموقع').fill('الرياض');
    await page.getByPlaceholder('هدف المشروع').fill('تقييم تصميم إنشائي أولي');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByText('موجز هندسي أولي')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(
      page.getByText('تم تجهيز طلب الاستشارة الهندسية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إرسال طلب الاستشارة بنجاح.')).toBeVisible({ timeout: 15000 });
  });
});
