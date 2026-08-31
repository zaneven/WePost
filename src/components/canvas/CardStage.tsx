import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardData } from '@/types/card';
import { CardRenderer } from './CardRenderer';
import { getCanvasDimensions } from '@/core/templates/registry';
import type { useCardExport } from '@/lib/useCardExport';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface CardStageProps {
  data: CardData;
  renderRef?: React.RefObject<HTMLDivElement>;
  exportState?: ExportState;
}

/** 画板平移偏移（屏幕像素，相对居中位置） */
interface Offset {
  x: number;
  y: number;
}

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.0;

export const CardStage: React.FC<CardStageProps> = ({ data, renderRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [canPan, setCanPan] = useState<boolean>(false);
  const panRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // 获取卡片逻辑宽高 (统一数据源: registry)
  const getCardDimensions = useCallback(() => {
    return getCanvasDimensions(data.aspectRatio);
  }, [data.aspectRatio]);

  // 自适应计算缩放比例：充分利用可用空间，自适应放大以填满画板
  const calculateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.85;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return 0.85;

    const { width: cardW, height: cardH } = getCardDimensions();
    // 边距保留舒适的呼吸感 (32px)
    const paddingX = 32;
    const paddingY = 32;

    const availW = Math.max(clientWidth - paddingX, 100);
    const availH = Math.max(clientHeight - paddingY, 100);

    const scaleX = availW / cardW;
    const scaleY = availH / cardH;
    // 自适应以宽度和高度中较小的一边为基准，允许大屏下自适应放大（最高 1.5 倍）
    const fitScale = Math.min(scaleX, scaleY);

    return Math.max(ZOOM_MIN, Math.min(fitScale, 1.5));
  }, [getCardDimensions]);

  // 监听容器大小变化和卡片比例变化，自动适应一屏并放大
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

  // 将偏移限制在画板缩放后的溢出范围内（内容未溢出时归零居中）
  const clampOffset = useCallback(
    (o: Offset): Offset => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const { width, height } = getCardDimensions();
      const maxX = Math.max(0, (width * zoom - el.clientWidth) / 2);
      const maxY = Math.max(0, (height * zoom - el.clientHeight) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, o.x)),
        y: Math.min(maxY, Math.max(-maxY, o.y)),
      };
    },
    [zoom, getCardDimensions]
  );

  // 缩放 / 画幅变化时收敛偏移（自适应一屏下必然归零）
  useEffect(() => {
    setOffset((prev) => clampOffset(prev));
  }, [clampOffset]);

  // 是否处于可平移状态（决定抓取光标）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = getCardDimensions();
    setCanPan(width * zoom > el.clientWidth + 1 || height * zoom > el.clientHeight + 1);
  }, [zoom, getCardDimensions, data.aspectRatio]);

  // 滚轮交互：Ctrl/Cmd+滚轮缩放（含触控板捏合），普通滚轮平移画板
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setIsAutoFit(false);
        setZoom((prev) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev - e.deltaY * 0.002)));
      } else {
        e.preventDefault();
        setOffset((prev) => clampOffset({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampOffset]);

  // 拖拽平移（指针事件，鼠标 / 触控通用）
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (!p) return;
    setOffset(
      clampOffset({
        x: p.baseX + (e.clientX - p.startX),
        y: p.baseY + (e.clientY - p.startY),
      })
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panRef.current) return;
    panRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 指针捕获已释放（如 pointercancel 后），忽略
    }
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setZoom((prev) => Math.min(prev + 0.08, ZOOM_MAX));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setZoom((prev) => Math.max(prev - 0.08, ZOOM_MIN));
  };

  const handleResetZoom = () => {
    setIsAutoFit(false);
    setZoom(1.0);
  };

  const handleAutoFit = () => {
    setIsAutoFit(true);
    const fit = calculateFitZoom();
    setZoom(fit);
    setOffset({ x: 0, y: 0 });
  };

  const { width: rawW, height: rawH } = getCardDimensions();

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 bg-[#090d16] relative overflow-hidden select-none">
      {/* 中间画板网格展示区 (占据全部可用空间，自适应放大并居中，放大后可拖拽 / 滚轮平移) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 relative ${
          isPanning ? 'cursor-grabbing' : canPan ? 'cursor-grab' : 'cursor-default'
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
          touchAction: 'none',
        }}
      >
        {/* 悬浮缩放控制器（右上角） */}
        <div
          className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-lg p-1 backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            title="缩小"
            aria-label="缩小"
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="font-mono text-[11px] text-neutral-200 px-1.5 sm:px-2 min-w-[42px] text-center font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="放大"
            aria-label="放大"
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <div className="w-[1px] h-3 bg-neutral-800 mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            title="100% 原始大小"
            aria-label="原始大小 100%"
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
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
            aria-label="自适应一屏显示"
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
              isAutoFit
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Maximize2 className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">自适应一屏</span>
          </button>
        </div>

        {/* 卡片容器（translate 为屏幕空间平移，scale 后应用；拖拽中关闭过渡保证跟手） */}
        <div
          className={`origin-center flex items-center justify-center flex-shrink-0 ${
            isPanning ? '' : 'transition-transform duration-200 ease-out'
          }`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            width: `${rawW}px`,
            height: `${rawH}px`,
          }}
        >
          <CardRenderer data={data} renderRef={renderRef} />
        </div>
      </div>
    </div>
  );
};
