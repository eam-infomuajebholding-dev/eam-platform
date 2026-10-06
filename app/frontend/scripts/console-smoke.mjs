import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:3002/';
const logs = [];
const pageErrors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => {
  logs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  pageErrors.push(String(err?.stack || err));
});

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(3000);
  const rootInfo = await page.evaluate(() => ({
    childCount: document.getElementById('root')?.childElementCount ?? -1,
    htmlLen: document.getElementById('root')?.innerHTML?.length ?? -1,
    title: document.title,
  }));
  console.log('URL:', url);
  console.log('Root:', JSON.stringify(rootInfo));
  if (pageErrors.length) {
    console.log('\n=== pageerror ===');
    pageErrors.forEach((e) => console.log(e));
  }
  if (logs.length) {
    console.log('\n=== console ===');
    logs.slice(-40).forEach((l) => console.log(l));
  }
} finally {
  await browser.close();
}
