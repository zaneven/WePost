import { segmentBlocks } from '@/core/markdown/blocks';
import type { TemplateId, AspectRatioType, FontFamilyType } from '@/types/card';

/**
 * 内容 → 风格智能匹配（启发式，无需 AI / 后端）。
 *
 * 依据内容信号（块类型 / 长度 / 关键词）推荐模板 + 画幅 + 字体。
 * 纯函数、可测；优先级自上而下，命中即返回。结果是「建议」而非强制，
 * 用户可一键应用后再微调。
 */

export interface StyleRecommendation {
  templateId: TemplateId;
  aspectRatio: AspectRatioType;
  fontFamily: FontFamilyType;
  /** 推荐理由（供 UI 提示与 toast） */
  reason: string;
}

/** 态度 / 青年表达关键词 */
const ATTITUDE_RE = /打破|拒绝|不要|敢|叛逆|态度|青年|不被定义|框架|平庸/;
/** 东方 / 意境关键词 */
const ZEN_RE = /[山水]|留白|禅|墨|雅|静水流深|虚室|吉祥|诗|赋|辞|卷/;

export function recommendStyle(content: string): StyleRecommendation {
  const blocks = segmentBlocks(content);
  const types = new Set(blocks.map((b) => b.type));
  const hasCode = types.has('code');
  const hasTable = types.has('table');
  const hasMath = types.has('math');
  // 纯文本长度（去空白），用于容量判断
  const len = content.replace(/\s+/g, '').length;
  const isShortQuote =
    blocks.length <= 2 && len > 0 && len < 80 && !hasCode && !hasTable && !hasMath;

  // 1. 代码块 → 终端代码（竖屏长读代码）
  if (hasCode) {
    return {
      templateId: 'terminal-code',
      aspectRatio: '9:16',
      fontFamily: 'mono',
      reason: '检测到代码块，推荐终端代码模板 + 竖屏',
    };
  }
  // 2. 短金句 → 东方留白 + 正方形
  if (isShortQuote) {
    return {
      templateId: 'zen-quote',
      aspectRatio: '1:1',
      fontFamily: 'serif',
      reason: '短金句，推荐东方留白 + 正方形',
    };
  }
  // 3. 表格 / 结构化数据 → 复古报刊
  if (hasTable) {
    return {
      templateId: 'vintage-news',
      aspectRatio: '3:4',
      fontFamily: 'serif',
      reason: '含表格数据，推荐复古报刊',
    };
  }
  // 4. 态度表达 → 酸性潮流
  if (ATTITUDE_RE.test(content)) {
    return {
      templateId: 'acid-bold',
      aspectRatio: '3:4',
      fontFamily: 'sans',
      reason: '态度表达，推荐酸性潮流',
    };
  }
  // 5. 东方意境 → 水墨留白
  if (ZEN_RE.test(content)) {
    return {
      templateId: 'ink-wash',
      aspectRatio: '3:4',
      fontFamily: 'serif',
      reason: '东方意境，推荐水墨留白',
    };
  }
  // 6. 数学公式 → 暗黑毛玻璃（科技感）
  if (hasMath) {
    return {
      templateId: 'dark-glass',
      aspectRatio: '3:4',
      fontFamily: 'sans',
      reason: '含数学公式，推荐暗黑毛玻璃',
    };
  }
  // 7. 超长文 → 竖屏长读
  if (len > 600) {
    return {
      templateId: 'minimal-magazine',
      aspectRatio: '9:16',
      fontFamily: 'serif',
      reason: '长文，推荐竖屏长读',
    };
  }
  // 8. 默认 → 极简杂志
  return {
    templateId: 'minimal-magazine',
    aspectRatio: '3:4',
    fontFamily: 'serif',
    reason: '通用内容，推荐极简杂志',
  };
}
