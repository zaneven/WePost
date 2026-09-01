import { segmentBlocks, type BlockSegment } from '@/core/markdown/blocks';
import {
  getCanvasDimensions,
  getTemplateContentFraction,
  DEFAULT_CONTENT_FRACTION,
} from '@/core/templates/registry';
import type { AspectRatioType, FontSizeType, TemplateId } from '@/types/card';

/**
 * 长文 → 多卡拆分。
 *
 * 把一篇长内容按块边界切分成多张卡片可承载的内容片段。块（段落 / 引用 / 列表 /
 * 代码 / 表格 / 公式）作为原子单位不跨卡，仅当单个段落 / 引用超过一整卡容量时按字符子拆。
 *
 * 容量为像素级启发式估算，参数与 MarkdownRenderer 的实际渲染样式对齐：
 * - 正文行高 leading-relaxed（1.625）、块间距 space-y-4（16px）、列表项间距；
 * - 标题 / 引用 / 代码 / 表格 / hr 等块按各自 my-* 内边距折算为固定像素开销；
 * - CJK 全角字符按 1em 宽、ASCII 等窄字符按 0.55em 宽逐字符累计，避免旧版
 *   「按行数估算」对中文严重少算折行、对块间距零计入导致的「已提示溢出却不拆分」；
 * - 模板外壳水平内边距（p-8~p-16）与正文区 py-3 从画板尺寸中扣除；
 * - contentFraction（registry）继续承担页眉 / 页脚高度占比的差异化；
 * - 安全系数 0.95 吸收亚像素 / 换行点差异，宁早拆不溢出。
 */
const FONT_PX: Record<FontSizeType, number> = { sm: 14, base: 16, lg: 18, xl: 20 };
const BODY_LINE_HEIGHT = 1.625;
const HEADING_LINE_HEIGHT = 1.85;
const BLOCK_GAP_PX = 16;
const H_PADDING_PX = 48;
const MAIN_PADDING_Y_PX = 24;
const BLOCK_INDENT_PX = 30;
const SAFETY_FACTOR = 0.95;

/** 标题块实际渲染字号（MarkdownRenderer 固定值，桌面断点：text-2xl / xl / lg）。 */
const HEADING_FONT_PX = { h1: 24, h2: 20, h3: 18 } as const;
/** 标题块的固定像素开销（自身 my-* + h1 的 pt-2 / pb-2 / 边框）。 */
const HEADING_EXTRA_PX = { h1: 49, h2: 24, h3: 20 } as const;
/** 代码块行高（13px × 1.6）与固定开销（my-4 ×2 + p-4 ×2 + 边框）。 */
const CODE_LINE_HEIGHT_PX = 13 * 1.6;
const CODE_EXTRA_PX = 66;
/** 表格单行高度（0.92em 字号 + py-2 + 边框）与 my-4 ×2。 */
const TABLE_ROW_HEIGHT_PX = 40;
const TABLE_EXTRA_PX = 32;
/** hr 固定高度（my-6 ×2 + py-2 + 线高）。 */
const HR_HEIGHT_PX = 65;
/** 引用块固定开销（my-5 ×2 + py-3 ×2）。 */
const QUOTE_EXTRA_PX = 64;
/** 图片块保守高度（图高无法预知，按近满宽图片 + my-4 ×2 估算）。 */
const IMAGE_HEIGHT_PX = 192;
/** 数学块基础保守高度（KaTeX display 渲染 + my-4 ×2），每多一行源码再加一行字号。 */
const MATH_BASE_HEIGHT_PX = 110;

/** 拆分模式：auto = 按画幅容量启发式切块；divider = 按 --- 分割线切分。 */
export type SplitMode = 'auto' | 'divider';

export interface SplitOptions {
  aspectRatio: AspectRatioType;
  fontSize: FontSizeType;
  /** 当前模板：决定正文可用高度占比（页眉页脚越高容量越小）。缺省用默认占比。 */
  templateId?: TemplateId;
}

/** CJK 全角字符（汉字 / 中文标点 / 全角形式）按 1em 宽，其余按 0.55em 宽。 */
function charWidthEm(codePoint: number): number {
  const cjk =
    (codePoint >= 0x2e80 && codePoint <= 0x9fff) || // CJK 部首与汉字
    (codePoint >= 0x3000 && codePoint <= 0x303f) || // CJK 标点
    (codePoint >= 0xff00 && codePoint <= 0xffef) || // 全角形式
    (codePoint >= 0xf900 && codePoint <= 0xfaff); // 兼容汉字
  return cjk ? 1 : 0.55;
}

/** 估算一行文本的渲染宽度（px）。 */
function textWidthPx(text: string, fontPx: number): number {
  let width = 0;
  for (const ch of text) {
    width += charWidthEm(ch.codePointAt(0) ?? 0) * fontPx;
  }
  return width;
}

/** 文本在可用宽度内的折行数（段落内单换行按软换行拆行，每行至少 1 行）。 */
function wrappedLines(text: string, fontPx: number, availableWidth: number): number {
  return text.split('\n').reduce(
    (sum, line) =>
      sum + Math.max(1, Math.ceil(textWidthPx(line, fontPx) / Math.max(1, availableWidth))),
    0
  );
}

/** 估算一个块渲染占用的像素高度（含自身的 my-* 间距，不含块间 space-y-4）。 */
function blockHeightPx(b: BlockSegment, fontPx: number, contentWidth: number): number {
  const bodyLine = fontPx * BODY_LINE_HEIGHT;
  switch (b.type) {
    case 'h1':
    case 'h2':
    case 'h3':
      return (
        wrappedLines(b.rawLines.join('\n'), HEADING_FONT_PX[b.type], contentWidth) *
          HEADING_FONT_PX[b.type] * HEADING_LINE_HEIGHT +
        HEADING_EXTRA_PX[b.type]
      );
    case 'hr':
      return HR_HEIGHT_PX;
    case 'quote':
      // 引用内容缩进（px-5 ≈ 20px，含边线取 30px）
      return (
        QUOTE_EXTRA_PX +
        wrappedLines(b.rawLines.join('\n'), fontPx, contentWidth - BLOCK_INDENT_PX) * bodyLine
      );
    case 'ul':
    case 'ol': {
      const lines = b.rawLines.reduce(
        (s, l) => s + wrappedLines(l, fontPx, contentWidth - BLOCK_INDENT_PX),
        0
      );
      const gaps = (b.rawLines.length - 1) * (b.type === 'ul' ? 10 : 8); // space-y-2.5 / space-y-2
      return 24 + lines * bodyLine + gaps; // my-3 ×2
    }
    case 'code':
      return CODE_EXTRA_PX + b.rawLines.length * CODE_LINE_HEIGHT_PX;
    case 'table':
      return TABLE_EXTRA_PX + b.rawLines.length * TABLE_ROW_HEIGHT_PX;
    case 'math':
      return MATH_BASE_HEIGHT_PX + Math.max(0, b.rawLines.length - 1) * fontPx;
    case 'image':
      return IMAGE_HEIGHT_PX;
    case 'paragraph':
    default:
      return wrappedLines(b.rawLines.join('\n'), fontPx, contentWidth) * bodyLine;
  }
}

/** 把块数组还原为 Markdown 文本（code / math 重建定界符）。 */
function serializeBlocks(blocks: BlockSegment[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'code')
        return '```' + (b.lang || '') + '\n' + b.rawLines.join('\n') + '\n```';
      if (b.type === 'math') return '$$\n' + b.rawLines.join('\n') + '\n$$';
      return b.rawLines.join('\n');
    })
    .join('\n\n');
}

/** 单个段落 / 引用超过整卡容量时，按字符粗切并尽量在断点处换行。 */
function splitOversizedBlock(
  b: BlockSegment,
  capacityChars: number
): string[] {
  const text = b.rawLines.join('\n');
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    let chunk = text.slice(i, i + capacityChars);
    if (i + capacityChars < text.length) {
      // 优先在换行 / 句号 / 分号 / 空格 / 逗号处断开
      const breakIdx = Math.max(
        chunk.lastIndexOf('\n'),
        chunk.lastIndexOf('。'),
        chunk.lastIndexOf('；'),
        chunk.lastIndexOf(' '),
        chunk.lastIndexOf('，')
      );
      if (breakIdx > capacityChars * 0.5) chunk = chunk.slice(0, breakIdx + 1);
    }
    const trimmed = chunk.trimEnd();
    if (trimmed.length > 0) parts.push(trimmed);
    i += chunk.length;
    if (chunk.length === 0) i++; // 防死循环
  }
  return parts.length ? parts : [text];
}

/** 单卡容量度量：正文可用高度（px，已扣安全系数）与正文区宽度（px）。 */
function capacityMetrics(opts: SplitOptions): {
  availableHeight: number;
  contentWidth: number;
  fontPx: number;
} {
  const { width, height } = getCanvasDimensions(opts.aspectRatio);
  const fontPx = FONT_PX[opts.fontSize];
  const contentFraction = opts.templateId
    ? getTemplateContentFraction(opts.templateId)
    : DEFAULT_CONTENT_FRACTION;
  return {
    // 模板外壳左右内边距（p-8~p-16，取覆盖多数模板的保守值）+ 正文区 py-3
    contentWidth: Math.max(120, width - 2 * H_PADDING_PX),
    availableHeight:
      Math.max(60, height * contentFraction - MAIN_PADDING_Y_PX) * SAFETY_FACTOR,
    fontPx,
  };
}

/**
 * 将长内容拆分为多张卡片的正文片段。
 * @returns 字符串数组，每项为一张卡片的 content；至少返回 1 项。
 */
export function splitContentIntoCards(
  content: string,
  opts: SplitOptions
): string[] {
  const { availableHeight, contentWidth, fontPx } = capacityMetrics(opts);

  const blocks = segmentBlocks(content);
  if (blocks.length === 0) return [content];

  const cards: string[] = [];
  let cur: BlockSegment[] = [];
  let curHeight = 0;

  const flush = () => {
    if (cur.length) {
      cards.push(serializeBlocks(cur));
      cur = [];
      curHeight = 0;
    }
  };

  for (const b of blocks) {
    const h = blockHeightPx(b, fontPx, contentWidth);
    // 单段 / 引用超整卡容量且可子拆：按字符切分到多卡（按块内实际字宽折算容量）
    if (h > availableHeight && (b.type === 'paragraph' || b.type === 'quote')) {
      const text = b.rawLines.join('\n');
      const avgCharPx =
        textWidthPx(text, fontPx) / Math.max(1, text.length);
      const fitLines = Math.floor(availableHeight / (fontPx * BODY_LINE_HEIGHT));
      const capacityChars = Math.max(
        20,
        Math.floor((fitLines * contentWidth) / Math.max(1, avgCharPx))
      );
      flush();
      for (const part of splitOversizedBlock(b, capacityChars)) cards.push(part);
      continue;
    }
    // 加入后（含块间 space-y-4）超可用高度：先收尾当前卡，再单开
    if (cur.length && curHeight + BLOCK_GAP_PX + h > availableHeight) {
      flush();
    }
    curHeight += (cur.length ? BLOCK_GAP_PX : 0) + h;
    cur.push(b);
  }
  flush();

  return cards.length ? cards : [content];
}

/**
 * 按分割线（--- / *** / ___，独占一行）把内容切分为多卡。
 * 分割线本身不保留；切分后空片段（首尾 / 连续分割线产生的）被丢弃。
 * @returns 字符串数组，每项为一张卡片的 content；无分割线时返回原内容单项数组。
 */
export function splitContentByDivider(content: string): string[] {
  if (!content.trim()) return [content];
  const segments = content.split(/^[\t ]*[-*_]{3,}[\t ]*$/gm);
  const cards = segments.map((s) => s.trim()).filter((s) => s.length > 0);
  return cards.length ? cards : [content];
}

/**
 * 估算给定画幅 + 字号下单卡可承载的字符容量（按全角字宽的保守口径，供 UI 预估 / 测试断言）。
 */
export function estimateCardCapacity(opts: SplitOptions): number {
  const { availableHeight, contentWidth, fontPx } = capacityMetrics(opts);
  const fitLines = Math.floor(availableHeight / (fontPx * BODY_LINE_HEIGHT));
  return Math.max(20, fitLines * Math.floor(contentWidth / fontPx));
}
