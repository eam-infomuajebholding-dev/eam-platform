import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:3002/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1586, height: 992 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
const box = await page.locator('.home-hero-emblem-link img').boundingBox();
const hero = await page.locator('.home-light-hero').boundingBox();
console.log(JSON.stringify({ emblem: box, hero, ratio: box && hero ? box.height / hero.height : null }));
await browser.close();
