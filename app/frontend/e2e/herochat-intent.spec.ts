import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function openHomeHeroChat(page: import('@playwright/test').Page) {
  await page.goto(FRONTEND);
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
  await page.reload();
  await expect(page.getByText('ابدأ رحلتك معنا من هنا')).toBeVisible({ timeout: 15000 });
}

async function sendHeroMessage(page: import('@playwright/test').Page, message: string) {
  const input = page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟');
  await input.fill(message);
  await page.getByRole('button', { name: 'إرسال' }).click();
}

test.describe('HeroChat intent routing (free chat only)', () => {
  test('guided journey tab is not offered in the assistant', async ({ page }) => {
    await openHomeHeroChat(page);
    await expect(page.getByRole('tab', { name: 'رحلة مخصصة' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'محادثة حرة' })).toHaveCount(0);
  });

  test('S25: ambiguous request asks for clarification without in-assistant journey forms', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'عندي مشروع');
    await expect(page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')).not.toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...'),
    ).not.toBeVisible();
    await expect(
      page
        .getByText(/هل تريد بناء فيلا|استشارة هندسية|خدمة الذكاء الاصطناعي غير متاحة/i)
        .first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
