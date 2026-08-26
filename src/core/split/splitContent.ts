import { segmentBlocks, type BlockSegment } from '@/core/markdown/blocks';
import { getCanvasDimensions } from '@/core/templates/registry';
import type { AspectRatioType, FontSizeType } from '@/types/card';

/**
 * 长文 → 多卡拆分。
 *
 * 把一篇长内容按块边界切分成多张卡片可承载的内容片段，每张卡片的正文估算不超过
 * 画板可容纳行数。块（段落 / 引用 / 列表 / 代码 / 表格 / 公式）作为原子单位不跨卡，
 * 仅当单个段落 / 引用超过一整卡容量时按字符子拆。
 *
 * 容量为启发式估算（画板尺寸 × 字号 × 行高 × 正文占比），无需 DOM 测量；
 * 精修可后续接入 useCardOverflow 做测量式回退，当前启发式保证「宁早拆不溢出」。
 */

const FONT_PX: Record<FontSizeType, number> = { sm: 14, base: 16, lg: 18, xl: 20 };
const LINE_HEIGHT = 1.85;
/** 画板高度中可用于正文的比例（其余给页眉 / 页脚 / 边距 / 块间距）。 */
const CONTENT_FRACTION = 0.6;
/** 每字宽度估计（CJK 偏多，0.55em 偏保守 → 宁少算每行字数、早拆）。 */
const CHAR_WIDTH_FACTOR = 0.55;

export interface SplitOptions {
  aspectRatio: AspectRatioType;
  fontSize: FontSizeType;
}

/** 估算一个块渲染占用的行数。 */
function blockLines(b: BlockSegment, charsPerLine: number): number {
  switch (b.type) {
    case 'h1':
      return 2.5;
    case 'h2':
      return 2.2;
    case 'h3':
      return 2.0;
    case 'hr':
      return 1.5;
    case 'math':
      return 3;
    case 'code':
      return b.rawLines.length + 2; // 代码逐行 + 内边距
    case 'table':
      return Math.max(b.rawLines.length, 2);
    case 'ul':
    case 'ol': {
      const wrap = b.rawLines.reduce(
        (s, l) => s + Math.max(1, Math.ceil(l.length / charsPerLine)),
        0
      );
      return wrap + b.rawLines.length * 0.5; // 项间距
    }
    case 'quote':
    case 'paragraph':
    default:
      return b.rawLines.reduce(
        (s, l) => s + Math.max(1, Math.ceil(l.length / charsPerLine)),
        0
      );
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
      // 优先在换行 / 句号 / 分号 / 空格处断开
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

/**
 * 将长内容拆分为多张卡片的正文片段。
 * @returns 字符串数组，每项为一张卡片的 content；至少返回 1 项。
 */
export function splitContentIntoCards(
  content: string,
  opts: SplitOptions
): string[] {
  const { width, height } = getCanvasDimensions(opts.aspectRatio);
  const fontPx = FONT_PX[opts.fontSize];
  const charsPerLine = Math.max(8, Math.floor(width / (fontPx * CHAR_WIDTH_FACTOR)));
  const linesPerCard = Math.max(
    3,
    (height * CONTENT_FRACTION) / (fontPx * LINE_HEIGHT)
  );
  const capacityChars = Math.max(40, Math.floor(linesPerCard * charsPerLine));

  const blocks = segmentBlocks(content);
  if (blocks.length === 0) return [content];

  const cards: string[] = [];
  let cur: BlockSegment[] = [];
  let curLines = 0;

  const flush = () => {
    if (cur.length) {
      cards.push(serializeBlocks(cur));
      cur = [];
      curLines = 0;
    }
  };

  for (const b of blocks) {
    const w = blockLines(b, charsPerLine);
    // 单块超整卡容量且可子拆（段落 / 引用）：按字符切分到多卡
    if (w >= linesPerCard && (b.type === 'paragraph' || b.type === 'quote')) {
      flush();
      for (const part of splitOversizedBlock(b, capacityChars)) cards.push(part);
      continue;
    }
    // 加入后超容量：先收尾当前卡，再单开
    if (cur.length && curLines + w > linesPerCard) {
      flush();
    }
    cur.push(b);
    curLines += w;
  }
  flush();

  return cards.length ? cards : [content];
}

/**
 * 估算给定画幅 + 字号下单卡可承载的字符容量（供 UI 预估 / 测试断言）。
 */
export function estimateCardCapacity(opts: SplitOptions): number {
  const { width, height } = getCanvasDimensions(opts.aspectRatio);
  const fontPx = FONT_PX[opts.fontSize];
  const charsPerLine = Math.max(8, Math.floor(width / (fontPx * CHAR_WIDTH_FACTOR)));
  const linesPerCard = Math.max(
    3,
    (height * CONTENT_FRACTION) / (fontPx * LINE_HEIGHT)
  );
  return Math.max(40, Math.floor(linesPerCard * charsPerLine));
}
