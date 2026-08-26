import { describe, it, expect } from 'vitest';
import { recommendStyle } from '@/core/match/recommendStyle';

describe('recommendStyle 内容智能匹配', () => {
  it('含代码块 → 终端代码 + 竖屏 + 等宽', () => {
    const r = recommendStyle('说明如下：\n\n```js\nconst x = 1;\n```');
    expect(r.templateId).toBe('terminal-code');
    expect(r.aspectRatio).toBe('9:16');
    expect(r.fontFamily).toBe('mono');
  });

  it('短金句（<80 字、≤2 块、无特殊块）→ 东方留白 + 正方形', () => {
    const r = recommendStyle('山高水长，行稳致远。');
    expect(r.templateId).toBe('zen-quote');
    expect(r.aspectRatio).toBe('1:1');
    expect(r.fontFamily).toBe('serif');
  });

  it('含表格 → 复古报刊', () => {
    const r = recommendStyle('| 维度 | 值 |\n| --- | --- |\n| a | 1 |');
    expect(r.templateId).toBe('vintage-news');
    expect(r.aspectRatio).toBe('3:4');
  });

  it('态度表达（多块、非短金句）→ 酸性潮流', () => {
    const r = recommendStyle(
      '打破既定框架，做不被定义的创造者。\n\n拒绝平庸，不要等风来。\n\n永远好奇，永远折腾，态度就是底牌。'
    );
    expect(r.templateId).toBe('acid-bold');
    expect(r.fontFamily).toBe('sans');
  });

  it('东方意境（多块、非短金句）→ 水墨留白', () => {
    const r = recommendStyle(
      '落笔处，山势已成。\n\n留白是为了让风穿过纸面，让墨自己说话。\n\n急不如缓，缓中有力；静水流深，大音希声。'
    );
    expect(r.templateId).toBe('ink-wash');
    expect(r.fontFamily).toBe('serif');
  });

  it('含数学公式 → 暗黑毛玻璃', () => {
    // 块级公式（$$ 在行首）；行内 $$ 不算块级，不会被识别
    const r = recommendStyle('能量方程如下：\n\n$$\nE=mc^2\n$$\n\n描述质能等价。');
    expect(r.templateId).toBe('dark-glass');
    expect(r.fontFamily).toBe('sans');
  });

  it('超长文（>600 字）→ 极简杂志 + 竖屏长读', () => {
    const r = recommendStyle('深度长文。'.repeat(130));
    expect(r.templateId).toBe('minimal-magazine');
    expect(r.aspectRatio).toBe('9:16');
  });

  it('通用中等内容（无特殊信号）→ 极简杂志 + 3:4', () => {
    const r = recommendStyle(
      '这是一段普通的中等长度的工作记录内容，用来验证默认推荐分支的兜底逻辑，这里不含任何特殊信号词，也刻意避免触发其他分支，因此最终应当走到极简杂志的默认推荐，字数需要足够多以避开短金句的判断区间。'
    );
    expect(r.templateId).toBe('minimal-magazine');
    expect(r.aspectRatio).toBe('3:4');
  });

  it('优先级：代码块优先于表格', () => {
    const r = recommendStyle('| a | b |\n| --- | --- |\n| 1 | 2 |\n\n```js\nx\n```');
    expect(r.templateId).toBe('terminal-code');
  });

  it('空内容也能给出默认推荐', () => {
    const r = recommendStyle('');
    expect(r.templateId).toBe('minimal-magazine');
  });
});
