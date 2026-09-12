import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Homepage light journey (WO-021 C04/C05)', () => {
  test('full home interaction path at desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1586, height: 992 });
    await page.goto(FRONTEND);

    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /من الفكرة إلى/ })).toBeVisible();
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible();
    await expect(page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟')).toBeVisible();

    const input = page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟');
    await input.fill('أحتاج استشارة هندسية');
    await expect(input).toHaveValue('أحتاج استشارة هندسية');

    await expect(page.getByRole('region', { name: 'منصات القطاعات' })).toBeVisible();
    const sectorLink = page.locator('.home-sector-rail a').first();
    await expect(sectorLink).toBeVisible();
    const sectorHref = await sectorLink.getAttribute('href');
    expect(sectorHref).toBeTruthy();
    await page.goto(`${FRONTEND}${sectorHref}`);
    await page.goto(FRONTEND);

    await expect(page.locator('#home-about')).toBeVisible();
    await expect(page.locator('#home-projects-showcase')).toBeVisible();
    await expect(page.locator('#home-investment')).toBeVisible();
    await expect(page.locator('#home-contact')).toBeVisible();
    await expect(page.locator('footer')).toHaveCount(1);
  });

  test('removed sections and old card row absent', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FRONTEND);

    await expect(page.getByRole('heading', { name: 'سوق EAM' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'الرؤى والأفكار' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'شركاؤنا' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'آخر المقالات' })).toHaveCount(0);
    await expect(page.locator('.homepage-dashboard')).toHaveCount(0);

    const commandCenter = page.locator('#home-command-center');
    const oldCardLabels = [
      'المعرفة والأفكار',
      'الخدمات الهندسية',
      'الاستثمار معنا',
      'السوق والمنصات',
    ];
    for (const label of oldCardLabels) {
      await expect(commandCenter.getByRole('link', { name: label })).toHaveCount(0);
    }
  });

  test('trust ribbon has no unverified numeric claims', async ({ page }) => {
    await page.goto(FRONTEND);
    const ribbon = page.locator('.home-stats-ribbon');
    await expect(ribbon).toBeVisible();
    const text = await ribbon.innerText();
    expect(text).not.toMatch(/\+250|98%|\+15|\+120/);
    expect(text).toMatch(/تميّز|مصداقية|استدامة|ابتكار/);
  });
});
