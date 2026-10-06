/**
 * Sends a chat message through the UI and checks for assistant reply bubble (needs backend + AI or graceful error).
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:3002/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });

const input = page.getByPlaceholder(/اسأل، فكّر|Ask, explore/i).first();
await input.fill('ما الفرق بين هيكل خرساني وهيكل معدني؟');
await page.getByRole('button', { name: 'إرسال' }).click();

const assistantBubble = page.locator('.home-hero-chat-wrap .rounded-2xl').filter({ hasText: /.+/ });
await assistantBubble.first().waitFor({ state: 'visible', timeout: 45_000 });
const text = (await assistantBubble.last().textContent())?.trim() ?? '';
console.log('assistant reply length:', text.length);
console.log('reply preview:', text.slice(0, 120));

await browser.close();
process.exit(text.length > 10 ? 0 : 1);
