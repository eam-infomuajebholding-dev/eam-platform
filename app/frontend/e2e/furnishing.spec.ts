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

test.describe('Furnishing journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/furnishing`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التأثيث والتجهيز' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية التأثيث' }).click();
    await expect(page.getByRole('heading', { name: 'نوع المساحة' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'نوع المساحة' }).selectOption({ label: 'فيلا' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'مرحلة المشروع' }).selectOption({ label: 'جاهز للتأثيث' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'هدف التأثيث' }).selectOption({ label: 'تأثيث كامل' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'اتجاه التصميم' }).selectOption({ label: 'عصري' });
    await continueStep(page);

    await page.getByPlaceholder('ما أهم الأولويات الوظيفية أو احتياجات الاستخدام؟').fill('راحة العائلة ومساحات تخزين عملية');
    await continueStep(page);

    await page.getByPlaceholder('ما الغرف أو المساحات المستهدفة؟').fill('غرف نوم، مجلس، مطبخ');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'فئة الميزانية' }).selectOption({ label: 'متوسط' });
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج إنجاز التأثيث؟').fill('خلال 3 أشهر');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'تفضيل التوريد' }).selectOption({ label: 'أحتاج إرشاداً' });
    await continueStep(page);

    await continueStep(page);

    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية التأثيث والتجهيز')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية التأثيث. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية التأثيث.')).toBeVisible({ timeout: 15000 });
  });
});
