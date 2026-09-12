import { expect, test } from '@playwright/test';
import path from 'path';

const FRONTEND = 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'screenshots');

test.describe('WO-021 homepage visual evidence', () => {
  test('capture desktop, tablet, mobile screenshots', async ({ page }) => {
    const viewports = [
      { name: 'wo021-home-desktop-1586x992', width: 1586, height: 992 },
      { name: 'wo021-home-tablet-768x1024', width: 768, height: 1024 },
      { name: 'wo021-home-mobile-390x844', width: 390, height: 844 },
    ] as const;

    let scrollHeight = 0;

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(FRONTEND);
      await expect(page.getByRole('heading', { level: 1, name: /من الفكرة إلى/ })).toBeVisible();
      scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`), fullPage: true });
    }

    expect(scrollHeight).toBeGreaterThan(992);
  });
});
