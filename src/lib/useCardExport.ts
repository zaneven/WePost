import { useState } from 'react';
import type { CardData, ExportConfig } from '@/types/card';
import { buildCardFilename } from '@/lib/filename';
import { useToast } from '@/components/ui/Toast';

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  scale: 2,
  format: 'png',
  quality: 0.95,
};

export const EXPORT_TARGET_ID = 'wepost-card-export-target';

/**
 * 卡片导出逻辑。抽离为共享 hook，供 ExportPanel（完整配置面板）
 * 与 CardStage（画板常驻快捷操作）复用，避免逻辑重复。
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
    return document.getElementById(EXPORT_TARGET_ID);
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

  return {
    config,
    setConfig,
    isExporting,
    isCopying,
    copiedSuccess,
    handleDownload,
    handleCopyClipboard,
  };
}
