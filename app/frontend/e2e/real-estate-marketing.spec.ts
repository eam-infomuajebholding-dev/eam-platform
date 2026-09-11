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

test.describe('Real Estate Marketing journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/real-estate-marketing`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'التسويق العقاري' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة التسويق العقاري' }).click();
    await expect(page.getByRole('heading', { name: 'هدف التسويق' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'ما هدفك التسويقي؟' }).selectOption({ label: 'بيع عقار' });
    await continueStep(page);

    await page
      .getByPlaceholder('صف العقار أو المشروع الذي تريد تسويقه...')
      .fill('شقة سكنية للبيع — تسويق أولي قبل أي حملة معتمدة');
    await continueStep(page);

    await page.getByPlaceholder('أين يقع العقار؟ (المدينة/الحي)').fill('الرياض — حي الياسمين');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'من هو الجمهور المستهدف؟' }).selectOption({ label: 'مشترون نهائيون' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'في أي مرحلة تسويقية أنت؟' }).selectOption({ label: 'تخطيط' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'ما الأصول التسويقية المتوفرة لديك؟' }).selectOption({ label: 'جزئي' });
    await continueStep(page);

    await page
      .getByPlaceholder('قنوات أو اهتمامات تسويقية (منصات رقمية، وسيط، إعلانات...) — اختياري')
      .fill('منصات رقمية ووسيط محلي');
    await continueStep(page);

    await page.getByPlaceholder('متى تحتاج بدء التسويق أو اتخاذ القرار؟').fill('خلال 3 أشهر');
    await continueStep(page);

    await continueStep(page);

    await continueStep(page);

    await expect(page.getByRole('heading', { name: 'موجز جاهزية التسويق' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('موجز أولي لجاهزية التسويق العقاري')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية التسويق العقاري الأولي. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة التسويق العقاري.')).toBeVisible({ timeout: 15000 });
  });
});
