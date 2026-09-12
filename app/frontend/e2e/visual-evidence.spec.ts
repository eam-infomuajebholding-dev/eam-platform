import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function clearSession(page: import('@playwright/test').Page) {
  await page.evaluate(() => sessionStorage.clear());
}

async function startBuildVilla(page: import('@playwright/test').Page) {
  await page.goto(`${FRONTEND}/journeys/build-villa`);
  await clearSession(page);
  await page.reload();
  await page.getByRole('button', { name: 'ابدأ رحلة بناء الفيلا' }).click();
  await expect(page.getByRole('heading', { name: 'ما هدف مشروع الفيلا؟' })).toBeVisible({
    timeout: 15000,
  });
}

async function advanceBuildVillaToSummary(page: import('@playwright/test').Page) {
  await page
    .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
    .fill('أريد بناء فيلا عائلية للسكن الدائم في الرياض');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'أملك الأرض' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByPlaceholder('500').fill('800');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByPlaceholder('صف احتياجات السكن والاستخدام...').fill('عائلة من 6 أفراد');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByPlaceholder('عدد غرف النوم').fill('5');
  await page.getByRole('button', { name: 'مجلس ضيوف' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: '2 – 5 مليون' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'خلال 6 أشهر' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'معاصر' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.locator('label').filter({ hasText: /^لا$/ }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'خدمة متكاملة' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByRole('heading', { name: 'مراجعة ملخص المشروع' })).toBeVisible({
    timeout: 15000,
  });
}

test.describe('Visual evidence capture (WO-007 §51)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('capture BV + EC desktop states', async ({ page }) => {
    await startBuildVilla(page);
    await page.screenshot({ path: 'screenshots/wo007-bv-project-intent-desktop.png', fullPage: true });

    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم في الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'أملك الأرض' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('500').fill('800');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByRole('heading', { name: 'احتياجات الأسرة والاستخدام' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/wo007-bv-household-desktop.png', fullPage: true });

    await page.getByPlaceholder('صف احتياجات السكن والاستخدام...').fill('عائلة من 6 أفراد');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('عدد غرف النوم').fill('5');
    await page.getByRole('button', { name: 'مجلس ضيوف' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: '2 – 5 مليون' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'خلال 6 أشهر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'معاصر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.locator('label').filter({ hasText: /^لا$/ }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'خدمة متكاملة' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByRole('heading', { name: 'مراجعة ملخص المشروع' })).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: 'screenshots/wo007-bv-summary-review-desktop.png', fullPage: true });

    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByRole('heading', { name: 'الموجز الأولي للمشروع' })).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: 'screenshots/wo007-bv-brief-review-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'تأكيد الموجز والمتابعة' }).click();
    await expect(page.getByRole('heading', { name: 'تأكيد صحة المعلومات' })).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: 'screenshots/wo007-bv-scope-confirm-desktop.png', fullPage: true });
    await page.getByRole('checkbox', { name: /أؤكد أن المعلومات والموجز الأولي/ }).check();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByRole('heading', { name: 'تأكيد إرسال الطلب' })).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: 'screenshots/wo007-bv-submit-confirm-desktop.png', fullPage: true });

    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await clearSession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' }).click();
    await expect(page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wo007-ec-intent-desktop.png', fullPage: true });
  });

  test('capture HeroChat recognition + mobile', async ({ page }) => {
    await page.goto(FRONTEND);
    await clearSession(page);
    await page.reload();
    await expect(page.getByText('ابدأ رحلتك معنا من هنا')).toBeVisible({ timeout: 15000 });
    const input = page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟');
    await input.fill('أريد بناء فيلا في الرياض');
    await page.getByRole('button', { name: 'إرسال' }).click();
    await expect(
      page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...'),
    ).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'screenshots/wo007-herochat-bv-start-desktop.png', fullPage: true });

    await page.goto(FRONTEND);
    await clearSession(page);
    await page.reload();
    await input.fill('احتاج استشارة هندسية');
    await page.getByRole('button', { name: 'إرسال' }).click();
    await expect(page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...')).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: 'screenshots/wo007-herochat-ec-start-desktop.png', fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${FRONTEND}/journeys/build-villa`);
    await page.screenshot({ path: 'screenshots/wo007-bv-mobile-start.png', fullPage: true });
  });
});
