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
  const input = page.getByPlaceholder('صف مشروعك أو اطرح سؤالك...');
  await input.fill(message);
  await page.getByRole('button', { name: 'إرسال' }).click();
}

test.describe('HeroChat intent routing', () => {
  test('S24: engineering consulting free-text starts canonical EC journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'احتاج استشارة هندسية');
    await expect(page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: structural issue phrase starts EC journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'عندي تشققات بالمبنى');
    await expect(page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: valuation free-text starts canonical valuation journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تقييم عقار');
    await expect(page.getByRole('combobox', { name: 'غرض التقييم' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: contracting free-text starts canonical contracting journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أحتاج مقاول');
    await expect(page.getByPlaceholder('صف المشروع ومتطلبات التنفيذ...')).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: furnishing free-text starts canonical furnishing journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تأثيث المنزل');
    await expect(page.getByRole('combobox', { name: 'نوع المساحة' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: project management free-text starts canonical PM journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أحتاج إدارة مشروع');
    await expect(page.getByRole('combobox', { name: 'نوع المشروع' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: smart maintenance free-text starts canonical maintenance journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أحتاج صيانة مكيف');
    await expect(page.getByRole('combobox', { name: 'نوع الصيانة' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: build villa free-text starts canonical BV journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد بناء فيلا في الرياض');
    await expect(
      page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...'),
    ).toBeVisible({ timeout: 15000 });
  });

  test('S24: government services Arabic intent starts canonical GS journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أحتاج رخصة بناء');
    await expect(page.getByRole('heading', { name: 'نوع الخدمة' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: government services English intent starts canonical GS journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'building permit');
    await expect(page.getByRole('heading', { name: 'نوع الخدمة' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: government services intent does not collide with valuation', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تقييم عقار');
    await expect(page.getByRole('heading', { name: 'نوع الخدمة' })).not.toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('combobox', { name: 'غرض التقييم' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: real estate development Arabic intent starts canonical RED journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تطوير مشروع عقاري');
    await expect(page.getByRole('heading', { name: 'سياق الأصل' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: real estate development English intent starts canonical RED journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'property development');
    await expect(page.getByRole('heading', { name: 'سياق الأصل' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: development intent does not collide with valuation', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تقييم عقار');
    await expect(page.getByRole('heading', { name: 'سياق الأصل' })).not.toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: real estate marketing Arabic intent starts canonical REM journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تسويق عقاري');
    await expect(page.getByRole('heading', { name: 'هدف التسويق' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: real estate marketing English intent starts canonical REM journey', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'property marketing');
    await expect(page.getByRole('heading', { name: 'هدف التسويق' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S24: marketing intent does not collide with development', async ({ page }) => {
    await openHomeHeroChat(page);
    await sendHeroMessage(page, 'أريد تسويق عقاري');
    await expect(page.getByRole('heading', { name: 'سياق الأصل' })).not.toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('heading', { name: 'هدف التسويق' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('S25: ambiguous request asks for clarification without forced journey', async ({ page }) => {
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
