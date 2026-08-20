import React from 'react';
import { CardData } from '@/types/card';
import { getCanvasDimensions } from '@/core/templates/registry';
import { MinimalMagazine } from '../templates/MinimalMagazine';
import { DarkGlass } from '../templates/DarkGlass';
import { VintageNews } from '../templates/VintageNews';
import { WarmMemo } from '../templates/WarmMemo';
import { ZenQuote } from '../templates/ZenQuote';
import { AcidBold } from '../templates/AcidBold';

interface CardRendererProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
}

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
      default:
        return <MinimalMagazine data={data} />;
    }
  };

  return (
    <div
      ref={renderRef}
      id="wepost-card-export-target"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="relative flex-shrink-0 transition-all duration-300 overflow-hidden"
    >
      {renderTemplate()}
    </div>
  );
};
