import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/canvas/MarkdownRenderer';

// 屏蔽 Shiki 真实初始化（避免在 jsdom 中加载 WASM），仅测试解析与同步回退路径。
// 高亮器的真实集成由构建与浏览器联调验证。
vi.mock('@/lib/highlighter', () => ({
  getHighlighter: () => new Promise(() => {}), // 永不 resolve → 保持同步回退
  normalizeLang: (l: string) => l || 'javascript',
  isSupportedLang: () => true,
}));

// 屏蔽 KaTeX 真实加载，仅测试解析与同步回退路径（公式源码回退）。
vi.mock('@/lib/math', () => ({
  getKatex: () => new Promise(() => {}), // 永不 resolve → 保持同步回退
  renderMathSync: () => null,
  ensureKaTeXReady: () => Promise.resolve(),
}));

const renderContent = (content: string) =>
  render(
    <MarkdownRenderer content={content} themeStyle="minimal" accentColor="#000000" />
  ).container;

describe('MarkdownRenderer 分块解析', () => {
  it('【核心修复】标题与正文之间仅单换行：各自独立成块，正文不被吞入标题', () => {
    const c = renderContent('## 标题\n正文内容');
    expect(c.querySelectorAll('h3')).toHaveLength(1);
    expect(c.querySelectorAll('p')).toHaveLength(1);
    expect(c.querySelector('h3')?.textContent).toBe('标题');
    expect(c.querySelector('p')?.textContent).toBe('正文内容');
  });

  it('【核心修复】无序列表与正文之间仅单换行：列表收尾后正文独立成段', () => {
    const c = renderContent('- 项目一\n- 项目二\n这是正文');
    expect(c.querySelectorAll('ul')).toHaveLength(1);
    expect(c.querySelectorAll('li')).toHaveLength(2);
    expect(c.querySelectorAll('p')).toHaveLength(1);
    expect(c.querySelector('p')?.textContent).toBe('这是正文');
  });

  it('【核心修复】有序列表与正文之间仅单换行', () => {
    const c = renderContent('1. 第一\n2. 第二\n正文收尾');
    expect(c.querySelectorAll('ol')).toHaveLength(1);
    expect(c.querySelectorAll('ol li')).toHaveLength(2);
    expect(c.querySelectorAll('p')).toHaveLength(1);
  });

  it('【核心修复】标题 + 列表 + 引用 紧邻（全程单换行）各自成块', () => {
    const c = renderContent('## 小节\n- 项\n> 金句');
    expect(c.querySelectorAll('h3')).toHaveLength(1);
    expect(c.querySelectorAll('ul')).toHaveLength(1);
    expect(c.textContent).toContain('小节');
    expect(c.textContent).toContain('项');
    expect(c.textContent).toContain('金句');
  });

  it('连续同类列表行合并为同一列表（不拆散）', () => {
    const c = renderContent('- a\n- b\n- c');
    expect(c.querySelectorAll('ul')).toHaveLength(1);
    expect(c.querySelectorAll('li')).toHaveLength(3);
  });

  it('段落内部单换行保持为软换行（同一段、含 <br>）', () => {
    const c = renderContent('第一行\n第二行');
    expect(c.querySelectorAll('p')).toHaveLength(1);
    expect(c.querySelectorAll('p br')).toHaveLength(1);
  });

  it('空行分隔仍正常分段（不退化）', () => {
    const c = renderContent('段落一\n\n段落二');
    expect(c.querySelectorAll('p')).toHaveLength(2);
  });

  it('引用块多行各自换行渲染', () => {
    const c = renderContent('> 第一句\n> 第二句');
    expect(c.textContent).toContain('第一句');
    expect(c.textContent).toContain('第二句');
    expect(c.querySelectorAll('br')).toHaveLength(1);
  });
});

describe('MarkdownRenderer 围栏代码块', () => {
  it('```lang 代码块渲染为 <pre> 并保留全部代码文本（同步回退路径）', () => {
    const c = renderContent('```js\nconst x = 1;\nconsole.log(x);\n```');
    const pre = c.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain('const x = 1');
    expect(pre?.textContent).toContain('console.log(x)');
  });

  it('代码块与紧邻正文各自成块（单换行分块仍成立）', () => {
    const c = renderContent('前面正文\n```js\nconst y = 2;\n```\n后面正文');
    expect(c.querySelectorAll('p')).toHaveLength(2);
    expect(c.querySelector('pre')?.textContent).toContain('const y = 2');
  });

  it('未闭合代码块到文末仍作为代码块渲染', () => {
    const c = renderContent('```ts\nconst z = 3;');
    expect(c.querySelector('pre')?.textContent).toContain('const z = 3');
  });
});

describe('MarkdownRenderer 任务列表', () => {
  it('- [ ] / - [x] 渲染为复选框，仅已完成项含对勾 svg', () => {
    const c = renderContent('- [ ] 未完成\n- [x] 已完成');
    expect(c.querySelectorAll('li')).toHaveLength(2);
    expect(c.querySelectorAll('svg')).toHaveLength(1);
    expect(c.textContent).toContain('未完成');
    expect(c.textContent).toContain('已完成');
  });

  it('普通无序列表不触发任务列表（无复选框 svg）', () => {
    const c = renderContent('- 普通项一\n- 普通项二');
    expect(c.querySelectorAll('li')).toHaveLength(2);
    expect(c.querySelectorAll('svg')).toHaveLength(0);
    expect(c.querySelectorAll('ul')).toHaveLength(1);
  });
});

describe('MarkdownRenderer 表格', () => {
  it('标准表格渲染 thead + tbody，保留全部单元格文本', () => {
    const c = renderContent('| 名称 | 类型 |\n| --- | --- |\n| 卡片 | 渲染 |\n| 导出 | 图片 |');
    expect(c.querySelectorAll('table')).toHaveLength(1);
    expect(c.querySelectorAll('thead tr')).toHaveLength(1);
    expect(c.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(c.querySelectorAll('th')).toHaveLength(2);
    expect(c.querySelectorAll('td')).toHaveLength(4);
    expect(c.textContent).toContain('名称');
    expect(c.textContent).toContain('渲染');
    expect(c.textContent).toContain('图片');
  });

  it('表格与紧邻正文各自成块（单换行分块仍成立）', () => {
    const c = renderContent('前文\n| A | B |\n| --- | --- |\n| 1 | 2 |\n后文');
    expect(c.querySelectorAll('p')).toHaveLength(2);
    expect(c.querySelectorAll('table')).toHaveLength(1);
    expect(c.textContent).toContain('前文');
    expect(c.textContent).toContain('后文');
  });

  it('分隔行冒号决定列对齐 class（左 / 中 / 右）', () => {
    const c = renderContent('| L | C | R |\n| :--- | :---: | ---: |');
    const ths = c.querySelectorAll('th');
    expect(ths[0].className).toContain('text-left');
    expect(ths[1].className).toContain('text-center');
    expect(ths[2].className).toContain('text-right');
  });
});

describe('MarkdownRenderer 嵌套引用', () => {
  it('>> 渲染为嵌套子引用，外层与内层文本均保留', () => {
    const c = renderContent('> 外层\n>> 内层\n> 外层2');
    expect(c.textContent).toContain('外层');
    expect(c.textContent).toContain('内层');
    expect(c.textContent).toContain('外层2');
    // 嵌套子引用含左边线 border-l-2（外层为 border-l-4，互不混淆）
    expect(c.innerHTML).toContain('border-l-2');
  });

  it('单层引用仍是单块、内部软换行（不误判为嵌套）', () => {
    const c = renderContent('> 第一句\n> 第二句');
    expect(c.querySelectorAll('br')).toHaveLength(1);
    expect(c.innerHTML).not.toContain('border-l-2');
  });
});

describe('MarkdownRenderer 数学公式', () => {
  it('块级 $$expr$$ 渲染为公式块（与紧邻正文各自成块）', () => {
    const c = renderContent('前文\n$$E=mc^2$$\n后文');
    expect(c.textContent).toContain('E=mc^2');
    expect(c.querySelectorAll('p')).toHaveLength(2);
    // 公式块居中（回退时仍居中显示 latex 源码）
    expect(c.innerHTML).toContain('text-center');
  });

  it('多行 $$ ... $$ 块级公式收集到闭合行为止', () => {
    const c = renderContent('$$\n\\int_0^1 x^2 dx\n$$');
    expect(c.textContent).toContain('\\int_0^1 x^2 dx');
    expect(c.innerHTML).toContain('text-center');
  });

  it('行内 $expr$ 渲染为公式（回退显示 latex 源码）', () => {
    const c = renderContent('当 $a^2 + b^2 = c^2$ 时');
    expect(c.textContent).toContain('a^2 + b^2 = c^2');
    expect(c.querySelector('code')?.textContent).toContain('a^2 + b^2 = c^2');
  });

  it('单个 $（货币）不误判为数学公式', () => {
    const c = renderContent('价格 $5 与 $10');
    expect(c.textContent).toContain('$5');
    expect(c.textContent).toContain('$10');
    expect(c.querySelector('code')).toBeNull();
  });
});

describe('MarkdownRenderer 图片语法', () => {
  it('独立成行的 ![alt](url) 渲染为块级图片（与紧邻正文各自成块）', () => {
    const c = renderContent('正文一\n![配图](https://example.com/a.png)\n正文二');
    const imgs = c.querySelectorAll('figure img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('src')).toBe('https://example.com/a.png');
    expect(imgs[0].getAttribute('alt')).toBe('配图');
    expect(c.querySelectorAll('p')).toHaveLength(2);
  });

  it('行内图片随文字渲染为 inline img', () => {
    const c = renderContent('开头 ![小图](https://example.com/s.png) 结尾');
    expect(c.querySelectorAll('img')).toHaveLength(1);
    expect(c.querySelector('p')?.textContent).toContain('开头');
  });

  it('data: 与 javascript: 协议的图片 src 被拒绝（回退纯文本）', () => {
    const c = renderContent('![x](data:image/png;base64,AAAA)\n![y](javascript:alert(1))');
    expect(c.querySelector('img')).toBeNull();
    expect(c.textContent).toContain('data:image/png');
  });

  it('无图片语法的文本不受影响', () => {
    const c = renderContent('普通段落，含感叹号! 与方括号 [x] 但不是图片');
    expect(c.querySelector('img')).toBeNull();
  });
});
