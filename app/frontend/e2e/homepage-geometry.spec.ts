import { expect, test } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';
const VIEWPORT = { width: 1586, height: 992 };
const MIN_SECTOR_BOTTOM_GAP = 12;

type Box = { x: number; y: number; w: number; h: number };

function pctDelta(actual: number, reference: number) {
  return Math.abs(actual - reference) / reference;
}

function withinPct(actual: number, reference: number, tolerance = 0.05) {
  return pctDelta(actual, reference) <= tolerance;
}

function withinPx(actual: number, reference: number, tolerance = 12) {
  return Math.abs(actual - reference) <= tolerance;
}

async function measureBoxes(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const r = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const card = document.querySelector('.home-sector-rail a');
    const cardBox = card
      ? (() => {
          const b = card.getBoundingClientRect();
          return {
            x: Math.round(b.x),
            y: Math.round(b.y),
            w: Math.round(b.width),
            h: Math.round(b.height),
            bottom: Math.round(b.bottom),
          };
        })()
      : null;
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      header: r('nav'),
      quickBar: r('.home-quick-action-bar'),
      dashboard: r('.homepage-dashboard'),
      colLeft: r('[data-home-column="left"]'),
      colCenter: r('[data-home-column="center"]'),
      colRight: r('[data-home-column="right"]'),
      leftTop: r('[aria-label="آخر المشاريع"]'),
      leftBottom: r('[aria-label="مشاريع مميزة"]'),
      center: r('[aria-label="مساحة العمل الذكية"]'),
      chat: r('.home-hero-chat'),
      emblem: r('[aria-label="مساحة العمل الذكية"] img[alt*="شعار"]'),
      rightTop: r('[aria-label="إحصائيات المنصة"]'),
      rightBottom: r('[aria-label="آخر الأنشطة"]'),
      sectorRail: r('.home-sector-rail'),
      sectorCard: cardBox,
    };
  });
}

test.describe('Homepage geometry at 1586x992', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto(FRONTEND);
    await expect(page.getByRole('region', { name: 'مساحة العمل الذكية' })).toBeVisible();
  });

  test('no horizontal overflow', async ({ page }) => {
    const dims = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(dims.scrollW - dims.clientW).toBeLessThanOrEqual(1);
  });

  test('section 01 fits reference viewport; full page continues below', async ({ page }) => {
    const dims = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      commandBottom: (() => {
        const el = document.querySelector('#home-command-center');
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return Math.round(b.bottom + window.scrollY);
      })(),
    }));

    expect(dims.innerHeight).toBe(992);
    expect(dims.scrollHeight).toBeGreaterThan(dims.innerHeight);
    expect(dims.commandBottom).not.toBeNull();
    expect(dims.commandBottom!).toBeGreaterThanOrEqual(dims.innerHeight);
  });

  test('sector cards fully visible with bottom clearance', async ({ page }) => {
    const sectorCard = await page.evaluate(() => {
      const card = document.querySelector('.home-sector-rail a');
      if (!card) return null;
      const b = card.getBoundingClientRect();
      return { bottom: Math.round(b.bottom), h: Math.round(b.height) };
    });

    expect(sectorCard).not.toBeNull();
    expect(sectorCard!.h).toBeGreaterThanOrEqual(195);
    expect(sectorCard!.bottom).toBeLessThanOrEqual(VIEWPORT.height - MIN_SECTOR_BOTTOM_GAP);
    expect(sectorCard!.bottom).toBeLessThan(VIEWPORT.height);
  });

  test('major regions within geometry thresholds', async ({ page }) => {
    const boxes = await measureBoxes(page);

    expect(boxes.header).not.toBeNull();
    expect(boxes.quickBar).not.toBeNull();
    expect(boxes.dashboard).not.toBeNull();
    expect(boxes.leftTop).not.toBeNull();
    expect(boxes.leftBottom).not.toBeNull();
    expect(boxes.center).not.toBeNull();
    expect(boxes.rightTop).not.toBeNull();
    expect(boxes.rightBottom).not.toBeNull();
    expect(boxes.sectorRail).not.toBeNull();
    expect(boxes.sectorCard).not.toBeNull();

    const header = boxes.header as Box;
    const quickBar = boxes.quickBar as Box;
    const colLeft = boxes.colLeft as Box;
    const colCenter = boxes.colCenter as Box;
    const colRight = boxes.colRight as Box;
    const leftTop = boxes.leftTop as Box;
    const leftBottom = boxes.leftBottom as Box;
    const center = boxes.center as Box;
    const rightTop = boxes.rightTop as Box;
    const rightBottom = boxes.rightBottom as Box;
    const sectorRail = boxes.sectorRail as Box;
    const sectorCard = boxes.sectorCard as Box & { bottom: number };

    expect(withinPct(header.h, 84, 0.08)).toBeTruthy();
    expect(withinPct(quickBar.h, 34, 0.12)).toBeTruthy();
    expect(withinPct(colLeft.w, 433, 0.06)).toBeTruthy();
    expect(withinPct(colCenter.w, 673, 0.06)).toBeTruthy();
    expect(withinPct(colRight.w, 433, 0.06)).toBeTruthy();
    expect(withinPct(leftTop.h, 330, 0.08)).toBeTruthy();
    expect(withinPct(leftBottom.h, 208, 0.1)).toBeTruthy();
    expect(withinPct(center.h, 626, 0.08)).toBeTruthy();
    expect(withinPct(rightTop.h, 320, 0.1)).toBeTruthy();
    expect(withinPct(rightBottom.h, 228, 0.1)).toBeTruthy();
    expect(withinPx(sectorRail.y, 756, 28)).toBeTruthy();
    expect(withinPct(sectorCard.h, 210, 0.08)).toBeTruthy();
    expect(withinPct(sectorCard.w, 148, 0.08)).toBeTruthy();
    expect(sectorCard.bottom).toBeLessThanOrEqual(VIEWPORT.height - MIN_SECTOR_BOTTOM_GAP);

    expect(center.w / page.viewportSize()!.width).toBeGreaterThan(0.38);
    expect(center.w / page.viewportSize()!.width).toBeLessThan(0.48);
    expect(sectorRail.y).toBeGreaterThan(rightBottom.y + rightBottom.h - 40);
  });
});
