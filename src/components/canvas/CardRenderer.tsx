import React from 'react';
import { CardData } from '@/types/card';
import { getCanvasDimensions } from '@/core/templates/registry';
import { FONT_FAMILY_STACKS } from '@/core/fonts';
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
import { TitleCard } from './TitleCard';

interface CardRendererProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
  /** 多卡堆叠时的卡序号（0 起）。决定导出目标 id 与 data-card-index。 */
  index?: number;
  /**
   * 是否为可导出的主画板卡片（默认 true）。模板缩略图等装饰性复用传 false，
   * 不挂 data-wepost-card / 导出 id，避免被导出遍历与溢出检测误伤。
   */
  exportable?: boolean;
  /** 单页标题模式：渲染为大标题封面卡（仅首页传入） */
  cover?: boolean;
}

/** 所选字体 → CSS 字体栈（单一数据源：src/core/fonts.ts，与下拉选择器共用） */
const CARD_FONT_STACKS = FONT_FAMILY_STACKS;

export const CardRenderer: React.FC<CardRendererProps> = ({
  data,
  renderRef,
  index = 0,
  exportable = true,
  cover = false,
}) => {
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
      // 首卡保留旧 id（无头导出脚本 /export 页依赖），后续卡用带序号 id
      id={exportable ? (index === 0 ? 'wepost-card-export-target' : `wepost-card-export-target-${index}`) : undefined}
      data-wepost-card={exportable ? true : undefined}
      data-card-index={exportable ? index : undefined}
      className="wepost-card-font relative flex-shrink-0 overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        // 字体选择：经 .wepost-card-font 覆盖模板内硬编码字体（globals.css）
        '--card-font-family': CARD_FONT_STACKS[data.fontFamily],
      } as React.CSSProperties}
    >
      {cover ? <TitleCard data={data} /> : renderTemplate()}
    </div>
  );
};
