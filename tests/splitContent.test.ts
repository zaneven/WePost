import { describe, it, expect } from 'vitest';
import {
  splitContentIntoCards,
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
});
