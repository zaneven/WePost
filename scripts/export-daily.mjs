import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const card = JSON.parse(readFileSync('/tmp/wepost-daily-2026-08-26.json', 'utf8'));
const b64 = Buffer.from(JSON.stringify(card), 'utf8').toString('base64url');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

await page.goto(`http://localhost:3000/export#card=${b64}`, { waitUntil: 'networkidle0' });

// Wait for the card title to appear (data injected, not default example)
await page.waitForFunction(
  (t) => !!document.querySelector('#wepost-card-export-target')?.textContent?.includes(t),
  { timeout: 20000 },
  card.title,
);
await page.evaluate(() => document.fonts?.ready);
await new Promise((r) => setTimeout(r, 800));

const el = await page.$('#wepost-card-export-target');
await el.screenshot({ path: '/Users/a1/Develop/wepost-cards/2026-08-26-ai-daily.png', type: 'png' });
await browser.close();
console.log('DONE');