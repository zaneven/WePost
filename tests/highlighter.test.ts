import { describe, it, expect } from 'vitest';
import {
  normalizeLang,
  isSupportedLang,
  ensureHighlighterReady,
} from '@/lib/highlighter';

describe('highlighter 纯函数', () => {
  it('normalizeLang 归一化常见别名（大小写不敏感）', () => {
    expect(normalizeLang('js')).toBe('javascript');
    expect(normalizeLang('TS')).toBe('typescript');
    expect(normalizeLang('sh')).toBe('bash');
    expect(normalizeLang('shell')).toBe('bash');
    expect(normalizeLang('py')).toBe('python');
    expect(normalizeLang('yml')).toBe('yaml');
    expect(normalizeLang('')).toBe('javascript');
    expect(normalizeLang('python')).toBe('python');
  });

  it('isSupportedLang 判断是否在受控语言集合', () => {
    expect(isSupportedLang('typescript')).toBe(true);
    expect(isSupportedLang('js')).toBe(true); // 归一化后命中 javascript
    expect(isSupportedLang('bash')).toBe(true);
    expect(isSupportedLang('ocaml')).toBe(false);
    expect(isSupportedLang('')).toBe(true); // 回退 javascript，属受控集合
  });

  it('ensureHighlighterReady 在未初始化时立即返回（不加载 WASM）', async () => {
    // 本测试文件未调用 getHighlighter，highlighterPromise 为 null → 立即 resolve
    await expect(ensureHighlighterReady()).resolves.toBeUndefined();
  });
});
