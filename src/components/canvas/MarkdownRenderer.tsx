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
    sm: 'text-[15px] leading-[1.85]',
    base: 'text-[17px] leading-[1.9]',
    lg: 'text-[19px] leading-[1.95]',
    xl: 'text-[21px] leading-[2.0]',
  };

  // 对齐映射
  const alignClasses: Record<AlignType, string> = {
    left: 'text-left',
    center: 'text-center',
    justify: 'text-justify',
  };

  // 解析文本行并渲染
  const paragraphs = content.split('\n\n').filter(Boolean);

  const renderInlineStyles = (text: string): React.ReactNode => {
    // 粗体、斜体、代码、高亮
    // 我们用简易 tokenizer 处理 **加粗**, *斜体*, `代码`, ==高亮==
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|==.*?==)/g;
    const tokens = text.split(regex);

    tokens.forEach((token, index) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={index} className="font-bold tracking-tight opacity-95">
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
            className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[0.88em] bg-black/5 dark:bg-white/10 font-medium"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('==') && token.endsWith('==')) {
        parts.push(
          <mark
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-200/60 dark:bg-amber-500/25 text-inherit"
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

  return (
    <div className={`space-y-4 ${fontSizeClasses[fontSize]} ${alignClasses[align]}`}>
      {paragraphs.map((p, pIndex) => {
        const trimmed = p.trim();

        // 引用块语法 > 金句
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={pIndex}
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
                {renderInlineStyles(quoteText)}
              </div>
            </div>
          );
        }

        // 无序列表 - item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n');
          return (
            <ul key={pIndex} className="space-y-2 pl-2">
              {items.map((item, iIndex) => (
                <li key={iIndex} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="flex-1 opacity-90">
                    {renderInlineStyles(item.replace(/^[-*]\s*/, ''))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // 普通段落
        return (
          <p key={pIndex} className="tracking-normal text-inherit opacity-90 break-words leading-relaxed">
            {renderInlineStyles(p)}
          </p>
        );
      })}
    </div>
  );
};
