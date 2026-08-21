import { describe, it, expect } from 'vitest';
import { PRESETS, buildPresetData } from '@/data/presets';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import type { CardData } from '@/types/card';

const base: CardData = { ...INITIAL_CARD_DATA };

describe('presets: PRESETS', () => {
  it('注册了 9 个预设且 type 唯一', () => {
    const types = PRESETS.map((p) => p.type);
    expect(types).toHaveLength(9);
    expect(new Set(types).size).toBe(9);
    expect(types).toEqual(
      expect.arrayContaining([
        'essay',
        'quote',
        'news',
        'note',
        'acid',
        'ink',
        'code',
        'editorial',
        'neon',
      ])
    );
  });

  it('每个预设都有 label 与至少一个覆盖字段', () => {
    for (const p of PRESETS) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(Object.keys(p.overrides).length).toBeGreaterThan(0);
    }
  });
});

describe('buildPresetData', () => {
  it('覆盖指定字段并保留其余字段', () => {
    // INITIAL_CARD_DATA 本身就是 essay 预设的副本，故用 quote 预设验证覆盖
    const result = buildPresetData(base, 'quote');
    expect(result.templateId).toBe('zen-quote');
    expect(result.title).not.toBe(base.title);
    // 未覆盖字段应保留
    expect(result.showWatermark).toBe(base.showWatermark);
    expect(result.fontSize).toBe(base.fontSize);
  });

  it('note 预设使用楷体与 1:1 比例', () => {
    const result = buildPresetData(base, 'note');
    expect(result.fontFamily).toBe('kaiti');
    expect(result.aspectRatio).toBe('1:1');
    expect(result.templateId).toBe('warm-memo');
  });

  it('acid 预设使用无衬线与酸性模板', () => {
    const result = buildPresetData(base, 'acid');
    expect(result.fontFamily).toBe('sans');
    expect(result.templateId).toBe('acid-bold');
  });

  it('code 预设使用等宽字体、9:16 与终端代码模板', () => {
    const result = buildPresetData(base, 'code');
    expect(result.fontFamily).toBe('mono');
    expect(result.aspectRatio).toBe('9:16');
    expect(result.templateId).toBe('terminal-code');
  });

  it('ink 预设使用衬线与水墨留白模板', () => {
    const result = buildPresetData(base, 'ink');
    expect(result.fontFamily).toBe('serif');
    expect(result.templateId).toBe('ink-wash');
  });

  it('未知预设返回原数据不变', () => {
    // @ts-expect-error 故意传入非法值
    const result = buildPresetData(base, 'nope');
    expect(result).toBe(base);
  });
});
