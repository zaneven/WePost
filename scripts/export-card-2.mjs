import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const card = JSON.parse(readFileSync('/tmp/wepost-card-openai.json', 'utf8'));
const b64 = Buffer.from(JSON.stringify(card), 'utf8').toString('base64url');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

// Fresh incognito context (no pre-existing localStorage)
const context = await browser.createBrowserContext();
const page = await context.newPage();
await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

// Navigate to export page with hash
const url = `http://localhost:3000/export#card=${b64}`;
console.log("URL length:", url.length);

await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => document.fonts?.ready);
await new Promise((r) => setTimeout(r, 3000));

// Check content
const text = await page.evaluate(() => {
  const el = document.querySelector('#wepost-card-export-target');
  return el?.textContent?.substring(0, 200) || document.body.innerText.substring(0, 200);
});
console.log("Content:", text);

const hasOpenAI = await page.evaluate(() => document.body.innerText.includes('OpenAI'));
console.log("Has OpenAI:", hasOpenAI);

if (hasOpenAI) {
  const el = await page.$('#wepost-card-export-target');
  if (el) {
    await el.screenshot({ path: '/tmp/wepost-card-openai.png', type: 'png' });
    console.log("Card screenshot saved!");
  }
} else {
  await page.screenshot({ path: '/tmp/wepost-card-openai.png', type: 'png', fullPage: false });
  console.log("Full page screenshot saved (fallback)");
}

await browser.close();
console.log('DONE');