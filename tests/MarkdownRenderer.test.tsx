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
