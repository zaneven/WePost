import React, { useMemo, useState, useEffect } from 'react';
import { AlignType, FontSizeType } from '@/types/card';
import { getHighlighter, normalizeLang, isSupportedLang } from '@/lib/highlighter';

interface MarkdownRendererProps {
  content: string;
  fontSize?: FontSizeType;
  align?: AlignType;
  accentColor?: string;
  themeStyle?: 'minimal' | 'dark' | 'vintage' | 'warm' | 'zen' | 'acid';
}

// 块类型：每一行会被归类为下列之一
type BlockType =
  | 'hr'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'ol'
  | 'ul'
  | 'code'
  | 'paragraph';

interface ParsedBlock {
  type: BlockType;
  /** 已逐行 trim 的有效行（code 块保留原始行，不 trim） */
  lines: string[];
  /** 仅 code 块使用：围栏语言标识（如 js / ts / bash） */
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

/**
 * 将 Markdown 文本逐行扫描并按块类型聚合。
 *
 * 与原先的 `content.split('\n\n')` 不同，本解析器在「不同格式之间只需单换行即可正确分块」——
 * 例如「## 标题」紧跟一行「正文」即可分别渲染为标题块与段落块，无需中间再空一行。
 * 列表 / 引用的连续同类行仍会合并为同一块，段落内部的单行换行也仍按软换行处理。
 *
 * 围栏代码块（```lang ... ```）跨越多行，遇到开栏时进入收集态，直到闭栏为止。
 */
function parseBlocks(content: string): ParsedBlock[] {
  const lines = content.split('\n');
  const blocks: ParsedBlock[] = [];
  let current: ParsedBlock | null = null;

  const flush = () => {
    if (current) {
      blocks.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmedLine = raw.trim();

    // 围栏代码块：```lang ... ```（整行仅为围栏时触发）
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
      // i 指向闭合 ``` 或越界；for 的 i++ 会越过闭合行
      blocks.push({ type: 'code', lines: codeLines, lang });
      continue;
    }

    const type = detectLineType(raw);

    // 空行：结束当前块
    if (type === 'blank') {
      flush();
      continue;
    }

    // 独立块：标题与分割线始终自成一块
    if (type === 'hr' || type === 'h1' || type === 'h2' || type === 'h3') {
      flush();
      blocks.push({ type, lines: [trimmedLine] });
      continue;
    }

    // 可合并块（列表 / 引用）：同类相邻行并入当前块
    if (current && current.type === type && MERGEABLE_BLOCKS.has(type)) {
      current.lines.push(trimmedLine);
      continue;
    }

    // 段落：连续普通行合并（段落内部单行换行）
    if (current && current.type === 'paragraph' && type === 'paragraph') {
      current.lines.push(trimmedLine);
      continue;
    }

    // 类型切换：结束当前块并开启新块
    flush();
    current = { type, lines: [trimmedLine] };
  }
  flush();
  return blocks;
}

// 字号映射 (常量，避免随组件重渲染重建)
const FONT_SIZE_CLASSES: Record<FontSizeType, string> = {
  sm: 'text-[14px] leading-[1.8]',
  base: 'text-[16px] leading-[1.85]',
  lg: 'text-[18px] leading-[1.9]',
  xl: 'text-[20px] leading-[1.95]',
};

// 对齐映射
const ALIGN_CLASSES: Record<AlignType, string> = {
  left: 'text-left',
  center: 'text-center',
  justify: 'text-justify',
};

interface CodeBlockProps {
  code: string;
  lang: string;
  themeStyle: 'minimal' | 'dark' | 'vintage' | 'warm' | 'zen' | 'acid';
}

/**
 * 围栏代码块：Shiki 异步高亮 + 纯文本回退。
 *
 * 首次渲染返回纯文本 <pre>（同步可用，不阻塞首屏与导出），Shiki 就绪后异步替换为高亮 HTML。
 * 导出管线 (exporter) 会在捕获前 await ensureHighlighterReady()，保证导出图含高亮版本。
 * Shiki 输出为内联 style 的 <span>，html-to-image 可正常捕获；此处覆盖其背景为透明，
 * 由模板容器提供底色，仅取其 token 配色。
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ code, lang, themeStyle }) => {
  const [html, setHtml] = useState<string | null>(null);
  const isDark = themeStyle === 'dark';

  useEffect(() => {
    let cancelled = false;
    const normalized = normalizeLang(lang);
    if (!isSupportedLang(normalized)) {
      // 不在受控语言集合：直接保持纯文本回退，不触发 Shiki 加载
      return;
    }
    (async () => {
      try {
        const hl = await getHighlighter();
        if (cancelled) return;
        const out = hl.codeToHtml(code, {
          lang: normalized,
          theme: isDark ? 'github-dark' : 'github-light',
        });
        if (!cancelled) setHtml(out);
      } catch {
        // 高亮失败：保持纯文本回退
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, lang, isDark]);

  const wrapperClass = `my-4 rounded-lg overflow-hidden ${
    isDark
      ? 'bg-[#0d1117] border border-[#1f2630]'
      : 'bg-neutral-50 border border-neutral-200'
  } [&_.shiki]:!bg-transparent [&_.shiki]:!m-0 [&_.shiki]:!p-4 [&_.shiki]:overflow-x-auto [&_.shiki]:text-[13px] [&_.shiki]:leading-[1.6] [&_.shiki]:font-mono`;

  if (html) {
    return <div className={wrapperClass} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div className={wrapperClass}>
      <pre className="!m-0 !p-4 overflow-x-auto text-[13px] leading-[1.6] font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(
  ({
    content,
    fontSize = 'base',
    align = 'left',
    accentColor = '#2563eb',
    themeStyle = 'minimal',
  }) => {
    // 缓存解析结果：仅在 content / accentColor / themeStyle 变化时重新解析，
    // 避免每次按键都对全文做 split + 正则匹配。
    const renderedBlocks = useMemo(() => {
      // 解析行内样式 (定义在 useMemo 内部，避免成为外部依赖)
      const renderInlineStyles = (text: string): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|==.*?==)/g;
        const tokens = text.split(regex);

        tokens.forEach((token, index) => {
          if (!token) return;
          if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
              <strong key={index} className="font-bold tracking-tight opacity-100 text-inherit">
                {token.slice(2, -2)}
              </strong>
            );
          } else if (token.startsWith('*') && token.endsWith('*')) {
            parts.push(
              <em key={index} className="italic opacity-90">
                {token.slice(1, -1)}
              </em>
            );
          } else if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(
              <code
                key={index}
                className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-[0.88em] font-medium ${
                  themeStyle === 'dark'
                    ? 'bg-white/10 text-cyan-300'
                    : themeStyle === 'acid'
                    ? 'bg-black text-white'
                    : 'bg-black/5 text-neutral-800'
                }`}
              >
                {token.slice(1, -1)}
              </code>
            );
          } else if (token.startsWith('==') && token.endsWith('==')) {
            parts.push(
              <mark
                key={index}
                className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-300/60 dark:bg-amber-500/30 text-inherit font-medium"
              >
                {token.slice(2, -2)}
              </mark>
            );
          } else {
            parts.push(token);
          }
        });

        return parts;
      };

      const blocks = parseBlocks(content);

      return blocks.map((block, bIndex) => {
        switch (block.type) {
          // 1. 分割线 (--- 或 *** 或 ___)
          case 'hr':
            return (
              <div key={bIndex} className="my-6 py-2 flex items-center justify-center gap-3">
                <div
                  className={`h-[1px] flex-1 ${
                    themeStyle === 'dark'
                      ? 'bg-slate-700'
                      : themeStyle === 'acid'
                      ? 'bg-black h-[2px]'
                      : 'bg-neutral-300'
                  }`}
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
                  <span
                    className="w-1.5 h-1.5 rotate-45 opacity-60"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div
                  className={`h-[1px] flex-1 ${
                    themeStyle === 'dark'
                      ? 'bg-slate-700'
                      : themeStyle === 'acid'
                      ? 'bg-black h-[2px]'
                      : 'bg-neutral-300'
                  }`}
                />
              </div>
            );

          // 2. 一级标题 (# Heading 1)
          case 'h1': {
            const titleText = block.lines[0].replace(/^#\s+/, '');
            return (
              <h2
                key={bIndex}
                className={`text-xl md:text-2xl font-bold tracking-tight my-4 pt-2 border-b pb-2 ${
                  themeStyle === 'dark'
                    ? 'text-white border-slate-800'
                    : themeStyle === 'acid'
                    ? 'text-black border-black border-b-2 font-black'
                    : 'text-neutral-900 border-neutral-200'
                }`}
              >
                {renderInlineStyles(titleText)}
              </h2>
            );
          }

          // 3. 二级标题 (## Heading 2)
          case 'h2': {
            const titleText = block.lines[0].replace(/^##\s+/, '');
            return (
              <h3
                key={bIndex}
                className={`text-lg md:text-xl font-bold tracking-tight my-3 flex items-center gap-2 ${
                  themeStyle === 'dark'
                    ? 'text-cyan-300'
                    : themeStyle === 'acid'
                    ? 'text-black font-black'
                    : 'text-neutral-900'
                }`}
              >
                <span
                  className="w-1 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <span>{renderInlineStyles(titleText)}</span>
              </h3>
            );
          }

          // 4. 三级标题 (### Heading 3)
          case 'h3': {
            const titleText = block.lines[0].replace(/^###\s+/, '');
            return (
              <h4
                key={bIndex}
                className="text-base md:text-lg font-semibold tracking-normal my-2.5 opacity-95 text-inherit"
              >
                {renderInlineStyles(titleText)}
              </h4>
            );
          }

          // 5. 引用块 (> Quote)
          case 'quote': {
            // 去除每行的 > 前缀，保留多行换行
            const quoteLines = block.lines.map((l) => l.replace(/^>\s*/, ''));
            return (
              <div
                key={bIndex}
                className={`my-5 py-3 px-5 rounded-r-lg relative transition-all ${
                  themeStyle === 'dark'
                    ? 'bg-white/5 border-l-4'
                    : themeStyle === 'vintage'
                    ? 'bg-amber-900/5 border-l-4 italic'
                    : themeStyle === 'warm'
                    ? 'bg-amber-500/10 border-l-4 rounded-lg'
                    : themeStyle === 'acid'
                    ? 'bg-black text-white border-2 border-black font-bold p-4'
                    : themeStyle === 'zen'
                    ? 'bg-transparent border-l-2 py-4 italic text-neutral-800'
                    : 'bg-neutral-100/70 border-l-4'
                }`}
                style={{
                  borderColor: themeStyle === 'acid' ? '#000000' : accentColor,
                }}
              >
                <div className="tracking-wide font-medium leading-relaxed opacity-95">
                  {quoteLines.map((line, lIndex) => (
                    <React.Fragment key={lIndex}>
                      {renderInlineStyles(line)}
                      {lIndex < quoteLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          }

          // 6. 有序列表 (1. item)
          case 'ol': {
            const items = block.lines;
            return (
              <ol key={bIndex} className="space-y-2 pl-1 my-3">
                {items.map((item, iIndex) => {
                  const match = item.match(/^(\d+)\.\s+(.*)/);
                  const num = match ? match[1] : `${iIndex + 1}`;
                  const text = match ? match[2] : item;
                  return (
                    <li key={iIndex} className="flex items-start gap-2.5">
                      {/* 数字角标高度与行高精准锁定 */}
                      <span className="inline-flex items-center justify-center w-5 h-[1.85em] flex-shrink-0">
                        <span
                          className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${accentColor}18`,
                            color: accentColor,
                          }}
                        >
                          {num.padStart(2, '0')}
                        </span>
                      </span>
                      <span className="flex-1 opacity-90 leading-relaxed">
                        {renderInlineStyles(text)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            );
          }

          // 7. 无序列表 (- item 或 * item 或 • item)，支持任务列表 (- [ ] / - [x])
          case 'ul': {
            const items = block.lines;
            // 首项去符号后是否为任务标记，决定整列表是否按任务列表渲染
            const strippedFirst = items[0].replace(/^[-*•]\s+/, '');
            const isTaskList = /^\[[ xX]\]\s+/.test(strippedFirst);
            return (
              <ul key={bIndex} className="space-y-2.5 pl-1 my-3">
                {items.map((item, iIndex) => {
                  const stripped = item.replace(/^[-*•]\s+/, '');
                  const taskMatch = isTaskList
                    ? stripped.match(/^\[([ xX])\]\s+(.*)/)
                    : null;
                  if (taskMatch) {
                    const checked = taskMatch[1].toLowerCase() === 'x';
                    const text = taskMatch[2];
                    return (
                      <li key={iIndex} className="flex items-start gap-2.5">
                        <span className="inline-flex items-center justify-center w-4 h-[1.85em] flex-shrink-0">
                          <span
                            className={`w-3.5 h-3.5 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0 ${
                              checked ? '' : 'bg-transparent'
                            }`}
                            style={{
                              backgroundColor: checked ? accentColor : 'transparent',
                              borderColor: accentColor,
                            }}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 16 16"
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 8.5l3.5 3.5L13 4.5" />
                              </svg>
                            )}
                          </span>
                        </span>
                        <span className="flex-1 opacity-90 leading-relaxed">
                          {renderInlineStyles(text)}
                        </span>
                      </li>
                    );
                  }
                  // 普通无序列表项（含任务列表中混入的非任务行）
                  return (
                    <li key={iIndex} className="flex items-start gap-2.5">
                      {/* 符号容器高度等于首行文字行高 (1.85em)，子元素水平垂直绝对居中 */}
                      <span className="inline-flex items-center justify-center w-4 h-[1.85em] flex-shrink-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                      </span>
                      <span className="flex-1 opacity-90 leading-relaxed">
                        {renderInlineStyles(stripped)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          // 8. 围栏代码块 (```lang ... ```)
          case 'code':
            return (
              <CodeBlock
                key={bIndex}
                code={block.lines.join('\n')}
                lang={block.lang || ''}
                themeStyle={themeStyle}
              />
            );

          // 9. 普通段落 (支持段落内部单行换行)
          default: {
            const lines = block.lines;
            return (
              <p
                key={bIndex}
                className="tracking-normal text-inherit opacity-90 break-words leading-relaxed"
              >
                {lines.map((line, lIndex) => (
                  <React.Fragment key={lIndex}>
                    {renderInlineStyles(line)}
                    {lIndex < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
          }
        }
      });
    }, [content, accentColor, themeStyle]);

    return (
      <div className={`space-y-4 ${FONT_SIZE_CLASSES[fontSize]} ${ALIGN_CLASSES[align]}`}>
        {renderedBlocks}
      </div>
    );
  }
);

MarkdownRenderer.displayName = 'MarkdownRenderer';
