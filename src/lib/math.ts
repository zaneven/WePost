import type Katex from 'katex';

/**
 * KaTeX 数学公式渲染单例。
 *
 * 设计要点：
 * - `renderToString` 同步可用，但 KaTeX 本体（~70KB gzip）按需动态导入，
 *   拆进独立 chunk，不进入首屏 bundle；卡片无数学（content 不含 `$`）时永不加载。
 * - 渲染输出取 `output: 'html'`（不含 MathML）：卡片最终导出为图片，
 *   无障碍 MathML 无意义且会污染 html-to-image 捕获的 DOM。
 * - `ensureKaTeXReady` 作为导出就绪闸门：仅当卡片含数学（已触发初始化）时才等待，
 *   无数学时立即返回。
 * - 导出 `skipFonts: true` 下 KaTeX web 字体不内联，常见数学符号（分数 / 代数 /
 *   希腊字母）以系统字体回退渲染，可接受；极端字形保真为 ROADMAP「导出稳定性」后续项。
 */

let katexInstance: typeof Katex | null = null;
let katexPromise: Promise<typeof Katex> | null = null;

/**
 * 获取单例 KaTeX。首次调用触发动态 import。
 */
export function getKatex(): Promise<typeof Katex> {
  if (!katexPromise) {
    katexPromise = import('katex').then((m) => {
      // katex 的 CJS 默认导出为渲染对象；兼容具名导出兜底
      katexInstance =
        (m as { default?: typeof Katex }).default ??
        (m as unknown as typeof Katex);
      return katexInstance;
    });
  }
  return katexPromise;
}

/**
 * 同步渲染数学公式为 HTML 字符串。
 * 未就绪（KaTeX 尚未加载）时返回 null，调用方应回退为纯文本。
 */
export function renderMathSync(expr: string, displayMode: boolean): string | null {
  if (!katexInstance) return null;
  try {
    return katexInstance.renderToString(expr, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return null;
  }
}

/**
 * 导出前就绪闸门：确保已挂载的数学公式完成渲染。
 * 若卡片不含数学（KaTeX 从未初始化），立即返回，不白白加载 chunk。
 */
export async function ensureKaTeXReady(): Promise<void> {
  if (katexPromise) {
    try {
      await katexPromise;
    } catch {
      // 渲染失败不阻断导出流程，回退为纯文本公式。
    }
  }
}
