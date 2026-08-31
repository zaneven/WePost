import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardData } from '@/types/card';
import { CardRenderer } from './CardRenderer';
import { getCanvasDimensions } from '@/core/templates/registry';
import { buildCardFilename } from '@/lib/filename';
import type { useCardExport } from '@/lib/useCardExport';
import { useToast } from '@/components/ui/Toast';
import { ZoomIn, ZoomOut, Maximize2, Copy, Check, Download, Loader2 } from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface CardStageProps {
  data: CardData;
  /** 拆分后的每张卡片正文（长度 = 卡片总数，至少 1 项） */
  chunks: string[];
  exportState?: ExportState;
}

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.0;
/** 多卡堆叠时卡片间的逻辑间距（px，随缩放同步） */
const CARD_GAP = 32;

export const CardStage: React.FC<CardStageProps> = ({ data, chunks, exportState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const toast = useToast();
  // 每张卡的 hover 操作状态：copying / exporting / copied（按卡序号记录）
  const [busyCard, setBusyCard] = useState<{ index: number; action: 'copy' | 'download' } | null>(null);
  const [copiedCard, setCopiedCard] = useState<number | null>(null);

  const { width: cardW, height: cardH } = getCanvasDimensions(data.aspectRatio);
  const cardCount = Math.max(1, chunks.length);

  // 自适应计算缩放比例：以卡片宽度铺满可用空间（垂直方向可滚动浏览多卡）
  const calculateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.85;
    const { clientWidth } = containerRef.current;
    if (clientWidth === 0) return 0.85;
    const availW = Math.max(clientWidth - 32, 100);
    const fitScale = availW / cardW;
    return Math.max(ZOOM_MIN, Math.min(fitScale, 1.5));
  }, [cardW]);

  // 监听容器大小变化和卡片比例 / 卡数变化，自动适应宽度
  useEffect(() => {
    if (!isAutoFit) return;
    const updateFit = () => setZoom(calculateFitZoom());
    updateFit();
    const el = containerRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(() => {
      if (isAutoFit) updateFit();
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [calculateFitZoom, isAutoFit, data.aspectRatio, cardCount]);

  // 滚轮交互：Ctrl/Cmd+滚轮缩放（含触控板捏合），普通滚轮走原生纵向滚动浏览卡组
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setIsAutoFit(false);
        setZoom((prev) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev - e.deltaY * 0.002)));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

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
    setZoom(calculateFitZoom());
  };

  // 第 i 张卡的渲染数据：正文换成对应片段；除第一张外不显示正副标题
  const buildChunkData = (chunk: string, index: number): CardData => ({
    ...data,
    content: chunk,
    ...(index > 0 ? { title: '', subtitle: '' } : {}),
  });

  const getCardElement = (index: number): HTMLElement | null =>
    document.querySelector<HTMLElement>(`[data-card-index="${index}"]`);

  // 单卡复制到剪贴板（hover 图标）
  const handleCopyCard = async (index: number) => {
    const el = getCardElement(index);
    if (!el || busyCard) return;
    setBusyCard({ index, action: 'copy' });
    try {
      const { copyCardToClipboard } = await import('@/core/export/exporter');
      await copyCardToClipboard(el);
      setCopiedCard(index);
      toast.show(`第 ${index + 1} 张卡片已复制到剪贴板`, 'success');
      setTimeout(() => setCopiedCard(null), 2000);
    } catch (err) {
      console.error('复制卡片失败:', err);
      toast.show('复制到剪贴板失败，可尝试下载图片', 'error');
    } finally {
      setBusyCard(null);
    }
  };

  // 单卡下载（hover 图标，文件名带序号）
  const handleDownloadCard = async (index: number) => {
    const el = getCardElement(index);
    if (!el || busyCard) return;
    setBusyCard({ index, action: 'download' });
    try {
      const { exportCardImage } = await import('@/core/export/exporter');
      const base = buildCardFilename(data.templateId, data.title);
      const filename = cardCount > 1 ? `${base}-${index + 1}` : base;
      await exportCardImage(el, filename, exportState?.config ?? { scale: 2, format: 'png', quality: 0.95 });
      toast.show(`第 ${index + 1} 张卡片已导出`, 'success');
    } catch (err) {
      console.error('导出卡片失败:', err);
      toast.show('导出图片失败，请重试', 'error');
    } finally {
      setBusyCard(null);
    }
  };

  // 堆叠总高（逻辑 px）：N 张卡 + 卡间距。transform 不影响布局，外层容器按缩放后尺寸撑开滚动区。
  const stackH = cardCount * cardH + (cardCount - 1) * CARD_GAP;

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 bg-[#090d16] relative overflow-hidden select-none">
      {/* 画板展示区：多卡纵向堆叠，纵向滚动浏览 */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 relative"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        <div className="min-h-full w-full flex items-start justify-center">
          {/* 缩放占位盒：按缩放后尺寸撑开滚动区；内部按逻辑尺寸布局再 scale */}
          <div
            className="relative flex-shrink-0"
            style={{ width: cardW * zoom, height: stackH * zoom }}
          >
            <div
              className="absolute left-0 top-0 flex flex-col"
              style={{
                width: cardW,
                gap: `${CARD_GAP}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              {chunks.map((chunk, i) => (
                <div key={i} className="relative group">
                  <CardRenderer data={buildChunkData(chunk, i)} index={i} />

                  {/* hover 悬浮操作：单卡复制 / 下载（导出时过滤，不入图） */}
                  <div
                    className="no-export absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-lg border border-white/10 bg-neutral-900/85 backdrop-blur-md p-1 shadow-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
                    role="group"
                    aria-label={`第 ${i + 1} 张卡片操作`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyCard(i)}
                      disabled={!!busyCard}
                      title={`复制第 ${i + 1} 张卡片图片`}
                      aria-label={`复制第 ${i + 1} 张卡片图片`}
                      className="p-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {busyCard?.index === i && busyCard.action === 'copy' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : copiedCard === i ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCard(i)}
                      disabled={!!busyCard}
                      title={`下载第 ${i + 1} 张卡片图片`}
                      aria-label={`下载第 ${i + 1} 张卡片图片`}
                      className="p-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {busyCard?.index === i && busyCard.action === 'download' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 悬浮缩放控制器（右上角，随滚动固定） */}
        <div
          className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-lg p-1 backdrop-blur-md"
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
            title="自适应宽度显示"
            aria-label="自适应宽度显示"
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
              isAutoFit
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Maximize2 className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">自适应</span>
          </button>
        </div>
      </div>
    </div>
  );
};
