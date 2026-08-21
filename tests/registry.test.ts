import { describe, it, expect } from 'vitest';
import { ASPECT_RATIOS, TEMPLATES, getCanvasDimensions, getMobileStageHeightVh, INITIAL_CARD_DATA } from '@/core/templates/registry';

describe('registry: ASPECT_RATIOS', () => {
  it('每个比例都包含完整的导出尺寸与画板逻辑尺寸', () => {
    for (const item of ASPECT_RATIOS) {
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
      expect(item.canvasWidth).toBeGreaterThan(0);
      expect(item.canvasHeight).toBeGreaterThan(0);
      // 导出尺寸与画板逻辑尺寸为不同像素密度，但纵横比必须一致
      expect(item.width / item.height).toBeCloseTo(
        item.canvasWidth / item.canvasHeight,
        2
      );
    }
  });

  it('覆盖全部 5 种声明比例', () => {
    const ratios = ASPECT_RATIOS.map((r) => r.ratio);
    expect(ratios).toEqual(
      expect.arrayContaining(['3:4', '1:1', '9:16', '2.35:1', '4:3'])
    );
  });
});

describe('getCanvasDimensions', () => {
  it('返回对应比例的画板逻辑尺寸', () => {
    expect(getCanvasDimensions('3:4')).toEqual({ width: 540, height: 720 });
    expect(getCanvasDimensions('1:1')).toEqual({ width: 600, height: 600 });
    expect(getCanvasDimensions('9:16')).toEqual({ width: 450, height: 800 });
    expect(getCanvasDimensions('2.35:1')).toEqual({ width: 705, height: 300 });
    expect(getCanvasDimensions('4:3')).toEqual({ width: 640, height: 480 });
  });

  it('未知比例回退为默认 3:4 尺寸', () => {
    // @ts-expect-error 故意传入非法值测试回退
    expect(getCanvasDimensions('bogus')).toEqual({ width: 540, height: 720 });
  });
});

describe('getMobileStageHeightVh', () => {
  it('返回值落在 [42, 70] vh 区间', () => {
    for (const r of ['3:4', '1:1', '9:16', '2.35:1', '4:3'] as const) {
      const vh = getMobileStageHeightVh(r);
      expect(vh).toBeGreaterThanOrEqual(42);
      expect(vh).toBeLessThanOrEqual(70);
    }
  });

  it('竖屏比例分配的高度大于宽幅比例', () => {
    // 9:16（最竖）应高于 2.35:1（最宽）
    expect(getMobileStageHeightVh('9:16')).toBeGreaterThan(getMobileStageHeightVh('2.35:1'));
    // 3:4 也应高于 4:3
    expect(getMobileStageHeightVh('3:4')).toBeGreaterThan(getMobileStageHeightVh('4:3'));
  });

  it('未知比例回退为默认区间内值', () => {
    // @ts-expect-error 故意传入非法值测试回退
    const vh = getMobileStageHeightVh('bogus');
    expect(vh).toBeGreaterThanOrEqual(42);
    expect(vh).toBeLessThanOrEqual(70);
  });
});

describe('registry: TEMPLATES', () => {
  it('注册了 10 个模板且 id 唯一', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });

  it('每个模板都有默认字体与强调色', () => {
    for (const t of TEMPLATES) {
      expect(t.defaultFont).toBeTruthy();
      expect(t.accentColor).toMatch(/^#/);
    }
  });

  it('新增的 4 个模板均已注册', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining(['ink-wash', 'terminal-code', 'editorial-bold', 'neon-cyber'])
    );
  });

  it('每个模板都有默认字体与强调色', () => {
    for (const t of TEMPLATES) {
      expect(t.defaultFont).toBeTruthy();
      expect(t.accentColor).toMatch(/^#/);
    }
  });
});

describe('INITIAL_CARD_DATA', () => {
  it('默认模板为 minimal-magazine，比例为 3:4', () => {
    expect(INITIAL_CARD_DATA.templateId).toBe('minimal-magazine');
    expect(INITIAL_CARD_DATA.aspectRatio).toBe('3:4');
  });

  it('标题与正文非空', () => {
    expect(INITIAL_CARD_DATA.title.length).toBeGreaterThan(0);
    expect(INITIAL_CARD_DATA.content.length).toBeGreaterThan(0);
  });
});
