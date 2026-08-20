import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardData } from '@/types/card';
import { CardRenderer } from './CardRenderer';
import { TEMPLATES, getCanvasDimensions } from '@/core/templates/registry';
import { ZoomIn, ZoomOut, Maximize2, Eye } from 'lucide-react';

interface CardStageProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
}

export const CardStage: React.FC<CardStageProps> = ({ data, renderRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.75);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  const currentTemplate = TEMPLATES.find((t) => t.id === data.templateId);

  // 获取卡片逻辑宽高 (统一数据源: registry)
  const getCardDimensions = useCallback(() => {
    return getCanvasDimensions(data.aspectRatio);
  }, [data.aspectRatio]);

  // 自适应计算缩放比例
  const calculateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.75;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return 0.75;

    const { width: cardW, height: cardH } = getCardDimensions();
    // 预留边距 padding
    const paddingX = 48;
    const paddingY = 48;

    const availW = Math.max(clientWidth - paddingX, 100);
    const availH = Math.max(clientHeight - paddingY, 100);

    const scaleX = availW / cardW;
    const scaleY = availH / cardH;
    const fitScale = Math.min(scaleX, scaleY, 1.0);

    // 限制在合理视觉区间
    return Math.max(0.35, Math.min(fitScale, 1.1));
  }, [getCardDimensions]);

  // 监听容器大小变化和卡片比例变化，自动适应一屏
  useEffect(() => {
    if (!isAutoFit) return;

    const updateFit = () => {
      const fit = calculateFitZoom();
      setZoom(fit);
    };

    updateFit();

    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isAutoFit) {
        updateFit();
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [calculateFitZoom, isAutoFit, data.aspectRatio]);

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setZoom((prev) => Math.min(prev + 0.08, 1.5));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setZoom((prev) => Math.max(prev - 0.08, 0.35));
  };

  const handleResetZoom = () => {
    setIsAutoFit(false);
    setZoom(1.0);
  };

  const handleAutoFit = () => {
    setIsAutoFit(true);
    const fit = calculateFitZoom();
    setZoom(fit);
  };

  const { width: rawW, height: rawH } = getCardDimensions();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090d16] relative overflow-hidden select-none">
      {/* 顶部画板控制条 */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md px-5 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2.5 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>实时画板</span>
          </div>
          <span className="text-neutral-700">/</span>
          <span className="font-medium text-neutral-300">{currentTemplate?.name}</span>
          <span className="text-neutral-700">/</span>
          <span className="font-mono text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
            {data.aspectRatio}
          </span>
        </div>

        {/* 缩放控制器 */}
        <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-lg p-1">
          <button
            type="button"
            onClick={handleZoomOut}
            title="缩小"
            aria-label="缩小"
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="font-mono text-[11px] text-neutral-200 px-2 min-w-[44px] text-center font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="放大"
            aria-label="放大"
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <div className="w-[1px] h-3 bg-neutral-800 mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            title="100% 原始大小"
            aria-label="原始大小 100%"
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
              !isAutoFit && Math.abs(zoom - 1.0) < 0.02
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            1:1
          </button>
          <button
            type="button"
            onClick={handleAutoFit}
            title="自适应一屏显示"
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors ${
              isAutoFit
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Maximize2 className="w-3 h-3" aria-hidden="true" />
            <span>自适应一屏</span>
          </button>
        </div>
      </div>

      {/* 画板网格展示区 (自适应充满并不产生强制滚动) */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {/* 卡片容器 */}
        <div
          className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            width: `${rawW}px`,
            height: `${rawH}px`,
          }}
        >
          <CardRenderer data={data} renderRef={renderRef} />
        </div>
      </div>

      {/* 底部状态信息条 */}
      <div className="h-8 border-t border-neutral-800/80 bg-neutral-950/90 px-5 flex items-center justify-between text-[11px] text-neutral-500 font-mono z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>所见即所得 · 纯客户端秒级无损渲染</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{rawW * 2} × {rawH * 2} px (@2x)</span>
          <span>超清无损导出</span>
        </div>
      </div>
    </div>
  );
};
