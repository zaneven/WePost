import type { FontFamilyType } from '@/types/card';

/**
 * 卡片可选字体注册表（单一数据源）。
 *
 * StyleToolbar（下拉选择器 + 预览）与 CardRenderer（字体栈）共用，
 * 避免两处硬编码漂移。新增字体：装包 → layout.tsx 引入 CSS → 在此登记。
 *
 * 系统字体（sans / serif / mono / kaiti）依赖各平台内置字形，零加载成本；
 * 开源字体（OFL 许可，无版权风险）自托管于同源静态资产：
 * - noto-sans  思源黑体  @fontsource/noto-sans-sc（Noto Sans SC，400/500/700）
 * - noto-serif 思源宋体  @fontsource/noto-serif-sc（Noto Serif SC，400/500/700）
 * - wenkai     霞鹜文楷  lxgw-wenkai-webfont（LXGW WenKai，400/700）
 */
export interface FontOption {
  value: FontFamilyType;
  label: string;
  /** 下拉预览与卡片渲染共用的 CSS font-family 栈 */
  cssFamily: string;
  /** 预览样例文案（含中英文与数字，展示字体的中西文混排效果） */
  preview?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: 'sans',
    label: '系统黑体',
    cssFamily:
      'var(--font-sans, system-ui), system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    preview: '现代简洁 Aa 123',
  },
  {
    value: 'noto-sans',
    label: '思源黑体',
    cssFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    preview: '现代简洁 Aa 123',
  },
  {
    value: 'serif',
    label: '系统宋体',
    cssFamily:
      'var(--font-serif, "Songti SC"), "Songti SC", "Noto Serif SC", SimSun, serif',
    preview: '书卷文艺 Aa 123',
  },
  {
    value: 'noto-serif',
    label: '思源宋体',
    cssFamily: '"Noto Serif SC", "Songti SC", SimSun, serif',
    preview: '书卷文艺 Aa 123',
  },
  {
    value: 'kaiti',
    label: '系统楷体',
    cssFamily: '"STKaiti", "KaiTi", "Noto Serif SC", serif',
    preview: '温润手写 Aa 123',
  },
  {
    value: 'wenkai',
    label: '霞鹜文楷',
    cssFamily: '"LXGW WenKai", "STKaiti", "KaiTi", serif',
    preview: '温润手写 Aa 123',
  },
  {
    value: 'mono',
    label: '等宽字体',
    cssFamily: 'var(--font-mono, Menlo), Menlo, Monaco, Consolas, monospace',
    preview: '代码笔记 Aa 123',
  },
];

/** fontFamily 值 → CSS 字体栈（供 CardRenderer 等渲染方直接取用） */
export const FONT_FAMILY_STACKS: Record<FontFamilyType, string> =
  Object.fromEntries(FONT_OPTIONS.map((f) => [f.value, f.cssFamily])) as Record<
    FontFamilyType,
    string
  >;

/** 全部合法的 fontFamily 值（供 AI 填写白名单等校验方使用） */
export const FONT_FAMILY_VALUES: FontFamilyType[] = FONT_OPTIONS.map((f) => f.value);
