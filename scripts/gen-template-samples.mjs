#!/usr/bin/env node
/**
 * 生成 10 套模板的样例导出图 → docs/samples/<id>.png
 *
 * 复用应用 /export 路由（无 UI 外壳的纯卡片渲染页）+ puppeteer-core 截图。
 * 捕获前等待：① 卡片渲染出当前样例标题（确认 #card= hash 注入生效）
 *            ② 字体就绪 ③ Shiki 代码高亮（含 ``` 时等 .shiki）④ KaTeX（含 $ 时等 .katex）
 *
 * 用法（需先启动开发服务或静态托管 out/）：
 *   node scripts/gen-template-samples.mjs [--base=http://localhost:3000]
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith('--base='));
const BASE = (baseArg ? baseArg.split('=')[1] : 'http://localhost:3000').replace(/\/+$/, '');
const OUT_DIR = resolve('docs/samples');
const SAMPLES = JSON.parse(readFileSync(resolve('scripts/template-samples.json'), 'utf8'));

const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function shoot(page, sample) {
  const b64 = Buffer.from(JSON.stringify(sample.data), 'utf8').toString('base64url');
  // 加 cache-buster 查询参数：/export 页仅在 mount 时读取 #card= hash，
  // 同路径不同 hash 是 fragment 导航、不会重载/重挂载，故每次用唯一查询强制整页加载
  const url = `${BASE}/export?_=${Date.now()}#card=${b64}`;
  // dev 模式下 HMR 长连接会使 networkidle0 永不触发，改用 load + 标题就绪闸门
  await page.goto(url, { waitUntil: 'load' });

  // ① 等卡片渲染出当前样例标题，确认 hash 注入已覆盖 INITIAL_CARD_DATA
  await page.waitForFunction(
    (t) => !!document.querySelector('#wepost-card-export-target')?.textContent?.includes(t),
    { timeout: 30000 },
    sample.data.title
  );
  // ② 字体就绪（系统衬线 / 楷体）
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {});

  // ③ 含代码块 → 等 Shiki 高亮（.shiki 出现）；dev 下 WASM+多语言首载较慢，给 30s
  if (sample.data.content.includes('```')) {
    await page
      .waitForSelector('#wepost-card-export-target .shiki', { timeout: 30000 })
      .catch(() => {});
  }
  // ④ 含数学 → 等 KaTeX（.katex 出现）
  if (/\$/.test(sample.data.content)) {
    await page
      .waitForSelector('#wepost-card-export-target .katex', { timeout: 30000 })
      .catch(() => {});
  }
  // ⑤ 渲染稳定
  await new Promise((r) => setTimeout(r, 600));

  const el = await page.$('#wepost-card-export-target');
  if (!el) throw new Error(`未找到 #wepost-card-export-target：${sample.id}`);
  const outPath = resolve(OUT_DIR, `${sample.id}.png`);
  await el.screenshot({ path: outPath, type: 'png' });
  console.log(`✓ ${sample.id} → ${outPath}`);
}

(async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 2 });
    for (const sample of SAMPLES) {
      try {
        await shoot(page, sample);
      } catch (e) {
        console.error(`✗ ${sample.id}: ${e.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log('ALL DONE');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
