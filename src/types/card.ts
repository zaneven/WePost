export type AspectRatioType = '3:4' | '1:1' | '9:16' | '2.35:1' | '4:3';

export type TemplateId =
  | 'minimal-magazine'
  | 'dark-glass'
  | 'vintage-news'
  | 'warm-memo'
  | 'zen-quote'
  | 'acid-bold'
  | 'ink-wash'
  | 'terminal-code'
  | 'editorial-bold'
  | 'neon-cyber';

export type FontSizeType = 'sm' | 'base' | 'lg' | 'xl';
export type AlignType = 'left' | 'center' | 'justify';
export type FontFamilyType = 'sans' | 'serif' | 'mono' | 'kaiti';

export interface CardData {
  title: string;
  subtitle: string;
  tag: string;
  content: string;
  author: string;
  date: string;
  footerText: string;
  templateId: TemplateId;
  aspectRatio: AspectRatioType;
  fontSize: FontSizeType;
  align: AlignType;
  fontFamily: FontFamilyType;
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  showWatermark?: boolean;
  watermarkText?: string;
}

export interface AspectRatioMeta {
  label: string;
  ratio: AspectRatioType;
  width: number; // 导出物理像素宽
  height: number; // 导出物理像素高
  canvasWidth: number; // 画板逻辑渲染宽
  canvasHeight: number; // 画板逻辑渲染高
  description: string;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  defaultFont: FontFamilyType;
  accentColor: string;
  bgPreview: string;
  /**
   * 画板高度中可用于正文的比例（其余给页眉 / 页脚 / 边距 / 块间距）。
   * 供长文拆分估算单卡容量：页眉页脚越高的模板该值越低。
   * 缺省为 0.6。
   */
  contentFraction?: number;
}

export interface ExportConfig {
  scale: 2 | 3;
  format: 'png' | 'jpeg';
  quality: number; // 0.8 - 1.0
}
