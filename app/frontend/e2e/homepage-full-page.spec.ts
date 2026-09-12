import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const VIEWPORT = { width: 1586, height: 992 };

const HOME_SECTION_SELECTORS = [
  '#home-command-center',
  '#home-about',
  '#home-solutions',
  '#home-projects-showcase',
  '#home-investment',
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
    const investment = await sectionY(page, '#home-investment');
    const contact = await sectionY(page, '#home-contact');
    const footer = await sectionY(page, 'footer');

    expect(command).not.toBeNull();
    expect(about).not.toBeNull();
    expect(solutions).not.toBeNull();
    expect(projects).not.toBeNull();
    expect(investment).not.toBeNull();
    expect(contact).not.toBeNull();
    expect(footer).not.toBeNull();

    expect(command!).toBeLessThan(about!);
    expect(about!).toBeLessThan(solutions!);
    expect(solutions!).toBeLessThan(projects!);
    expect(projects!).toBeLessThan(investment!);
    expect(investment!).toBeLessThan(contact!);
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

  test('about section follows first viewport (natural height)', async ({ page }) => {
    const layout = await page.evaluate(() => {
      const command = document.querySelector('#home-command-center');
      const about = document.querySelector('#home-about');
      if (!command || !about) return null;
      const commandBottom = command.getBoundingClientRect().bottom + window.scrollY;
      const aboutTop = about.getBoundingClientRect().top + window.scrollY;
      return {
        commandBottom: Math.round(commandBottom),
        aboutTop: Math.round(aboutTop),
        scrollHeight: document.documentElement.scrollHeight,
      };
    });

    expect(layout).not.toBeNull();
    expect(layout!.aboutTop).toBeGreaterThanOrEqual(layout!.commandBottom - 8);
    expect(layout!.scrollHeight).toBeGreaterThan(992);
  });

  test('platform grid uses canonical 16 sectors', async ({ page }) => {
    const count = await page.locator('#home-solutions [data-sector-slug]').count();
    expect(count).toBe(16);
  });

  test('contact route reachable', async ({ page }) => {
    await page.goto(`${FRONTEND}/contact`);
    await expect(page.getByRole('heading', { name: /تواصل/i }).first()).toBeVisible();
  });
});
