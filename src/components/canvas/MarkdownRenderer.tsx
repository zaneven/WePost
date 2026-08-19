import React from 'react';
import { AlignType, FontSizeType } from '@/types/card';

interface MarkdownRendererProps {
  content: string;
  fontSize?: FontSizeType;
  align?: AlignType;
  accentColor?: string;
  themeStyle?: 'minimal' | 'dark' | 'vintage' | 'warm' | 'zen' | 'acid';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize = 'base',
  align = 'left',
  accentColor = '#2563eb',
  themeStyle = 'minimal',
}) => {
  // 字号映射
  const fontSizeClasses: Record<FontSizeType, string> = {
    sm: 'text-[14px] leading-[1.8]',
    base: 'text-[16px] leading-[1.85]',
    lg: 'text-[18px] leading-[1.9]',
    xl: 'text-[20px] leading-[1.95]',
  };

  // 对齐映射
  const alignClasses: Record<AlignType, string> = {
    left: 'text-left',
    center: 'text-center',
    justify: 'text-justify',
  };

  // 解析行内样式
  const renderInlineStyles = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|==.*?==)/g;
    const tokens = text.split(regex);

    tokens.forEach((token, index) => {
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

  // 分割大段落（支持单行/双行换行与块级元素提取）
  const blocks = content.split('\n\n').filter((b) => b.trim().length > 0);

  return (
    <div className={`space-y-4 ${fontSizeClasses[fontSize]} ${alignClasses[align]}`}>
      {blocks.map((block, bIndex) => {
        const trimmed = block.trim();

        // 1. 分割线 (--- 或 *** 或 ___)
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return (
            <div key={bIndex} className="my-6 py-2 flex items-center justify-center gap-3">
              <div className={`h-[1px] flex-1 ${
                themeStyle === 'dark' ? 'bg-slate-700' : themeStyle === 'acid' ? 'bg-black h-[2px]' : 'bg-neutral-300'
              }`} />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
                <span className="w-1.5 h-1.5 rotate-45 opacity-60" style={{ backgroundColor: accentColor }} />
              </div>
              <div className={`h-[1px] flex-1 ${
                themeStyle === 'dark' ? 'bg-slate-700' : themeStyle === 'acid' ? 'bg-black h-[2px]' : 'bg-neutral-300'
              }`} />
            </div>
          );
        }

        // 2. 一级标题 (# Heading 1)
        if (trimmed.startsWith('# ')) {
          const titleText = trimmed.replace(/^#\s+/, '');
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
        if (trimmed.startsWith('## ')) {
          const titleText = trimmed.replace(/^##\s+/, '');
          return (
            <h3
              key={bIndex}
              className={`text-lg md:text-xl font-bold tracking-tight my-3 flex items-center gap-2 ${
                themeStyle === 'dark' ? 'text-cyan-300' : themeStyle === 'acid' ? 'text-black font-black' : 'text-neutral-900'
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
        if (trimmed.startsWith('### ')) {
          const titleText = trimmed.replace(/^###\s+/, '');
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
        if (trimmed.startsWith('>')) {
          const quoteLines = trimmed.split('\n').map((l) => l.replace(/^>\s*/, '')).join('\n');
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
                {renderInlineStyles(quoteLines)}
              </div>
            </div>
          );
        }

        // 6. 有序列表 (1. item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
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

        // 7. 无序列表 (- item 或 * item 或 • item)
        if (/^[-*•]\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ul key={bIndex} className="space-y-2.5 pl-1 my-3">
              {items.map((item, iIndex) => {
                const cleanText = item.replace(/^[-*•]\s+/, '');
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
                      {renderInlineStyles(cleanText)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 8. 普通段落 (支持段落内部单行换行)
        const lines = trimmed.split('\n');
        return (
          <p key={bIndex} className="tracking-normal text-inherit opacity-90 break-words leading-relaxed">
            {lines.map((line, lIndex) => (
              <React.Fragment key={lIndex}>
                {renderInlineStyles(line)}
                {lIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
