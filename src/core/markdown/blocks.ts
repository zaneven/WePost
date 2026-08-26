/**
 * Markdown 块级分块（保留原始行）。
 *
 * 供长文拆分等需还原原文的场景。渲染用的归一化解析（`parseBlocks`，trim + 剥离前缀）
 * 仍由 `MarkdownRenderer` 自持——其「单换行分块」语义由 8+ 测试锁定，此处不复用、
 * 刻意保留为私有副本以解耦，便于未来统一时一次性迁移、不波及已测渲染器。
 *
 * `segmentBlocks` 与 `parseBlocks` 共享同一套块检测语义（围栏 / 公式 / 表格 / 标题 /
 * 引用 / 列表 / 段落 / 单换行分块），但 `rawLines` 保留原文不归一化，便于按块边界切分后
 * 还原原始 Markdown，避免归一化导致的信息丢失。
 */

export type BlockType =
  | 'hr'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'ol'
  | 'ul'
  | 'code'
  | 'table'
  | 'math'
  | 'paragraph';

export interface BlockSegment {
  type: BlockType;
  /** 保留原始行（不 trim、不剥离标记） */
  rawLines: string[];
  /** 仅 code 块：围栏语言标识 */
  lang?: string;
}

// 识别单行所属的块类型
function detectLineType(line: string): BlockType | 'blank' {
  const t = line.trim();
  if (t.length === 0) return 'blank';
  if (/^[-*_]{3,}$/.test(t)) return 'hr';
  if (t.startsWith('# ')) return 'h1';
  if (t.startsWith('## ')) return 'h2';
  if (t.startsWith('### ')) return 'h3';
  if (t.startsWith('>')) return 'quote';
  if (/^\d+\.\s+/.test(t)) return 'ol';
  if (/^[-*•]\s+/.test(t)) return 'ul';
  return 'paragraph';
}

// 同类相邻行可合并为同一块的类型（列表 / 引用）
const MERGEABLE_BLOCKS = new Set<BlockType>(['ul', 'ol', 'quote']);

function parseTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  if (!t.includes('-') || !t.includes('|')) return false;
  const cells = parseTableRow(t);
  return cells.length > 0 && cells.every((c) => /^\s*:?-+:?\s*$/.test(c));
}

/**
 * 保留原始行的分块。与 `MarkdownRenderer.parseBlocks` 同一套检测语义，
 * 但 rawLines 保留原文。空行结束当前块；围栏 / 公式 / 表格跨多行收集到结构结束。
 */
export function segmentBlocks(content: string): BlockSegment[] {
  const lines = content.split('\n');
  const blocks: BlockSegment[] = [];
  let current: BlockSegment | null = null;

  const flush = () => {
    if (current) {
      blocks.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmedLine = raw.trim();

    // 围栏代码块
    const fenceMatch = raw.match(/^```([\w-]*)\s*$/);
    if (fenceMatch) {
      flush();
      const lang = fenceMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', rawLines: codeLines, lang });
      continue;
    }

    // 块级公式 $$...$$
    const mathOpen = raw.match(/^\$\$(.*)$/);
    if (mathOpen) {
      flush();
      const after = mathOpen[1];
      if (after.endsWith('$$')) {
        blocks.push({ type: 'math', rawLines: [after.slice(0, -2)] });
        continue;
      }
      const mathLines: string[] = [];
      if (after.trim() !== '') mathLines.push(after);
      i++;
      while (i < lines.length) {
        const cm = lines[i].match(/^(.*)\$\$\s*$/);
        if (cm) {
          if (cm[1].trim() !== '') mathLines.push(cm[1]);
          break;
        }
        if (lines[i].trim() === '$$') break;
        mathLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'math', rawLines: mathLines });
      continue;
    }

    // 表格
    if (
      trimmedLine.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      flush();
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        lines[i].includes('|')
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      i--;
      blocks.push({ type: 'table', rawLines: tableLines });
      continue;
    }

    const type = detectLineType(raw);

    if (type === 'blank') {
      flush();
      continue;
    }

    if (type === 'hr' || type === 'h1' || type === 'h2' || type === 'h3') {
      flush();
      blocks.push({ type, rawLines: [raw] });
      continue;
    }

    if (current && current.type === type && MERGEABLE_BLOCKS.has(type)) {
      current.rawLines.push(raw);
      continue;
    }

    if (current && current.type === 'paragraph' && type === 'paragraph') {
      current.rawLines.push(raw);
      continue;
    }

    flush();
    current = { type, rawLines: [raw] };
  }
  flush();
  return blocks;
}
