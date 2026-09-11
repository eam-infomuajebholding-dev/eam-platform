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

test.describe('Project Management journey (anonymous)', () => {
  test('sector route starts journey and completes credential-free path', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/project-management`);
    await resetJourneySession(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'إدارة المشاريع' })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية إدارة المشروع' }).click();
    await expect(page.getByRole('heading', { name: 'نوع المشروع' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('combobox', { name: 'نوع المشروع' }).selectOption({ label: 'تجاري' });
    await continueStep(page);

    await page.getByRole('combobox', { name: 'مرحلة المشروع' }).selectOption({ label: 'متعثر / متأخر' });
    await continueStep(page);

    await page.getByPlaceholder('ما الهدف الأساسي من المشروع؟').fill('تنظيم وإنقاذ مشروع تجاري متعثر');
    await page.getByPlaceholder('ما الوضع الحالي للمشروع؟').fill('المشروع متأخر عن الجدول مع تعثر في التنسيق');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'وضوح النطاق' }).selectOption({ label: 'جزئي' });
    await continueStep(page);
    await expect(page.getByRole('heading', { name: 'الجدول الزمني' })).toBeVisible({ timeout: 15000 });

    await page.getByPlaceholder('متى تحتاج الدعم أو النتيجة؟').fill('خلال شهر');
    await continueStep(page);

    await page.getByRole('combobox', { name: 'إطار الميزانية' }).selectOption({ label: 'تقدير تقريبي' });
    await continueStep(page);

    await page.getByPlaceholder('ما أبرز التحديات أو العقبات؟').fill('تأخر المقاول وتعارض قرارات أصحاب المصلحة');
    await continueStep(page);

    await continueStep(page);

    await page.getByRole('combobox', { name: 'هدف الخدمة' }).selectOption({ label: 'خطة تعافي / إنقاذ' });
    await continueStep(page);

    await continueStep(page);
    await continueStep(page);

    await expect(page.getByText('موجز جاهزية إدارة المشروع')).toBeVisible({ timeout: 15000 });
    await continueStep(page);

    await page.getByRole('checkbox').first().check();
    await continueStep(page);

    await expect(
      page.getByText('تم تجهيز موجز جاهزية إدارة المشروع. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.'),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('checkbox').check();
    await continueStep(page);

    await page.getByRole('button', { name: 'إنهاء وإرسال الطلب' }).click();
    await expect(page.getByText('تم إكمال رحلة جاهزية إدارة المشروع.')).toBeVisible({ timeout: 15000 });
  });

  test('duplicate active project management journey is blocked on restart', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/project-management`);
    await resetJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ رحلة جاهزية إدارة المشروع' }).click();
    await expect(page.getByRole('heading', { name: 'نوع المشروع' })).toBeVisible({ timeout: 15000 });

    await page.goto(`${FRONTEND}/journeys/project-management`);
    await expect(page.getByRole('heading', { name: 'نوع المشروع' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'ابدأ رحلة جاهزية إدارة المشروع' })).not.toBeVisible();
  });
});
