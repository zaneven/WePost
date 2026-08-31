import React from 'react';
import { CardData, FontFamilyType } from '@/types/card';
import { getCanvasDimensions } from '@/core/templates/registry';
import { MinimalMagazine } from '../templates/MinimalMagazine';
import { DarkGlass } from '../templates/DarkGlass';
import { VintageNews } from '../templates/VintageNews';
import { WarmMemo } from '../templates/WarmMemo';
import { ZenQuote } from '../templates/ZenQuote';
import { AcidBold } from '../templates/AcidBold';
import { InkWash } from '../templates/InkWash';
import { TerminalCode } from '../templates/TerminalCode';
import { EditorialBold } from '../templates/EditorialBold';
import { NeonCyber } from '../templates/NeonCyber';

interface CardRendererProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
}

/** 所选字体 → CSS 字体栈（与 tailwind.config.ts / globals.css 的字体变量保持一致） */
const CARD_FONT_STACKS: Record<FontFamilyType, string> = {
  sans: 'var(--font-sans, system-ui), -apple-system, "PingFang SC", sans-serif',
  serif: 'var(--font-serif, "Songti SC"), SimSun, serif',
  mono: 'var(--font-mono, Menlo), Monaco, Consolas, monospace',
  kaiti: '"STKaiti", "KaiTi", "楷体", "Noto Serif SC", "Songti SC", serif',
};

export const CardRenderer: React.FC<CardRendererProps> = ({ data, renderRef }) => {
  // 根据比例获取容器基础尺寸 (逻辑像素，统一数据源: registry)
  const { width, height } = getCanvasDimensions(data.aspectRatio);

  const renderTemplate = () => {
    switch (data.templateId) {
      case 'minimal-magazine':
        return <MinimalMagazine data={data} />;
      case 'dark-glass':
        return <DarkGlass data={data} />;
      case 'vintage-news':
        return <VintageNews data={data} />;
      case 'warm-memo':
        return <WarmMemo data={data} />;
      case 'zen-quote':
        return <ZenQuote data={data} />;
      case 'acid-bold':
        return <AcidBold data={data} />;
      case 'ink-wash':
        return <InkWash data={data} />;
      case 'terminal-code':
        return <TerminalCode data={data} />;
      case 'editorial-bold':
        return <EditorialBold data={data} />;
      case 'neon-cyber':
        return <NeonCyber data={data} />;
      default:
        return <MinimalMagazine data={data} />;
    }
  };

  return (
    <div
      ref={renderRef}
      id="wepost-card-export-target"
      className="wepost-card-font relative flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        // 字体选择：经 .wepost-card-font 覆盖模板内硬编码字体（globals.css）
        '--card-font-family': CARD_FONT_STACKS[data.fontFamily],
      } as React.CSSProperties}
    >
      {renderTemplate()}
    </div>
  );
};
