import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:3002/';
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
await page.waitForTimeout(2000);

const rootChildren = await page.locator('#root *').count();
const header = page.getByText(/EAM Copilot|فكّر معي/i);
const placeholder = page.getByPlaceholder(/اسأل، فكّر|What would you like/i);
const dock = page.locator('[data-global-assistant="dock"]');

console.log('URL:', url);
console.log('root child elements:', rootChildren);
console.log('assistant header visible:', await header.first().isVisible().catch(() => false));
console.log('composer placeholder visible:', await placeholder.first().isVisible().catch(() => false));
console.log('global dock present:', (await dock.count()) > 0);
if (errors.length) {
  console.log('\npage errors:');
  errors.forEach((e) => console.log(e));
}

await browser.close();
process.exit(rootChildren > 0 && errors.length === 0 ? 0 : 1);
