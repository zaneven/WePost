import { toPng, toJpeg, toBlob, getFontEmbedCSS } from 'html-to-image';
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
 * 导出前渲染就绪闸门：等待字体、Shiki 代码高亮、KaTeX 数学公式全部就绪，
 * 保证捕获到的 DOM 含完整渲染结果。
 * - 字体：始终等待（系统衬线 / 楷体就绪）。
 * - Shiki：仅当卡片含代码块（已触发初始化）时等待，否则跳过。
 * - KaTeX：仅当卡片含数学（已触发初始化）时等待，否则跳过。
 */
async function ensureRenderReady(): Promise<void> {
  await ensureFontsReady();
  const [{ ensureHighlighterReady }, { ensureKaTeXReady }] = await Promise.all([
    import('@/lib/highlighter'),
    import('@/lib/math'),
  ]);
  await Promise.all([ensureHighlighterReady(), ensureKaTeXReady()]);
}

/**
 * 计算需嵌入导出图的 web 字体 CSS（@font-face 规则，字体文件转 data URL）。
 *
 * 仅收集节点实际用到的 @font-face 字体（如 KaTeX 的 KaTeX_Main 等），
 * 系统字体（Songti SC / STKaiti / PingFang SC）并非 @font-face 声明，不在收集范围。
 * 传入 html-to-image 的 fontEmbedCSS 后，embedWebFonts 优先使用它、不再自动收集，
 * 从而在「跳过系统字体 fetch」的同时「嵌入 KaTeX 字体」，修复公式导出字形缺失。
 * 无数学时返回 undefined，回退到 skipFonts 纯系统字体路径，不增加开销。
 * 计算失败也回退，绝不阻断导出。
 */
async function computeFontEmbedCSS(element: HTMLElement): Promise<string | undefined> {
  try {
    const css = await getFontEmbedCSS(element);
    return css || undefined;
  } catch {
    return undefined;
  }
}

/**
 * 导出单张卡片图片并触发本地下载
 */
export async function exportCardImage(
  element: HTMLElement,
  filename: string = 'wepost-card',
  config: ExportConfig = { scale: 2, format: 'png', quality: 0.95 }
): Promise<void> {
  await ensureRenderReady();

  const pixelRatio = config.scale || 2;

  const filter = (node: HTMLElement) => {
    // 过滤不需要渲染到图片里的辅助 UI
    if (node.classList && node.classList.contains('no-export')) {
      return false;
    }
    return true;
  };

  // 计算需嵌入的 web 字体 CSS（KaTeX 等）。无数学时为 undefined，回退纯系统字体路径。
  // fontEmbedCSS 优先级高于 skipFonts：传入后 html-to-image 直接嵌入该 CSS，
  // 既跳过系统字体的自动 fetch，又保证公式字形正确嵌入导出图。
  const fontEmbedCSS = await computeFontEmbedCSS(element);

  const options = {
    pixelRatio,
    quality: config.quality,
    cacheBust: true,
    filter,
    // 系统字体（Songti SC / STKaiti / PingFang SC）非 @font-face、由浏览器原生字体栈保证；
    // skipFonts 仅在 fontEmbedCSS 缺失时生效（兜底），避免任何系统字体 fetch 报错 / 挂起。
    skipFonts: true,
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
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
  await ensureRenderReady();

  try {
    const fontEmbedCSS = await computeFontEmbedCSS(element);
    const blob = await toBlob(element, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
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
