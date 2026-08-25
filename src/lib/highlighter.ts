import type { Highlighter } from 'shiki';

/**
 * Shiki 语法高亮单例。
 *
 * 设计要点：
 * - 受控语言列表，避免 Shiki 全量语言包撑大产物；其余语言回退纯文本。
 * - 模块本身不含 `import 'shiki'` 顶层导入，`getHighlighter` 首次调用时才动态 import，
 *   从而把 Shiki（含 WASM）拆进独立 chunk，不进入首屏 bundle。
 * - 初始化异步（加载 WASM + 语言/主题），完成后 `codeToHtml` 同步可用。
 * - `ensureHighlighterReady` 作为导出就绪闸门：仅当卡片含代码块（已触发初始化）时才等待，
 *   无代码块时立即返回，避免导出前白白加载 WASM。
 */

// 受控语言集合：覆盖卡片/开发笔记场景的常见语言，控制产物体积。
const SUPPORTED_LANGS = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'bash',
  'shell',
  'json',
  'css',
  'html',
  'python',
  'go',
  'rust',
  'sql',
  'yaml',
  'markdown',
  'diff',
] as const;

export type HighlightTheme = 'github-dark' | 'github-light';

let highlighterPromise: Promise<Highlighter> | null = null;
let highlighter: Highlighter | null = null;

/**
 * 获取单例 highlighter。首次调用触发异步初始化。
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter } = await import('shiki');
      highlighter = await createHighlighter({
        langs: [...SUPPORTED_LANGS],
        themes: ['github-dark', 'github-light'],
      });
      return highlighter;
    })();
  }
  return highlighterPromise;
}

/**
 * 导出前就绪闸门：确保已挂载的代码块完成高亮渲染。
 * 若卡片不含代码块（highlighter 从未初始化），立即返回，不白白加载 WASM。
 */
export async function ensureHighlighterReady(): Promise<void> {
  if (highlighterPromise) {
    try {
      await highlighterPromise;
    } catch {
      // 高亮失败不阻断导出流程，回退为纯文本代码块。
    }
  }
}

/** 归一化语言别名到 Shiki 语言 id。 */
export function normalizeLang(lang: string): string {
  const l = (lang || '').toLowerCase();
  const alias: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    sh: 'bash',
    shell: 'bash',
    py: 'python',
    rb: 'ruby',
    yml: 'yaml',
    md: 'markdown',
    '': 'javascript',
  };
  return alias[l] || l;
}

/** 判断归一化后的语言是否在受控集合内（未加载则回退纯文本）。 */
export function isSupportedLang(lang: string): boolean {
  return (SUPPORTED_LANGS as readonly string[]).includes(normalizeLang(lang));
}
