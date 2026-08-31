import { describe, it, expect } from 'vitest';
import {
  splitContentIntoCards,
  splitContentByDivider,
  estimateCardCapacity,
} from '@/core/split/splitContent';

// 2.35:1 画幅最矮（容量最低），便于用短内容触发拆分
const WIDE = { aspectRatio: '2.35:1' as const, fontSize: 'base' as const };
const PORTRAIT = { aspectRatio: '3:4' as const, fontSize: 'base' as const };

describe('splitContentIntoCards', () => {
  it('空内容 / 单块短内容返回单卡', () => {
    expect(splitContentIntoCards('', WIDE)).toEqual(['']);
    expect(splitContentIntoCards('一句短文。', WIDE)).toHaveLength(1);
  });

  it('多块在容量内合并为一张卡', () => {
    const cards = splitContentIntoCards('段一。\n\n段二。', WIDE);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toContain('段一');
    expect(cards[0]).toContain('段二');
  });

  it('超容量拆为多卡，块作为原子单位不跨卡', () => {
    const content = ['一', '二', '三', '四', '五', '六', '七', '八']
      .map((s) => `段落${s}`)
      .join('\n\n');
    const cards = splitContentIntoCards(content, WIDE);
    expect(cards.length).toBeGreaterThan(1);
    // 每个段落在且仅出现在一张卡里（不跨卡）
    for (const s of ['一', '二', '三', '四', '五', '六', '七', '八']) {
      const hit = cards.filter((c) => c.includes(`段落${s}`));
      expect(hit).toHaveLength(1);
    }
    // 拼接后内容无丢失
    expect(cards.join('\n\n')).toContain('段落一');
    expect(cards.join('\n\n')).toContain('段落八');
  });

  it('代码块定界符在拆分后保留', () => {
    const content = '前文段。\n\n```js\nconst x = 1;\nconst y = 2;\n```\n\n后文段。';
    const cards = splitContentIntoCards(content, WIDE);
    const joined = cards.join('\n\n');
    expect(joined).toContain('```js');
    expect(joined).toContain('const x = 1');
    expect(joined).toContain('```');
  });

  it('数学块定界符在拆分后保留', () => {
    const content = '前文段。\n\n$$\nE = mc^2\n$$\n\n后文段。';
    const cards = splitContentIntoCards(content, WIDE);
    const joined = cards.join('\n\n');
    expect(joined).toContain('$$');
    expect(joined).toContain('E = mc^2');
  });

  it('图片行独立成块：拆分时保持原子性，不与段落合并或截断', () => {
    const img = '![配图](https://example.com/a.png)';
    const content = `段落一。\n\n${img}\n\n段落二。`;
    const cards = splitContentIntoCards(content, WIDE);
    const joined = cards.join('\n\n');
    // 图片语法整行保留（不被拆断、不丢前缀）
    expect(joined).toContain(img);
  });

  it('超大单段按字符子拆为多卡且无丢失', () => {
    const long = '字'.repeat(600); // 远超 2.35:1 base 单卡字符容量
    const cards = splitContentIntoCards(long, WIDE);
    expect(cards.length).toBeGreaterThan(1);
    // 拼接（去空白）后字符无丢失
    expect(cards.join('').replace(/\s/g, '')).toBe(long);
  });

  it('竖屏画幅容量大于宽幅', () => {
    expect(estimateCardCapacity(PORTRAIT)).toBeGreaterThan(
      estimateCardCapacity(WIDE)
    );
  });

  it('大字号降低容量', () => {
    const small = estimateCardCapacity({ aspectRatio: '3:4', fontSize: 'sm' });
    const xl = estimateCardCapacity({ aspectRatio: '3:4', fontSize: 'xl' });
    expect(small).toBeGreaterThan(xl);
  });

  it('页眉页脚高的模板（低 contentFraction）单卡容量更小', () => {
    const base = { aspectRatio: '3:4' as const, fontSize: 'base' as const };
    const minimal = estimateCardCapacity({ ...base, templateId: 'minimal-magazine' });
    const zen = estimateCardCapacity({ ...base, templateId: 'zen-quote' });
    expect(zen).toBeLessThan(minimal);
  });
});

describe('splitContentByDivider', () => {
  it('无分割线时返回原内容单项数组', () => {
    expect(splitContentByDivider('第一段。\n\n第二段。')).toEqual([
      '第一段。\n\n第二段。',
    ]);
    expect(splitContentByDivider('')).toEqual(['']);
  });

  it('按 --- 分割线切分为多卡，分割线本身不保留', () => {
    const content = '第一张内容\n\n---\n\n第二张内容\n\n---\n\n第三张内容';
    const cards = splitContentByDivider(content);
    expect(cards).toEqual(['第一张内容', '第二张内容', '第三张内容']);
  });

  it('首尾与连续分割线产生的空片段被丢弃', () => {
    const content = '---\n\n内容一\n\n---\n\n---\n\n内容二\n\n---';
    expect(splitContentByDivider(content)).toEqual(['内容一', '内容二']);
  });

  it('容忍分割线两侧空白与变体写法（*** / ___）', () => {
    expect(splitContentByDivider('甲\n\n  ---  \n\n乙')).toEqual(['甲', '乙']);
    expect(splitContentByDivider('甲\n\n***\n\n乙\n\n___\n\n丙')).toEqual([
      '甲',
      '乙',
      '丙',
    ]);
  });

  it('表格分隔行 | --- | 不被误判为分割线', () => {
    const content = '| a | b |\n| --- | --- |\n| 1 | 2 |';
    expect(splitContentByDivider(content)).toEqual([content]);
  });
});
