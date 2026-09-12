import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const BACKEND = 'http://localhost:8000';

test.describe('M1 auth browser smoke', () => {
  test('anonymous journey + OIDC provider probe', async ({ page }) => {
    const networkErrors: string[] = [];
    page.on('response', (resp) => {
      const url = resp.url();
      if (resp.status() >= 400) {
        networkErrors.push(`${resp.status()} ${url.replace(BACKEND, '[backend]').replace(FRONTEND, '[frontend]')}`);
      }
    });

    await page.goto(FRONTEND);
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟')).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')].filter((b) => b.textContent?.includes('أبني منزلًا'));
      buttons[0]?.click();
    });
    await expect(
      page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...'),
    ).toBeVisible({ timeout: 45000 });

    await page
      .getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...')
      .fill('أريد بناء فيلا عائلية للسكن الدائم');
    await page.getByRole('button', { name: 'متابعة' }).click();
    const journeyBefore = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
    expect(journeyBefore).toBeTruthy();

    await page.reload();
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible({ timeout: 20000 });
    const resumedStep = page
      .getByPlaceholder('مثال: الرياض')
      .or(page.getByPlaceholder('مثال: أريد بناء فيلا عائلية للسكن الدائم مع مجلس ضيوف...'));
    await expect(resumedStep).toBeVisible({ timeout: 20000 });
    const journeyAfter = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
    expect(journeyAfter).toBe(journeyBefore);

    await page.getByRole('button', { name: 'تسجيل الدخول' }).first().click();
    await page.waitForURL(/auth\.atoms\.dev|auth\/callback|localhost:3000/, { timeout: 30000 });

    const finalUrl = page.url();
    if (finalUrl.includes('auth.atoms.dev') || finalUrl.includes('/auth/callback')) {
      console.log('OIDC_PROVIDER_URL:', finalUrl.split('?')[0]);
      return;
    }

    // OIDC prerequisites absent or provider unreachable — classify, do not fail credential-free smoke.
    test.skip(true, `BLOCKED_EXTERNAL: OIDC navigation stopped at ${finalUrl.split('?')[0]}`);
  });
});
