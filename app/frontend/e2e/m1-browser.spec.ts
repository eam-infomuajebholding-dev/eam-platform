import { expect, test, type Page } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const BACKEND = 'http://localhost:8000';

type Diagnostics = {
  consoleErrors: string[];
  failedRequests: string[];
  redirects: string[];
};

type FlowResult = {
  flow: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIP';
  evidence: string[];
  diagnostics: Diagnostics;
};

const report: FlowResult[] = [];

function attachDiagnostics(page: Page): Diagnostics {
  const bucket: Diagnostics = { consoleErrors: [], failedRequests: [], redirects: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('response', (resp) => {
    const status = resp.status();
    const short = resp.url().replace(BACKEND, '[backend]').replace(FRONTEND, '[frontend]');
    if (status >= 400) bucket.failedRequests.push(`${status} ${short}`);
  });
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) bucket.redirects.push(frame.url());
  });
  return bucket;
}

async function openHomepage(page: Page) {
  await page.goto(FRONTEND);
  await expect(page.getByText('مساعد هندسي ذكي')).toBeVisible({ timeout: 15000 });
}

async function clickBuildVilla(page: Page) {
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((button) =>
      button.textContent?.includes('أبني منزلًا'),
    );
    buttons[0]?.click();
  });
  await expect(page.getByPlaceholder('مثال: الرياض')).toBeVisible({ timeout: 45000 });
}

async function completeBuildVillaInHero(page: Page, city = 'الرياض') {
  await page.getByPlaceholder('مثال: الرياض').fill(city);
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'أملك الأرض' }).check();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByPlaceholder('500').fill('600');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('radio', { name: 'لا' }).check();
  await page.getByRole('button', { name: 'متابعة (اختياري)' }).click();
  await page.getByRole('radio', { name: 'خدمة متكاملة' }).check();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByRole('button', { name: 'إنهاء الرحلة' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'إنهاء الرحلة' }).click();
}

async function performOidcLogin(page: Page): Promise<'authenticated' | 'blocked_at_provider' | 'callback_failed'> {
  const email = process.env.E2E_OIDC_EMAIL;
  const password = process.env.E2E_OIDC_PASSWORD;

  await page.getByRole('button', { name: 'تسجيل الدخول' }).first().click();
  await page.waitForURL(/auth\.atoms\.dev|auth\/callback|localhost:8000/, { timeout: 30000 });

  if (page.url().includes('/auth/callback')) {
    await page.waitForURL(`${FRONTEND}/**`, { timeout: 30000 });
    const hasUser = await page.getByRole('link', { name: 'طلباتي' }).isVisible().catch(() => false);
    return hasUser ? 'authenticated' : 'callback_failed';
  }

  if (!page.url().includes('auth.atoms.dev')) {
    return 'callback_failed';
  }

  if (!email || !password) {
    return 'blocked_at_provider';
  }

  await page.fill('input[type="email"], input[name="email"], input[name="username"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: /sign in|log in|login|دخول/i }).click();
  await page.waitForURL(/auth\/callback|localhost:3000/, { timeout: 60000 });

  if (page.url().includes('error') || page.url().includes('#error')) {
    return 'callback_failed';
  }

  await page.waitForURL(`${FRONTEND}/**`, { timeout: 30000 });
  const hasUser = await page.getByRole('link', { name: 'طلباتي' }).isVisible().catch(() => false);
  return hasUser ? 'authenticated' : 'callback_failed';
}

test.describe.serial('M1 Real Browser E2E', () => {
  test('Flow B — anonymous → continuity → terminal (pre-login)', async ({ browser }) => {
    const diagnostics = { consoleErrors: [] as string[], failedRequests: [] as string[], redirects: [] as string[] };
    const bucket: FlowResult = { flow: 'B', status: 'FAIL', evidence: [], diagnostics };
    const context = await browser.newContext();
    const page = await context.newPage();
    Object.assign(diagnostics, attachDiagnostics(page));

    try {
      await openHomepage(page);
      bucket.evidence.push('homepage_rendered');
      await clickBuildVilla(page);
      await page.getByPlaceholder('مثال: الرياض').fill('جدة');
      await page.getByRole('button', { name: 'متابعة' }).click();
      await page.getByRole('radio', { name: 'أملك الأرض' }).check();
      await page.getByRole('button', { name: 'متابعة' }).click();

      const anon = await page.evaluate(() => sessionStorage.getItem('eam-anonymous-session-id'));
      const journey = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
      bucket.evidence.push(`sessionStorage.anonymous=${Boolean(anon)}`);
      bucket.evidence.push(`sessionStorage.journey=${Boolean(journey)}`);
      expect(anon).toBeTruthy();
      expect(journey).toBeTruthy();

      await page.reload();
      await expect(page.getByPlaceholder('500')).toBeVisible({ timeout: 20000 });
      bucket.evidence.push('refresh_restored_land_area_step');

      await page.getByPlaceholder('500').fill('450');
      await page.getByRole('button', { name: 'متابعة' }).click();
      await page.getByRole('radio', { name: 'لا' }).check();
      await page.getByRole('button', { name: 'متابعة (اختياري)' }).click();
      await page.getByRole('radio', { name: 'خدمة متكاملة' }).check();
      await page.getByRole('button', { name: 'متابعة' }).click();
      await page.getByRole('button', { name: 'إنهاء الرحلة' }).click();
      await expect(page.getByText('تم إكمال رحلة جمع المعلومات.', { exact: true })).toBeVisible({ timeout: 15000 });
      bucket.evidence.push('anonymous_terminal_reached');

      const loginResult = await performOidcLogin(page);
      bucket.evidence.push(`oidc_login=${loginResult}`);
      if (loginResult !== 'authenticated') {
        bucket.status = 'BLOCKED';
        bucket.evidence.push('blocked_oidc_login_for_attach_resume');
        return;
      }

      bucket.evidence.push('auth_context_recognized=طلباتي_visible');
      const journeyAfter = await page.evaluate(() => sessionStorage.getItem('eam-active-journey-instance-id'));
      bucket.evidence.push(`journey_pointer_after_login=${journeyAfter ?? 'null'}`);

      await page.goto(`${FRONTEND}/my-requests`);
      const cards = page.locator('a[href^="/my-requests/"]');
      const count = await cards.count();
      bucket.evidence.push(`my_requests_count=${count}`);
      expect(count).toBe(1);
      bucket.status = 'PASS';
    } catch (e) {
      bucket.evidence.push(`error=${e instanceof Error ? e.message : String(e)}`);
    } finally {
      report.push(bucket);
      await context.close();
    }
  });

  test('Flow C — anonymous complete → login catch-up', async ({ browser }) => {
    const diagnostics = { consoleErrors: [] as string[], failedRequests: [] as string[], redirects: [] as string[] };
    const bucket: FlowResult = { flow: 'C', status: 'FAIL', evidence: [], diagnostics };
    const context = await browser.newContext();
    const page = await context.newPage();
    Object.assign(diagnostics, attachDiagnostics(page));

    try {
      await openHomepage(page);
      await clickBuildVilla(page);
      await completeBuildVillaInHero(page, 'الدمام');
      await expect(page.getByText('تم إكمال رحلة جمع المعلومات')).toBeVisible({ timeout: 15000 });
      bucket.evidence.push('anonymous_completion_ui');

      const srBefore = await page.request.get(`${BACKEND}/api/v1/service-requests`);
      bucket.evidence.push(`sr_before_auth=${srBefore.status()}`);
      expect(srBefore.status()).toBe(401);

      const loginResult = await performOidcLogin(page);
      bucket.evidence.push(`oidc_login=${loginResult}`);
      if (loginResult !== 'authenticated') {
        bucket.status = 'BLOCKED';
        return;
      }

      await page.waitForTimeout(3000);
      await page.goto(`${FRONTEND}/my-requests`);
      const cards = page.locator('a[href^="/my-requests/"]');
      const count = await cards.count();
      bucket.evidence.push(`my_requests_count=${count}`);
      expect(count).toBe(1);

      const href = await cards.first().getAttribute('href');
      bucket.evidence.push(`request_href=${href}`);
      if (href) {
        await page.goto(`${FRONTEND}${href}`);
        await expect(page.getByText('الدمام')).toBeVisible({ timeout: 15000 });
        bucket.evidence.push('snapshot_city_matches');
      }
      bucket.status = 'PASS';
    } catch (e) {
      bucket.evidence.push(`error=${e instanceof Error ? e.message : String(e)}`);
    } finally {
      report.push(bucket);
      await context.close();
    }
  });

  test('Flow A — authenticated customer end-to-end', async ({ browser }) => {
    const diagnostics = { consoleErrors: [] as string[], failedRequests: [] as string[], redirects: [] as string[] };
    const bucket: FlowResult = { flow: 'A', status: 'FAIL', evidence: [], diagnostics };
    const context = await browser.newContext();
    const page = await context.newPage();
    Object.assign(diagnostics, attachDiagnostics(page));

    try {
      await openHomepage(page);
      bucket.evidence.push('homepage_rendered');

      const loginResult = await performOidcLogin(page);
      bucket.evidence.push(`oidc_login=${loginResult}`);
      if (loginResult !== 'authenticated') {
        bucket.status = 'BLOCKED';
        return;
      }

      if (page.url().includes('/auth/callback')) {
        bucket.evidence.push('callback_route_no_full_page_failure');
      }

      await openHomepage(page);
      await clickBuildVilla(page);
      await completeBuildVillaInHero(page, 'الرياض');
      await expect(page.getByText('تم استلام طلبك')).toBeVisible({ timeout: 20000 });
      bucket.evidence.push('completion_message_authenticated');

      await page.getByRole('link', { name: 'عرض طلبي' }).click();
      await expect(page).toHaveURL(/\/my-requests\/\d+/);
      bucket.evidence.push('view_request_cta_navigates');

      await page.goto(`${FRONTEND}/my-requests`);
      const cards = page.locator('a[href^="/my-requests/"]');
      expect(await cards.count()).toBe(1);
      bucket.evidence.push('my_requests_exactly_one');

      const href = await cards.first().getAttribute('href');
      if (href) {
        await page.goto(`${FRONTEND}${href}`);
        await expect(page.getByText('تفاصيل الطلب')).toBeVisible();
        await expect(page.getByText('الرياض')).toBeVisible();
        bucket.evidence.push('snapshot_verified');
        await page.reload();
        await expect(page.getByText('تفاصيل الطلب')).toBeVisible();
        bucket.evidence.push('refresh_persists_request');
      }
      bucket.status = 'PASS';
    } catch (e) {
      bucket.evidence.push(`error=${e instanceof Error ? e.message : String(e)}`);
    } finally {
      report.push(bucket);
      await context.close();
    }
  });

  test('Flow D — ownership / security isolation', async ({ browser }) => {
    const diagnostics = { consoleErrors: [] as string[], failedRequests: [] as string[], redirects: [] as string[] };
    const bucket: FlowResult = { flow: 'D', status: 'SKIP', evidence: [], diagnostics };

    const emailA = process.env.E2E_OIDC_EMAIL_A ?? process.env.E2E_OIDC_EMAIL;
    const passA = process.env.E2E_OIDC_PASSWORD_A ?? process.env.E2E_OIDC_PASSWORD;
    const emailB = process.env.E2E_OIDC_EMAIL_B;
    const passB = process.env.E2E_OIDC_PASSWORD_B;

    if (!emailA || !passA || !emailB || !passB) {
      bucket.evidence.push('second_test_account_unavailable');
      report.push(bucket);
      return;
    }

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    Object.assign(diagnostics, attachDiagnostics(pageA));

    try {
      await openHomepage(pageA);
      process.env.E2E_OIDC_EMAIL = emailA;
      process.env.E2E_OIDC_PASSWORD = passA;
      expect(await performOidcLogin(pageA)).toBe('authenticated');
      await pageA.goto(`${FRONTEND}/my-requests`);
      const href = await pageA.locator('a[href^="/my-requests/"]').first().getAttribute('href');
      bucket.evidence.push(`customer_a_request=${href}`);
      expect(href).toBeTruthy();

      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      await openHomepage(pageB);
      process.env.E2E_OIDC_EMAIL = emailB;
      process.env.E2E_OIDC_PASSWORD = passB;
      expect(await performOidcLogin(pageB)).toBe('authenticated');

      const resp = await pageB.goto(`${FRONTEND}${href}`);
      bucket.evidence.push(`customer_b_direct_access_status=${resp?.status() ?? 'unknown'}`);
      const leaked = await pageB.getByText('تفاصيل الطلب').isVisible().catch(() => false);
      bucket.evidence.push(`data_leaked=${leaked}`);
      expect(leaked).toBe(false);
      bucket.status = 'PASS';
      await contextB.close();
    } catch (e) {
      bucket.status = 'FAIL';
      bucket.evidence.push(`error=${e instanceof Error ? e.message : String(e)}`);
    } finally {
      report.push(bucket);
      await contextA.close();
    }
  });

  test.afterAll(async () => {
    // eslint-disable-next-line no-console
    console.log('\n=== M1_E2E_JSON ===\n' + JSON.stringify(report, null, 2));
  });
});
