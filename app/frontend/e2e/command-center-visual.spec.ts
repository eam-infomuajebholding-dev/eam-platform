import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { assertBackendAcceptsAdminToken, mintAdminToken } from './helpers/testAuth';

const FRONTEND = process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000';

async function openCommandCenterAsAdmin(page: import('@playwright/test').Page, token: string) {
  await page.context().addInitScript((t) => {
    localStorage.setItem('token', t);
  }, token);
  await page.goto(`${FRONTEND}/command-center`);
  await expect(page.getByRole('heading', { name: 'لوحة القيادة' })).toBeVisible({ timeout: 30000 });
}

test.describe('Command Center visual evidence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('redirects without admin session', async ({ page }) => {
    await page.goto(`${FRONTEND}/command-center`);
    await expect(page).not.toHaveURL(/\/command-center$/);
  });

  test('capture desktop command center with admin session', async ({ page }) => {
    const token = mintAdminToken();
    await assertBackendAcceptsAdminToken(token);
    await openCommandCenterAsAdmin(page, token);
    await expect(page.getByRole('heading', { name: 'نظرة قيادية' })).toBeVisible({ timeout: 30000 });

    const dir = path.join(process.cwd(), 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, 'wo012-command-center-desktop.png'), fullPage: true });
  });

  test('capture mobile emergency view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const token = mintAdminToken();
    await assertBackendAcceptsAdminToken(token);
    await openCommandCenterAsAdmin(page, token);
    await expect(page.getByRole('heading', { name: 'نظرة قيادية' })).toBeVisible({ timeout: 30000 });
    await page.screenshot({
      path: path.join(process.cwd(), 'screenshots', 'wo012-command-center-mobile.png'),
      fullPage: true,
    });
  });
});
