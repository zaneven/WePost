import { toPng, toJpeg, toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';
import { ExportConfig } from '@/types/card';

/**
 * 等待页面字体完全加载就绪后再执行导出，
 * 避免系统字体（Songti SC / STKaiti 等）尚未就绪时回退为默认字体，
 * 导致导出图片衬线 / 楷体样式丢失。
 */
async function ensureFontsReady(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // 字体就绪检测失败不阻断导出流程
    }
  }
}

/**
 * 等待 Shiki 代码高亮就绪：仅当卡片含代码块（已触发 highlighter 初始化）时才等待，
 * 无代码块时立即返回，避免导出前白白加载 WASM。
 */
async function ensureHighlighterReady(): Promise<void> {
  const { ensureHighlighterReady } = await import('@/lib/highlighter');
  await ensureHighlighterReady();
}

/**
 * 导出单张卡片图片并触发本地下载
 */
export async function exportCardImage(
  element: HTMLElement,
  filename: string = 'wepost-card',
  config: ExportConfig = { scale: 2, format: 'png', quality: 0.95 }
): Promise<void> {
  await ensureFontsReady();
  await ensureHighlighterReady();

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
    // 卡片大量使用系统字体（Songti SC / STKaiti / PingFang SC），
    // 这些字体无法被 html-to-image 通过 fetch 内联（受同源策略限制），
    // 关闭字体嵌入以避免导出报错或长时间挂起，渲染时由浏览器原生字体栈保证。
    skipFonts: true,
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
  await ensureFontsReady();
  await ensureHighlighterReady();

  try {
    const blob = await toBlob(element, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
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
