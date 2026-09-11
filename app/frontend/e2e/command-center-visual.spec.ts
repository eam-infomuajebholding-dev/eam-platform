import { expect, test } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND = 'http://localhost:3000';
const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(E2E_DIR, '../../backend');

function mintAdminToken(): string {
  return execSync('python scripts/mint_admin_jwt.py', {
    cwd: BACKEND_DIR,
    encoding: 'utf8',
  }).trim();
}

test.describe('Command Center visual evidence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('capture desktop command center with admin session', async ({ page }) => {
    const token = mintAdminToken();
    await page.context().addInitScript((t) => {
      localStorage.setItem('token', t);
    }, token);

    await page.goto(`${FRONTEND}/command-center`);
    await expect(page.getByRole('heading', { name: 'لوحة القيادة' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'نظرة قيادية' })).toBeVisible({ timeout: 30000 });

    const dir = path.join(process.cwd(), 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, 'wo012-command-center-desktop.png'), fullPage: true });
  });

  test('capture mobile emergency view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const token = mintAdminToken();
    await page.context().addInitScript((t) => {
      localStorage.setItem('token', t);
    }, token);

    await page.goto(`${FRONTEND}/command-center`);
    await expect(page.getByRole('heading', { name: 'لوحة القيادة' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'نظرة قيادية' })).toBeVisible({ timeout: 30000 });
    await page.screenshot({
      path: path.join(process.cwd(), 'screenshots', 'wo012-command-center-mobile.png'),
      fullPage: true,
    });
  });
});
