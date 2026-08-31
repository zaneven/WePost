import { useState } from 'react';
import type { CardData, ExportConfig } from '@/types/card';
import { buildCardFilename } from '@/lib/filename';
import { useToast } from '@/components/ui/Toast';

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  scale: 2,
  format: 'png',
  quality: 0.95,
};

/**
 * 按卡序取当前渲染的所有卡片根元素（CardRenderer 挂 data-wepost-card）。
 * 多卡堆叠布局下所有卡片同时在场，可一次性遍历导出 / 拼接。
 */
const getExportElements = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-wepost-card]'));
};

/**
 * 卡片导出逻辑。抽离为共享 hook，供 ExportPanel（完整配置面板）
 * 与 CardStage（画板常驻快捷操作）复用，避免逻辑重复。
 *
 * 单卡走 handleDownload / handleCopyClipboard；多卡走 handleDownloadAll（逐张
 * 编号导出）与 handleCopyStitched（纵向拼接长图后复制）。
 *
 * 导出依赖 (html-to-image / file-saver) 按需动态加载，不进入首屏 bundle。
 */
export function useCardExport(initialConfig: ExportConfig = DEFAULT_EXPORT_CONFIG) {
  const [config, setConfig] = useState<ExportConfig>(initialConfig);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const toast = useToast();

  const getExportElement = (): HTMLElement | null => {
    return getExportElements()[0] ?? null;
  };

  const handleDownload = async (data: CardData) => {
    const el = getExportElement();
    if (!el) return;

    try {
      setIsExporting(true);
      const { exportCardImage } = await import('@/core/export/exporter');
      const filename = buildCardFilename(data.templateId, data.title);
      await exportCardImage(el, filename, config);
      toast.show(`已导出 ${config.scale}x ${config.format.toUpperCase()} 图片`, 'success');
    } catch (err) {
      console.error('下载失败:', err);
      toast.show('导出图片失败，请重试', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    const el = getExportElement();
    if (!el) return;

    try {
      setIsCopying(true);
      const { copyCardToClipboard } = await import('@/core/export/exporter');
      await copyCardToClipboard(el);
      setCopiedSuccess(true);
      toast.show('已复制到剪贴板，可直接粘贴至公众号', 'success');
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (err) {
      console.error('复制失败:', err);
      toast.show('复制到剪贴板失败，可尝试直接点击下载图片', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  /** 多卡：逐张编号导出（文件名 -1、-2 …），卡片已在 DOM 中按序排列 */
  const handleDownloadAll = async (data: CardData) => {
    const els = getExportElements();
    if (!els.length) return;

    try {
      setIsExporting(true);
      const { exportCardImage } = await import('@/core/export/exporter');
      const base = buildCardFilename(data.templateId, data.title);
      for (let i = 0; i < els.length; i++) {
        const filename = els.length > 1 ? `${base}-${i + 1}` : base;
        await exportCardImage(els[i], filename, config);
      }
      toast.show(`已导出 ${els.length} 张图片`, 'success');
    } catch (err) {
      console.error('批量导出失败:', err);
      toast.show('批量导出失败，请重试', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /** 多卡：纵向拼接为一张长图后复制到剪贴板 */
  const handleCopyStitched = async () => {
    const els = getExportElements();
    if (!els.length) return;

    try {
      setIsCopying(true);
      const { copyCardsStitched } = await import('@/core/export/exporter');
      await copyCardsStitched(els);
      setCopiedSuccess(true);
      toast.show(`已复制 ${els.length} 张卡片拼接长图`, 'success');
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (err) {
      console.error('拼接长图复制失败:', err);
      toast.show('拼接长图复制失败，可尝试逐张导出', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  return {
    config,
    setConfig,
    isExporting,
    isCopying,
    copiedSuccess,
    handleDownload,
    handleCopyClipboard,
    handleDownloadAll,
    handleCopyStitched,
  };
}
