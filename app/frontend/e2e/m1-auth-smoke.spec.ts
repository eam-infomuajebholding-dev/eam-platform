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
    await expect(page.getByText('مساعد هندسي ذكي')).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')].filter((b) => b.textContent?.includes('أبني منزلًا'));
      buttons[0]?.click();
    });
    await expect(page.getByPlaceholder('مثال: الرياض')).toBeVisible({ timeout: 45000 });

    await page.getByPlaceholder('مثال: الرياض').fill('جدة');
    await page.getByRole('button', { name: 'متابعة' }).click();
    const journeyBefore = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
    expect(journeyBefore).toBeTruthy();

    await page.reload();
    await expect(page.getByRole('radio', { name: 'أملك الأرض' })).toBeVisible({ timeout: 20000 });
    const journeyAfter = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
    expect(journeyAfter).toBe(journeyBefore);

    await page.getByRole('button', { name: 'تسجيل الدخول' }).first().click();
    await page.waitForURL(/auth\.atoms\.dev|auth\/callback|localhost:8000/, { timeout: 30000 });

    const finalUrl = page.url();
    const providerBlocked = finalUrl.includes('auth.atoms.dev');
    if (providerBlocked) {
      const body = await page.locator('body').innerText();
      const snippet = body.slice(0, 300).replace(/\s+/g, ' ');
      console.log('OIDC_PROVIDER_URL:', finalUrl.split('?')[0]);
      console.log('OIDC_PROVIDER_BODY_SNIPPET:', snippet);
      expect(snippet.toLowerCase()).toMatch(/invalid|error|redirect/);
      return;
    }

    throw new Error(`Unexpected OIDC navigation: ${finalUrl}`);
  });
});
