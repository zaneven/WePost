/**
 * AI 填写客户端：把用户粘贴的原始文字交给 WePost API 用大模型提取为卡片字段。
 *
 * 线上前端与 API 同源（wepost.zaneven.com），本地 dev 跨域由 worker 侧 CORS 白名单放行。
 * 服务端约束：同源校验、每 IP 每日限流、输入 ≤ 8000 字；LLM 未配置返回 503。
 */
import type { CardData } from '@/types/card';

const API_BASE = 'https://wepost.zaneven.com';

export const AI_FILL_MAX_CHARS = 8000;

/** 枚举字段白名单：与 src/types/card.ts 的受控枚举保持一致，非法值一律丢弃 */
const TEMPLATE_IDS = new Set([
  'minimal-magazine',
  'dark-glass',
  'vintage-news',
  'warm-memo',
  'zen-quote',
  'acid-bold',
  'ink-wash',
  'terminal-code',
  'editorial-bold',
  'neon-cyber',
]);
const ASPECT_RATIOS = new Set(['3:4', '1:1', '9:16', '2.35:1', '4:3']);
const FONT_FAMILIES = new Set(['sans', 'serif', 'mono', 'kaiti']);
const FONT_SIZES = new Set(['sm', 'base', 'lg', 'xl']);
const ALIGNS = new Set(['left', 'center', 'justify']);

/** 文本字段：trim 后非空才收，超长截断 */
const TEXT_FIELDS: { key: keyof CardData; maxLen: number }[] = [
  { key: 'title', maxLen: 40 },
  { key: 'subtitle', maxLen: 30 },
  { key: 'tag', maxLen: 8 },
  { key: 'content', maxLen: AI_FILL_MAX_CHARS },
  { key: 'author', maxLen: 20 },
  { key: 'date', maxLen: 30 },
  { key: 'footerText', maxLen: 30 },
];

const ENUM_FIELDS: { key: keyof CardData; valid: Set<string> }[] = [
  { key: 'templateId', valid: TEMPLATE_IDS },
  { key: 'aspectRatio', valid: ASPECT_RATIOS },
  { key: 'fontFamily', valid: FONT_FAMILIES },
  { key: 'fontSize', valid: FONT_SIZES },
  { key: 'align', valid: ALIGNS },
];

/**
 * 兜底校验服务端返回的卡片字段：逐字段类型检查，非法值丢弃、超长截断。
 * 纯函数，返回的只包含合法字段（Partial），由调用方合并进当前 CardData。
 */
export function sanitizeAiCard(raw: unknown): Partial<CardData> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const out: Partial<CardData> = {};

  for (const { key, maxLen } of TEXT_FIELDS) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim() !== '') {
      out[key] = v.trim().slice(0, maxLen) as never;
    }
  }
  for (const { key, valid } of ENUM_FIELDS) {
    const v = obj[key];
    if (typeof v === 'string' && valid.has(v)) {
      out[key] = v as never;
    }
  }
  return out;
}

/** 调用 AI 提取接口，成功返回可合并进 CardData 的字段集合 */
export async function requestAiFill(text: string): Promise<Partial<CardData>> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('请先输入要识别的文字');
  if (trimmed.length > AI_FILL_MAX_CHARS) {
    throw new Error(`文字不能超过 ${AI_FILL_MAX_CHARS} 字`);
  }

  const res = await fetch(`${API_BASE}/api/ai/fill`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: trimmed }),
  });

  if (!res.ok) {
    let message = `AI 识别失败 (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // 非 JSON 响应，保留状态码文案
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { card?: unknown };
  const card = sanitizeAiCard(data?.card);
  if (Object.keys(card).length === 0) {
    throw new Error('AI 未识别出有效内容，请换个说法试试');
  }
  return card;
}
