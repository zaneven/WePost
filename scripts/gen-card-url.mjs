#!/usr/bin/env node
/**
 * WePost 卡片预填充 URL 生成器
 *
 * 读取一个 WePost CardData JSON 文件，校验后用 base64url 编码写入 URL hash，
 * 输出可直接在浏览器打开、画板即渲染对应卡片的链接。
 *
 * 用法:
 *   node scripts/gen-card-url.mjs <card.json> [--base=http://localhost:3000]
 *
 * 与应用端 src/lib/cardImport.ts 的 #card= 读取逻辑配套工作。
 * 被 .claude/skills/wepost-card-gen 调用，把 skill 结构化出的 CardData 注入画板。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const fileArg = args.find((a) => !a.startsWith('--'));
const baseArg = args.find((a) => a.startsWith('--base='));

if (!fileArg) {
  console.error('用法: node scripts/gen-card-url.mjs <card.json> [--base=URL]');
  process.exit(1);
}

const base = (baseArg ? baseArg.split('=')[1] : 'http://localhost:3000').replace(/\/+$/, '');

let data;
try {
  data = JSON.parse(readFileSync(resolve(fileArg), 'utf8'));
} catch (err) {
  console.error('读取 / 解析 JSON 失败:', err.message);
  process.exit(1);
}

// 基本校验：必须有模板与画幅，保证可渲染；其余字段由应用端与默认值合并兜底
const required = ['templateId', 'aspectRatio'];
for (const k of required) {
  if (data[k] === undefined) {
    console.error(`CardData 缺少必要字段: ${k}`);
    process.exit(1);
  }
}

const b64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
const url = `${base}/#card=${b64}`;
process.stdout.write(url);
