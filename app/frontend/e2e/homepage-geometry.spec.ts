import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const VIEWPORT = { width: 1586, height: 992 };

test.describe('Homepage light layout at 1586x992', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto(FRONTEND);
    await expect(page.getByRole('heading', { level: 1, name: /من الفكرة إلى/ })).toBeVisible();
  });

  test('no horizontal overflow', async ({ page }) => {
    const dims = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(dims.scrollW - dims.clientW).toBeLessThanOrEqual(1);
  });

  test('exactly one H1 and light hero regions present', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'من الفكرة إلى الأثر' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'منصات القطاعات' })).toBeVisible();
    await expect(page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟')).toBeVisible();
  });

  test('removed homepage sections are absent', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'سوق EAM' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'الرؤى والأفكار' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'شركاؤنا' })).toHaveCount(0);
    await expect(page.locator('.homepage-dashboard')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'آخر المشاريع' })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'إحصائيات المنصة' })).toHaveCount(0);
  });

  test('below-fold sections and natural page height', async ({ page }) => {
    const dims = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      hasAbout: Boolean(document.querySelector('#home-about')),
      hasProjects: Boolean(document.querySelector('#home-projects-showcase')),
      hasInvestment: Boolean(document.querySelector('#home-investment')),
      footerCount: document.querySelectorAll('footer').length,
    }));

    expect(dims.innerHeight).toBe(992);
    expect(dims.scrollHeight).toBeGreaterThan(dims.innerHeight);
    expect(dims.hasAbout).toBeTruthy();
    expect(dims.hasProjects).toBeTruthy();
    expect(dims.hasInvestment).toBeTruthy();
    expect(dims.footerCount).toBe(1);
  });

  test('sector rail cards visible within viewport area', async ({ page }) => {
    const sectorCard = await page.evaluate(() => {
      const card = document.querySelector('.home-sector-rail a');
      if (!card) return null;
      const b = card.getBoundingClientRect();
      return { h: Math.round(b.height), w: Math.round(b.width), visible: b.height > 0 && b.width > 0 };
    });

    expect(sectorCard).not.toBeNull();
    expect(sectorCard!.visible).toBeTruthy();
    expect(sectorCard!.h).toBeGreaterThanOrEqual(195);
  });
});
