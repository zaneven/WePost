import { toPng, toJpeg, toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ExportConfig } from '@/types/card';

/**
 * 导出单张卡片图片并触发本地下载
 */
export async function exportCardImage(
  element: HTMLElement,
  filename: string = 'wepost-card',
  config: ExportConfig = { scale: 2, format: 'png', quality: 0.95 }
): Promise<void> {
  const pixelRatio = config.scale || 2;

  const filter = (node: HTMLElement) => {
    // 过滤不需要渲染到图片里的辅助 UI
    if (node.classList && node.classList.contains('no-export')) {
      return false;
    }
    return true;
  };

  const options = {
    pixelRatio,
    quality: config.quality,
    cacheBust: true,
    filter,
  };

  let dataUrl = '';
  if (config.format === 'jpeg') {
    dataUrl = await toJpeg(element, options);
    saveAs(dataUrl, `${filename}.jpg`);
  } else {
    dataUrl = await toPng(element, options);
    saveAs(dataUrl, `${filename}.png`);
  }
}

/**
 * 将卡片复制到系统剪贴板 (PNG Blob)
 */
export async function copyCardToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const blob = await toBlob(element, {
      pixelRatio: 2,
      cacheBust: true,
    });

    if (!blob) {
      throw new Error('生成图片失败');
    }

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      throw new Error('当前浏览器不支持直接复制图片到剪贴板');
    }
  } catch (error) {
    console.error('复制图片到剪贴板失败:', error);
    throw error;
  }
}

/**
 * 批量将多张卡片打包为 ZIP 下载
 */
export async function exportMultipleCardsAsZip(
  elements: HTMLElement[],
  zipFilename: string = 'wepost-cards-batch'
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const blob = await toBlob(el, { pixelRatio: 2 });
    if (blob) {
      zip.file(`card-${String(i + 1).padStart(2, '0')}.png`, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${zipFilename}.zip`);
}
