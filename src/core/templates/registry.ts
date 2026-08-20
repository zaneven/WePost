import { TemplateMeta, AspectRatioMeta, AspectRatioType, CardData } from '@/types/card';

export const ASPECT_RATIOS: AspectRatioMeta[] = [
  {
    label: '3:4 微信/小红书',
    ratio: '3:4',
    width: 1080,
    height: 1440,
    canvasWidth: 540,
    canvasHeight: 720,
    description: '微信图文多图、小红书贴图首选，排版视觉最舒适',
  },
  {
    label: '1:1 正方形卡片',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    canvasWidth: 600,
    canvasHeight: 600,
    description: '朋友圈九宫格、金句摘录、每日打卡',
  },
  {
    label: '9:16 竖屏海报',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    canvasWidth: 450,
    canvasHeight: 800,
    description: '微信视频号动态、故事长图、手机全屏壁纸',
  },
  {
    label: '2.35:1 公众号封面',
    ratio: '2.35:1',
    width: 1080,
    height: 460,
    canvasWidth: 705,
    canvasHeight: 300,
    description: '微信公众平台推文主封面头图',
  },
  {
    label: '4:3 经典画幅',
    ratio: '4:3',
    width: 1080,
    height: 810,
    canvasWidth: 640,
    canvasHeight: 480,
    description: '横版卡片、PPT配图、横屏分享',
  },
];

/**
 * 根据画面比例获取画板逻辑渲染尺寸 (逻辑像素)。
 * 作为唯一的尺寸数据源，供 CardStage / CardRenderer 等组件统一引用，
 * 避免多处硬编码导致的尺寸不一致。
 */
export function getCanvasDimensions(
  ratio: AspectRatioType
): { width: number; height: number } {
  const meta = ASPECT_RATIOS.find((item) => item.ratio === ratio);
  if (!meta) {
    return { width: 540, height: 720 };
  }
  return { width: meta.canvasWidth, height: meta.canvasHeight };
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'minimal-magazine',
    name: '极简杂志',
    subtitle: 'Minimalist Magazine',
    description: '经典衬线字体、首字下沉排版、纤细网格线与大面积留白美学',
    tags: ['深度思考', '书摘精读', '黑白经典'],
    defaultFont: 'serif',
    accentColor: '#18181b',
    bgPreview: 'linear-gradient(135deg, #fbfbfb 0%, #f4f4f5 100%)',
  },
  {
    id: 'dark-glass',
    name: '暗黑毛玻璃',
    subtitle: 'Modern Dark Glass',
    description: '深邃曜石黑、磨砂玻璃微透质感、冷冽荧光边界与极客现代字体',
    tags: ['科技商业', '极客洞察', '质感未来'],
    defaultFont: 'sans',
    accentColor: '#38bdf8',
    bgPreview: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
  },
  {
    id: 'vintage-news',
    name: '复古报刊',
    subtitle: 'Vintage Press',
    description: '浅牛皮纸微噪点底纹、粗衬线标题、双细线排版与印章徽标',
    tags: ['人文故事', '晨读早报', '复古怀旧'],
    defaultFont: 'serif',
    accentColor: '#854d0e',
    bgPreview: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  },
  {
    id: 'warm-memo',
    name: '温暖便签',
    subtitle: 'Warm Healing Note',
    description: '日系奶油柔色系、圆润卡片投影、日系胶带与手作感点缀',
    tags: ['生活治愈', '碎碎念', '每日便签'],
    defaultFont: 'kaiti',
    accentColor: '#d97706',
    bgPreview: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    id: 'zen-quote',
    name: '东方留白',
    subtitle: 'Zen Aesthetic',
    description: '极致留白呼吸感、朱砂红落款印章、精雕细琢的行距与典雅字态',
    tags: ['诗歌散文', '禅意格言', '艺术审美'],
    defaultFont: 'serif',
    accentColor: '#b91c1c',
    bgPreview: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
  },
  {
    id: 'acid-bold',
    name: '酸性潮流',
    subtitle: 'Acid & Neo-Brutalism',
    description: '高反差撞色粗黑线框、几何色块点缀、粗体大字标语与波普力量',
    tags: ['态度青年', '潮流观点', '醒目标语'],
    defaultFont: 'sans',
    accentColor: '#84cc16',
    bgPreview: 'linear-gradient(135deg, #facc15 0%, #ec4899 100%)',
  },
];

export const INITIAL_CARD_DATA: CardData = {
  title: '在喧嚣的时代，重塑深度思考的秩序',
  subtitle: 'THINKING IN DEPTH / 思考碎片',
  tag: '深度阅读',
  content: `真正的专注，不是在安静的环境里做简单的事，而是在充满干扰的世界中守住内心的秩序。\n\n我们每天接收海量的信息碎片，却越来越少体验到思维深潜的愉悦。阅读长文、推演逻辑、写下真实感悟，是抵抗思维退化的终极武器。\n\n> 所谓卓越，就是将平凡的事反复雕琢，直到它泛出理性的光芒。\n\n放慢脚步，给大脑留出留白的时间，让灵感在沉淀中自然生长。`,
  author: 'WePost 研习社',
  date: '2026.08.19 · ISSUE 042',
  footerText: '保持专注 · 持续创造 · 记录真实的世界',
  templateId: 'minimal-magazine',
  aspectRatio: '3:4',
  fontSize: 'base',
  align: 'left',
  fontFamily: 'serif',
  showWatermark: true,
  watermarkText: 'WEPOST · CARD',
};
