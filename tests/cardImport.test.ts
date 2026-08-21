import { describe, it, expect } from 'vitest';
import { decodeCardDataFromHash } from '@/lib/cardImport';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import type { CardData } from '@/types/card';

// 构造一个标准 base64url（Node 运行时提供 Buffer，仅用于测试数据生成）
const encode = (data: Partial<CardData>) =>
  Buffer.from(JSON.stringify({ ...INITIAL_CARD_DATA, ...data }), 'utf8').toString('base64url');

describe('decodeCardDataFromHash', () => {
  it('无 hash 或格式不匹配时返回 null', () => {
    expect(decodeCardDataFromHash('')).toBeNull();
    expect(decodeCardDataFromHash('#other=xxx')).toBeNull();
    expect(decodeCardDataFromHash('card=xxx')).toBeNull();
  });

  it('损坏的 base64 / JSON 返回 null，不抛异常', () => {
    expect(decodeCardDataFromHash('#card=!!!不是合法base64!!!')).toBeNull();
    expect(decodeCardDataFromHash('#card=eyJub3Rqc29uIjF9')).toBeNull();
  });

  it('能完整还原中文内容（UTF-8 安全，不乱码）', () => {
    const data: Partial<CardData> = {
      title: '在喧嚣的时代，重塑深度思考的秩序',
      content: '真正的专注，是在干扰中守住内心的秩序。\n\n> 所谓卓越，就是把平凡的事雕琢到发光。',
      author: '野生宝藏箱',
    };
    const decoded = decodeCardDataFromHash(`#card=${encode(data)}`);
    expect(decoded).not.toBeNull();
    expect(decoded!.title).toBe(data.title);
    expect(decoded!.content).toBe(data.content);
    expect(decoded!.author).toBe(data.author);
  });

  it('与默认值合并，保证缺失字段类型完整', () => {
    const decoded = decodeCardDataFromHash(
      `#card=${encode({ title: '仅标题', templateId: 'zen-quote' })}`
    );
    expect(decoded).not.toBeNull();
    expect(decoded!.title).toBe('仅标题');
    expect(decoded!.templateId).toBe('zen-quote');
    // 未提供的字段回退到 INITIAL_CARD_DATA 默认值
    expect(decoded!.aspectRatio).toBe(INITIAL_CARD_DATA.aspectRatio);
    expect(decoded!.showWatermark).toBe(INITIAL_CARD_DATA.showWatermark);
  });

  it('兼容标准 base64（含 + / 与 padding =）', () => {
    const data: Partial<CardData> = { title: '标准 base64 测试' };
    const stdB64 = Buffer.from(
      JSON.stringify({ ...INITIAL_CARD_DATA, ...data }),
      'utf8'
    ).toString('base64'); // 标准含 + / 与 =
    const decoded = decodeCardDataFromHash(`#card=${stdB64}`);
    expect(decoded).not.toBeNull();
    expect(decoded!.title).toBe('标准 base64 测试');
  });

  it('可覆盖全部排版字段', () => {
    const data: Partial<CardData> = {
      templateId: 'dark-glass',
      aspectRatio: '9:16',
      fontSize: 'xl',
      align: 'center',
      showWatermark: false,
      watermarkText: 'CUSTOM',
    };
    const decoded = decodeCardDataFromHash(`#card=${encode(data)}`);
    expect(decoded).toMatchObject(data);
  });
});
