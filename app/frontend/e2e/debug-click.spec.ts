import { test } from '@playwright/test';

test('debug build villa click', async ({ page }) => {
  const network: string[] = [];
  page.on('response', (r) => {
    if (r.url().includes('localhost:8000')) {
      network.push(`${r.status()} ${r.request().method()} ${r.url()}`);
    }
  });
  page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()));

  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((button) =>
      button.textContent?.includes('أبني منزلًا'),
    );
    buttons[0]?.click();
  });
  await page.waitForTimeout(15000);
  console.log('NETWORK', JSON.stringify(network, null, 2));
  console.log('HAS_CITY', await page.getByPlaceholder('مثال: الرياض').count());
  console.log('ERROR_TEXT', await page.locator('text=تعذر').allTextContents());
});
