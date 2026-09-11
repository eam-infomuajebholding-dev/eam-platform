import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const VIEWPORT = { width: 1586, height: 992 };

const HOME_SECTION_SELECTORS = [
  '#home-command-center',
  '#home-about',
  '#home-solutions',
  '#home-projects-showcase',
  '#home-why-eam',
  '#home-contact',
  'footer',
] as const;

async function waitForHomepageSections(page: import('@playwright/test').Page) {
  for (const selector of HOME_SECTION_SELECTORS) {
    await expect(page.locator(selector)).toBeAttached({ timeout: 15000 });
  }
}

async function sectionY(page: import('@playwright/test').Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().y + window.scrollY);
  }, selector);
}

test.describe('Homepage full-page section order', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto(FRONTEND);
    await waitForHomepageSections(page);
  });

  test('below-fold sections follow canonical order', async ({ page }) => {
    const command = await sectionY(page, '#home-command-center');
    const about = await sectionY(page, '#home-about');
    const solutions = await sectionY(page, '#home-solutions');
    const projects = await sectionY(page, '#home-projects-showcase');
    const why = await sectionY(page, '#home-why-eam');
    const contact = await sectionY(page, '#home-contact');
    const footer = await sectionY(page, 'footer');

    expect(command).not.toBeNull();
    expect(about).not.toBeNull();
    expect(solutions).not.toBeNull();
    expect(projects).not.toBeNull();
    expect(why).not.toBeNull();
    expect(contact).not.toBeNull();
    expect(footer).not.toBeNull();

    expect(command!).toBeLessThan(about!);
    expect(about!).toBeLessThan(solutions!);
    expect(solutions!).toBeLessThan(projects!);
    expect(projects!).toBeLessThan(why!);
    expect(why!).toBeLessThan(contact!);
    expect(contact!).toBeLessThan(footer!);
  });

  test('full page scrolls vertically after section 01', async ({ page }) => {
    await page.waitForFunction(
      () => document.documentElement.scrollHeight > window.innerHeight,
      undefined,
      { timeout: 15000 },
    );
    const dims = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(dims.innerHeight).toBe(992);
    expect(dims.scrollHeight).toBeGreaterThan(dims.innerHeight);
  });

  test('first viewport has no fixed 992px height on page shell', async ({ page }) => {
    const heights = await page.evaluate(() => {
      const home = document.querySelector('.eam-home');
      const command = document.querySelector('#home-command-center');
      return {
        homeHeight: home ? getComputedStyle(home).height : null,
        commandHeight: command ? getComputedStyle(command).height : null,
        homeMinHeight: home ? getComputedStyle(home).minHeight : null,
      };
    });
    expect(heights.homeHeight).not.toBe('992px');
    expect(heights.commandHeight).not.toBe('992px');
    expect(heights.homeMinHeight).not.toBe('992px');
  });

  test('single footer instance with no duplicates', async ({ page }) => {
    const footerMeta = await page.evaluate(() => {
      const footers = document.querySelectorAll('footer');
      const contact = document.querySelector('#home-contact');
      const footer = footers[0];
      const contactBottom = contact
        ? contact.getBoundingClientRect().bottom + window.scrollY
        : null;
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : null;
      return {
        FOOTER_INSTANCE_COUNT: footers.length,
        DUPLICATE_FOOTER_COUNT: Math.max(0, footers.length - 1),
        footerTop,
        contactBottom,
      };
    });

    expect(footerMeta.FOOTER_INSTANCE_COUNT).toBe(1);
    expect(footerMeta.DUPLICATE_FOOTER_COUNT).toBe(0);
    expect(footerMeta.footerTop).not.toBeNull();
    expect(footerMeta.contactBottom).not.toBeNull();
    expect(footerMeta.footerTop!).toBeGreaterThanOrEqual(footerMeta.contactBottom!);
  });

  test('about section does not bleed into reference viewport', async ({ page }) => {
    const bleed = await page.evaluate(() => {
      const about = document.querySelector('#home-about');
      if (!about) return null;
      const top = about.getBoundingClientRect().top;
      const visible = Math.max(0, Math.round(window.innerHeight - top));
      return {
        ABOUT_TOP_Y: Math.round(top + window.scrollY),
        ABOUT_VISIBLE_PIXELS_IN_REFERENCE_VIEWPORT: top >= window.innerHeight ? 0 : visible,
      };
    });

    expect(bleed).not.toBeNull();
    expect(bleed!.ABOUT_VISIBLE_PIXELS_IN_REFERENCE_VIEWPORT).toBe(0);
  });

  test('contact card route reachable', async ({ page }) => {
    await page.goto(`${FRONTEND}/contact-card`);
    await expect(page.getByText('إعمار الأصالة والمعاصرة').first()).toBeVisible();
  });
});
