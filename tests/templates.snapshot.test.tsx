import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { CardRenderer } from '@/components/canvas/CardRenderer';
import type { CardData, TemplateId } from '@/types/card';

// 屏蔽 Shiki / KaTeX 真实异步加载，令代码块/公式走确定性纯文本回退，
// 保证快照稳定（真实渲染由构建与浏览器联调验证）。
vi.mock('@/lib/highlighter', () => ({
  getHighlighter: () => new Promise(() => {}),
  normalizeLang: (l: string) => l || 'javascript',
  isSupportedLang: () => true,
}));
vi.mock('@/lib/math', () => ({
  getKatex: () => new Promise(() => {}),
  renderMathSync: () => null,
  ensureKaTeXReady: () => Promise.resolve(),
}));

// 覆盖全部块类型的样本内容：段落 / 列表 / 引用 / 表格 / 围栏代码 / 行内+块级公式。
const SAMPLE_CONTENT = `正文段落一，含 **加粗** 与 \`code\` 行内代码。

- 无序项一
- 无序项二

1. 有序项
2. 有序项

| 名称 | 类型 |
| --- | --- |
| 卡片 | 渲染 |
| 导出 | 图片 |

> 引用块文本

\`\`\`js
const x = 1;
\`\`\`

块级公式：

$$E=mc^2$$

行内 $a^2 + b^2 = c^2$ 公式。`;

const baseData: CardData = {
  title: '快照标题',
  subtitle: 'SUBTITLE / 副标题',
  tag: 'TAG',
  content: SAMPLE_CONTENT,
  author: '野生宝藏箱',
  date: '2026.08.25',
  footerText: 'FOOTER 标语',
  templateId: 'minimal-magazine',
  aspectRatio: '3:4',
  fontSize: 'base',
  align: 'left',
  fontFamily: 'serif',
  showWatermark: true,
  watermarkText: 'WEPOST',
};

const TEMPLATES: TemplateId[] = [
  'minimal-magazine',
  'dark-glass',
  'vintage-news',
  'warm-memo',
  'zen-quote',
  'acid-bold',
  'ink-wash',
  'terminal-code',
  'editorial-bold',
  'neon-cyber',
];

describe('模板视觉结构快照（结构回归守卫）', () => {
  for (const id of TEMPLATES) {
    it(`${id} 渲染结构稳定`, () => {
      const { container } = render(
        <CardRenderer data={{ ...baseData, templateId: id }} />
      );
      // 快照覆盖完整渲染结构（含 Tailwind class、块级元素布局）。
      // 任何刻意的样式/结构调整须配套更新快照（vitest -u）。
      expect(container.innerHTML).toMatchSnapshot();
    });
  }
});
