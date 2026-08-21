import type { CardData } from '@/types/card';

export type PresetType =
  | 'essay'
  | 'quote'
  | 'news'
  | 'note'
  | 'acid'
  | 'ink'
  | 'code'
  | 'editorial'
  | 'neon';

export interface PresetMeta {
  type: PresetType;
  label: string;
  /** 覆盖到当前 CardData 上的部分字段 */
  overrides: Partial<CardData>;
}

/**
 * 灵感速选预设文案。集中维护，避免散落在页面组件中。
 * 应用时保留用户既有的非覆盖字段（如水印开关等）。
 */
export const PRESETS: PresetMeta[] = [
  {
    type: 'essay',
    label: '深度长文',
    overrides: {
      templateId: 'minimal-magazine',
      title: '在喧嚣的时代，重塑深度思考的秩序',
      subtitle: 'THINKING IN DEPTH / 思考碎片',
      tag: '深度阅读',
      content: `真正的专注，不是在安静的环境里做简单的事，而是在充满干扰的世界中守住内心的秩序。\n\n我们每天接收海量的信息碎片，却越来越少体验到思维深潜的愉悦。阅读长文、推演逻辑、写下真实感悟，是抵抗思维退化的终极武器。\n\n> 所谓卓越，就是将平凡的事反复雕琢，直到它泛出理性的光芒。\n\n放慢脚步，给大脑留出留白的时间，让灵感在沉淀中自然生长。`,
      author: '野生宝藏箱',
      date: '2026.08.19 · ISSUE 042',
      footerText: '保持专注 · 持续创造 · 记录真实的世界',
      fontFamily: 'serif',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'quote',
    label: '金句格言',
    overrides: {
      templateId: 'zen-quote',
      title: '山不让尘，川不辞盈',
      subtitle: '静水流深 · 东方禅思',
      tag: '东方美学',
      content: `万物皆有其时。\n\n急于奔赴结果，往往错过路旁的清风与明月。\n\n> 懂得留白的人，才能在繁芜的生活中寻得内心的从容。\n\n不争亦不随，在自己的时区里安静绽放。`,
      author: '野生宝藏箱',
      date: '岁在丙午 · 秋月',
      footerText: '虚室生白 · 吉祥止止',
      fontFamily: 'serif',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'news',
    label: '早报资讯',
    overrides: {
      templateId: 'vintage-news',
      title: 'AI 时代的自媒体内容创作：从流量追逐到价值深耕',
      subtitle: 'THE DAILY DISPATCH / 晨读参考',
      tag: '行业前瞻',
      content: `当生成式工具让内容生产的边际成本趋近于零，唯有具备独特审美与真实洞察的表达才具备长久生命力。\n\n- 机器提供效率，人类注入温度\n- 信息同质化加速，个人 IP 成为核心护城河\n- 精美排版与克制设计，正重塑读者的阅读信任\n\n> 真正的内容创作者，从不盲从算法，而是用文字重塑算法的世界。`,
      author: '野生宝藏箱',
      date: 'EST. 2026 · NO. 88',
      footerText: '每日晨读 · 见微知著',
      fontFamily: 'serif',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'note',
    label: '日系便签',
    overrides: {
      templateId: 'warm-memo',
      title: '给今天认真生活的自己点个赞',
      subtitle: 'DAILY JOURNAL / 温暖日常',
      tag: '治愈便签',
      content: `喝了一杯热咖啡，读完了搁置很久的一本书。\n\n生活其实不需要每天都波澜壮阔，那些由一顿热饭、一次散步、一句问候组成的微小瞬间，才是支撑我们走得很远的秘密力量。\n\n> 慢慢来，谁不是一边经历迷茫，一边闪闪发光呢？\n\n今天也辛苦啦，今晚早点睡吧！`,
      author: '野生宝藏箱',
      date: 'TODAY // 晴朗',
      footerText: '温和对待世界，安静做好自己',
      fontFamily: 'kaiti',
      aspectRatio: '1:1',
    },
  },
  {
    type: 'acid',
    label: '态度先锋',
    overrides: {
      templateId: 'acid-bold',
      title: '打破既定框架，做不被定义的创造者！',
      subtitle: 'BREAK THE RULES // 青年态度',
      tag: '态度先锋',
      content: `如果大家都走同一条路，那终点注定平庸无奇。\n\n保持尖锐，敢于对无趣说不！你的独特，就是你面对这个世界最硬核的底牌。\n\n> 不要等风来，要做卷起风暴的那个人！\n\n- 拒绝标签化人生\n- 永远好奇，永远折腾\n- 为自己的热爱全力以赴`,
      author: '野生宝藏箱',
      date: '2026 / VOL.09',
      footerText: '拒绝平庸 · 勇敢发声 · DO SOMETHING COOL',
      fontFamily: 'sans',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'ink',
    label: '水墨随笔',
    overrides: {
      templateId: 'ink-wash',
      title: '山高水长，行稳致远',
      subtitle: 'INK WASH / 水墨随笔',
      tag: '东方意境',
      content: `落笔处，山势已成。\n\n留白，是为了让风穿过纸面，让墨自己说话。\n\n> 急不如缓，缓中有力；静水流深，大音希声。\n\n写一页，读一页，皆是修行。`,
      author: '野生宝藏箱',
      date: '甲辰年 · 仲秋',
      footerText: '笔墨之间 · 自有天地',
      fontFamily: 'serif',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'code',
    label: '开发笔记',
    overrides: {
      templateId: 'terminal-code',
      title: '少写代码，多读代码',
      subtitle: '~/dev-notes — zsh',
      tag: 'dev.note',
      content: `好代码不是写出来的，是读出来的。\n\n- 先读三遍，再动一行\n- 删除，是最好的重构\n- 命名即设计\n\n> 提交信息要写给六个月后的自己看。`,
      author: '野生宝藏箱',
      date: 'commit 4f9a2c1',
      footerText: 'ship · learn · repeat',
      fontFamily: 'mono',
      aspectRatio: '9:16',
    },
  },
  {
    type: 'editorial',
    label: '评论专栏',
    overrides: {
      templateId: 'editorial-bold',
      title: '算法之外，仍需人的判断',
      subtitle: 'OPINION / 评论专栏',
      tag: '观点评论',
      content: `当一切都能被生成，唯有判断不可被外包。\n\n效率归机器，温度归人。真正的护城河，是审美与品味。\n\n- 信息同质化时代，独特即稀缺\n- 克制，是最高级的表达\n\n> 不盲从算法，而重塑算法。`,
      author: '野生宝藏箱',
      date: 'ISSUE 042 · 2026',
      footerText: '以文字，重塑算法的世界',
      fontFamily: 'sans',
      aspectRatio: '3:4',
    },
  },
  {
    type: 'neon',
    label: '赛博信号',
    overrides: {
      templateId: 'neon-cyber',
      title: '在数字洪流里，保留一点叛逆',
      subtitle: 'SIGNAL / 未来观察',
      tag: '赛博',
      content: `信号过载的夜里，做那个拒绝静默的人。\n\n> 与其被推流，不如自己造浪。\n\n保持锋利，保持好奇。`,
      author: '野生宝藏箱',
      date: '2049.07.21',
      footerText: 'jack in · ride the signal',
      fontFamily: 'sans',
      aspectRatio: '3:4',
    },
  },
];

/**
 * 基于当前数据应用某个预设，返回合并后的完整 CardData。
 */
export function buildPresetData(current: CardData, type: PresetType): CardData {
  const preset = PRESETS.find((p) => p.type === type);
  if (!preset) return current;
  return { ...current, ...preset.overrides };
}
