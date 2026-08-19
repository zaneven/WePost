import React, { useState } from 'react';
import { CardData } from '@/types/card';
import { CardRenderer } from './CardRenderer';
import { TEMPLATES } from '@/core/templates/registry';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Smartphone, Eye } from 'lucide-react';

interface CardStageProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
}

export const CardStage: React.FC<CardStageProps> = ({ data, renderRef }) => {
  const [zoom, setZoom] = useState<number>(0.85);

  const currentTemplate = TEMPLATES.find((t) => t.id === data.templateId);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.4));
  const handleResetZoom = () => setZoom(0.85);
  const handleFitZoom = () => setZoom(0.7);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] relative overflow-hidden select-none">
      {/* 顶部画板控制条 */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200">
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span>实时画板预览</span>
          </div>
          <span className="text-neutral-600">/</span>
          <span className="font-mono text-neutral-300 font-semibold">{currentTemplate?.name}</span>
          <span className="text-neutral-600">/</span>
          <span className="font-mono text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
            {data.aspectRatio}
          </span>
        </div>

        {/* 缩放控制器 */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
          <button
            type="button"
            onClick={handleZoomOut}
            title="缩小"
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-neutral-300 px-2 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="放大"
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-neutral-800 mx-1" />
          <button
            type="button"
            onClick={handleResetZoom}
            title="重置 100%"
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFitZoom}
            title="适应屏幕"
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 画板网格展示区 */}
      <div 
        className="flex-1 overflow-auto flex items-center justify-center p-8 relative"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="transition-transform duration-150 origin-center drop-shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <CardRenderer data={data} renderRef={renderRef} />
        </div>
      </div>

      {/* 底部信息与提示 */}
      <div className="h-9 border-t border-neutral-800/80 bg-neutral-950/80 px-6 flex items-center justify-between text-[11px] text-neutral-500 font-mono z-20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>所见即所得 · 纯客户端秒级无损渲染</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{data.aspectRatio === '3:4' ? '1080 x 1440 px' : data.aspectRatio === '1:1' ? '1080 x 1080 px' : data.aspectRatio === '9:16' ? '1080 x 1920 px' : '1080 x 460 px'}</span>
          <span>PNG / JPG @2x Retina</span>
        </div>
      </div>
    </div>
  );
};
