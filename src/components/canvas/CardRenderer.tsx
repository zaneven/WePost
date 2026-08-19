import React from 'react';
import { CardData } from '@/types/card';
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
  // 根据比例获取容器基础尺寸 (逻辑像素)
  const getDimensions = () => {
    switch (data.aspectRatio) {
      case '3:4':
        return { width: 540, height: 720 };
      case '1:1':
        return { width: 600, height: 600 };
      case '9:16':
        return { width: 450, height: 800 };
      case '2.35:1':
        return { width: 705, height: 300 };
      case '4:3':
        return { width: 640, height: 480 };
      default:
        return { width: 540, height: 720 };
    }
  };

  const { width, height } = getDimensions();

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
