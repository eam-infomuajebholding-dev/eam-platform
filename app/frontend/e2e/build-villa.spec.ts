import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

async function clearJourneySession(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('eam-active-journey-instance-id');
    sessionStorage.removeItem('eam-anonymous-session-id');
  });
}

async function startBuildVilla(page: import('@playwright/test').Page) {
  await page.goto(`${FRONTEND}/journeys/build-villa`);
  await clearJourneySession(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'بناء الفيلا' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'ابدأ رحلة بناء الفيلا' }).click();
  await expect(page.getByRole('heading', { name: 'ما هدف مشروع الفيلا؟' })).toBeVisible({
    timeout: 15000,
  });
}

test.describe('Build Villa journey (anonymous)', () => {
  test('C1: first step is project_intent', async ({ page }) => {
    await startBuildVilla(page);
    await expect(page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')).toBeVisible();
    await expect(page.getByText('الخطوة 1 من 15')).toBeVisible();
  });

  test('C3: validates empty project objective', async ({ page }) => {
    await startBuildVilla(page);
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByText('تعذر إرسال هذه الخطوة')).toBeVisible({ timeout: 10000 });
  });

  test('C18: validates invalid land area', async ({ page }) => {
    await startBuildVilla(page);
    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'أملك الأرض' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('500').fill('0');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await expect(page.getByText('تعذر إرسال هذه الخطوة')).toBeVisible({ timeout: 10000 });
  });

  test('C22: BV page does not hydrate EC state', async ({ page }) => {
    await page.goto(`${FRONTEND}/journeys/engineering-consulting`);
    await clearJourneySession(page);
    await page.reload();
    await page.getByRole('button', { name: 'ابدأ الاستشارة الهندسية' }).click();
    await page.getByPlaceholder('صف المشكلة أو الاستشارة المطلوبة...').fill('مراجعة إنشائية');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.goto(`${FRONTEND}/journeys/build-villa`);
    await expect(page.getByRole('button', { name: 'ابدأ رحلة بناء الفيلا' })).toBeVisible();
    await expect(page.getByText('ما التخصص المطلوب؟')).not.toBeVisible();
  });

  test('C2/C5/C6: full V1 path reaches preliminary brief and completes anonymously', async ({ page }) => {
    await startBuildVilla(page);

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

    await page.getByPlaceholder('عدد أفراد الأسرة (اختياري)').fill('6');
    await page
      .getByPlaceholder('صف احتياجات السكن والاستخدام...')
      .fill('عائلة من 6 أفراد مع حاجة للخصوصية');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByPlaceholder('عدد غرف النوم').fill('5');
    await page.getByRole('button', { name: 'مجلس ضيوف' }).click();
    await page.getByRole('button', { name: 'صالة عائلية' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: '2 – 5 مليون' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: 'خلال 6 أشهر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: 'معاصر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByRole('heading', { name: 'هل لديك مستندات أو ملاحظات إضافية؟' })).toBeVisible({
      timeout: 15000,
    });
    await page.locator('label').filter({ hasText: /^لا$/ }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: 'خدمة متكاملة' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByText('موجز مشروع فيلا أولي')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('PRELIMINARY')).toBeVisible();
    await page.getByRole('button', { name: 'تأكيد الموجز والمتابعة' }).click();

    await page.getByRole('checkbox', { name: /أؤكد أن المعلومات والموجز الأولي/ }).check();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByRole('heading', { name: 'تأكيد إرسال الطلب' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('checkbox', { name: /أؤكد رغبتي في إرسال الطلب/ }).check();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByRole('heading', { name: 'اكتملت مرحلة جمع المعلومات' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'إنهاء الرحلة' }).click();
    await expect(page.getByText('تم إكمال رحلة جمع المعلومات بنجاح.')).toBeVisible({
      timeout: 15000,
    });
  });

  test('C4: revisit from summary_review updates city', async ({ page }) => {
    await startBuildVilla(page);

    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم في الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('مثال: الرياض').fill('جدة');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'أملك الأرض' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('500').fill('600');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('صف احتياجات السكن والاستخدام...').fill('عائلة صغيرة');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('عدد غرف النوم').fill('4');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: '2 – 5 مليون' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'خلال 6 أشهر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'معاصر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.locator('label').filter({ hasText: /^لا$/ }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'تصميم فقط' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByRole('heading', { name: 'مراجعة ملخص المشروع' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'تعديل' }).nth(1).click();
    await page.getByPlaceholder('مثال: الرياض').fill('الدمام');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.getByRole('radio', { name: 'أملك الأرض' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('500').fill('600');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('صف احتياجات السكن والاستخدام...').fill('عائلة صغيرة');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('عدد غرف النوم').fill('4');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: '2 – 5 مليون' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'خلال 6 أشهر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'معاصر' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.locator('label').filter({ hasText: /^لا$/ }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('radio', { name: 'تصميم فقط' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();

    await expect(page.getByText('الدمام')).toBeVisible();
  });

  test('C7: resume preserves journey after reload', async ({ page }) => {
    await startBuildVilla(page);
    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
    await page.getByRole('button', { name: 'متابعة' }).click();

    const sessionId = await page.evaluate(() => sessionStorage.getItem('eam-anonymous-session-id'));
    const instanceId = await page.evaluate(() =>
      sessionStorage.getItem('eam-active-journey-instance-id'),
    );
    expect(sessionId).toBeTruthy();
    expect(instanceId).toBeTruthy();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'ما هي حالة الأرض؟' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('C8: duplicate active journey is blocked', async ({ page }) => {
    await startBuildVilla(page);
    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم');
    await page.getByRole('button', { name: 'متابعة' }).click();

    await page.goto(`${FRONTEND}/journeys/build-villa`);
    await page.getByRole('button', { name: 'ابدأ رحلة بناء الفيلا' }).click({ timeout: 5000 }).catch(() => {});
    await expect(page.getByRole('heading', { name: 'في أي مدينة يقع المشروع؟' })).toBeVisible({
      timeout: 15000,
    });
  });
});
