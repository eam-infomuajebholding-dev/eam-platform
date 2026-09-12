import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

const RICH_SECTOR_ROUTES: Array<{ label: string; href: string }> = [
  { label: 'التطوير العقاري', href: '/services/real-estate-development' },
  { label: 'التسويق العقاري', href: '/services/real-estate-marketing' },
  { label: 'الاستثمار العقاري', href: '/invest' },
  { label: 'بناء المنازل والفلل', href: '/journeys/build-villa' },
  { label: 'الخدمات الحكومية', href: '/government-services' },
  { label: 'الاستشارات الهندسية', href: '/engineering-services' },
  { label: 'المقاولات والتشييد', href: '/services/contracting' },
  { label: 'التشغيل والصيانة الذكية', href: '/services/maintenance' },
];

test.describe('UI structure regression', () => {
  test('homepage preserves approved light structural regions', async ({ page }) => {
    await page.goto(FRONTEND);

    await expect(page.getByRole('heading', { level: 1, name: /من الفكرة إلى/ })).toBeVisible();
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible();
    await expect(page.getByPlaceholder('ما الذي تريد إنجازه اليوم؟')).toBeVisible();
    await expect(page.getByRole('button', { name: 'أبني منزلًا' }).first()).toBeVisible();
    await expect(page.getByRole('region', { name: 'منصات القطاعات' })).toBeVisible();
    await expect(page.locator('.homepage-dashboard')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'نبذة عن EAM' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'الاستثمار' })).toBeVisible();

    const sectorLinks = page.locator('[aria-label="منصات القطاعات"] a');
    await expect(sectorLinks).toHaveCount(32);

    const sectorImages = page.locator('[aria-label="منصات القطاعات"] a img');
    await expect(sectorImages).toHaveCount(20);
    await expect(sectorImages.first()).toHaveAttribute('src', /\/images\/eam\/sectors\//);
  });

  test('rich sector cards route to implemented pages', async ({ page }) => {
    await page.goto(FRONTEND);

    for (const sector of RICH_SECTOR_ROUTES) {
      const link = page.locator(`[aria-label="منصات القطاعات"] a[href="${sector.href}"]`).first();
      await expect(link).toHaveAttribute('href', sector.href);
    }
  });

  test('inner pages keep Layout shell and avoid sector placeholder copy', async ({ page }) => {
    await page.goto(`${FRONTEND}/about`);

    await expect(page.getByRole('heading', { name: 'من نحن', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'عن EAM' }).first()).toBeVisible();
    await expect(page.getByText('PHASE-LATER')).toHaveCount(0);
  });

  test('placeholder sector route still renders sector page', async ({ page }) => {
    await page.goto(`${FRONTEND}/sectors/project-management`);

    await expect(page.getByRole('heading', { name: 'إدارة المشاريع', level: 1 })).toBeVisible();
    await expect(page.getByText('نعمل على إعداد المحتوى التفصيلي')).toBeVisible();
    await expect(page.getByText('PHASE-LATER')).toHaveCount(0);
  });

  test('homepage navigation includes canonical home link', async ({ page }) => {
    await page.goto(FRONTEND);

    await expect(page.getByRole('link', { name: 'الرئيسية' }).first()).toBeVisible();
    await expect(page.getByText('PHASE-LATER')).toHaveCount(0);
  });
});
