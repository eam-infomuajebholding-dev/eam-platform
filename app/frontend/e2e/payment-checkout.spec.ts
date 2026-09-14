import { expect, test } from '@playwright/test';

const BACKEND = process.env.E2E_BACKEND_URL ?? 'http://localhost:8000';
const FRONTEND = process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000';
const RUN_STRIPE_E2E = process.env.E2E_STRIPE === '1';

test.describe('Payment config (always)', () => {
  test('payments config endpoint responds', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/v1/payments/config`);
    expect(resp.ok()).toBeTruthy();
    const body = (await resp.json()) as {
      currency: string;
      payments_enabled: boolean;
      webhook_configured: boolean;
      checkout_ready: boolean;
      mode: string;
      frontend_url_configured: boolean;
    };
    expect(body.currency).toBe('SAR');
    expect(typeof body.payments_enabled).toBe('boolean');
    expect(typeof body.webhook_configured).toBe('boolean');
    if ('checkout_ready' in body) {
      expect(typeof body.checkout_ready).toBe('boolean');
      expect(['test', 'live', 'unset']).toContain(body.mode);
      expect(typeof body.frontend_url_configured).toBe('boolean');
    }
  });
});

test.describe('Stripe Checkout E2E', () => {
  test.skip(!RUN_STRIPE_E2E, 'Set E2E_STRIPE=1 and configure STRIPE_SECRET_KEY + running stack');

  test('hosted checkout accepts test card and returns to success', async ({ page }) => {
    const smoke = process.env.E2E_STRIPE_CHECKOUT_URL;
    const successPath = process.env.E2E_STRIPE_SUCCESS_URL;
    test.skip(!smoke, 'Run backend scripts/stripe_payment_smoke.py and set E2E_STRIPE_CHECKOUT_URL');

    await page.goto(smoke!);
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60000 });

    const cardFrame = page.frameLocator('iframe').first();
    await cardFrame.locator('[name="number"], [placeholder*="1234"]').first().fill('4242424242424242');
    await cardFrame.locator('[name="expiry"], [placeholder*="MM"]').first().fill('1234');
    await cardFrame.locator('[name="cvc"], [placeholder*="CVC"]').first().fill('123');
    await cardFrame.locator('[name="postal"], [placeholder*="ZIP"]').first().fill('12345').catch(() => {});

    await page.getByRole('button', { name: /pay|دفع/i }).click();
    await page.waitForURL(/payment\/success|localhost:3000/, { timeout: 120000 });

    if (successPath) {
      await expect(page).toHaveURL(new RegExp(successPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    } else {
      await expect(page.getByText(/تم الدفع|Payment successful|تأكيد/i)).toBeVisible({ timeout: 30000 });
    }
  });
});

test.describe('Payment pages shell', () => {
  test('success page requires auth (redirects home when logged out)', async ({ page }) => {
    await page.goto(`${FRONTEND}/payment/success?session_id=cs_test_placeholder`);
    await expect(page).toHaveURL(`${FRONTEND}/`, { timeout: 15000 });
  });

  test('cancel page requires auth when logged out', async ({ page }) => {
    await page.goto(`${FRONTEND}/payment/cancel?request_id=42`);
    await expect(page).toHaveURL(`${FRONTEND}/`, { timeout: 15000 });
  });

  test('cancel page stores return path in sessionStorage', async ({ page }) => {
    await page.goto(`${FRONTEND}/payment/cancel?request_id=42`);
    const stored = await page.evaluate(() => sessionStorage.getItem('eam-auth-return-to'));
    expect(stored).toBe('/payment/cancel?request_id=42');
  });
});
