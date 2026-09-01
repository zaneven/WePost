import React, { useEffect, useRef, useState } from 'react';
import {
  CardData,
  FontSizeType
} from '@/types/card';
import { TEMPLATES, ASPECT_RATIOS } from '@/core/templates/registry';
import { FONT_OPTIONS } from '@/core/fonts';
import {
  TemplateThumbnail,
  AspectRatioThumbnail,
} from '@/components/canvas/TemplateThumbnail';
import {
  Layout,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Check,
  ChevronDown,
  Wand2,
} from 'lucide-react';

/** UI 仅开放常用画幅（公众号封面 2.35:1 与 4:3 画幅暂不开放选择，registry 保留以兼容历史数据） */
const VISIBLE_RATIOS = ASPECT_RATIOS.filter(
  (item) => item.ratio !== '2.35:1' && item.ratio !== '4:3'
);

interface StyleToolbarProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  /** 智能匹配回调（按内容推荐模板/画幅/字体） */
  onSmartMatch?: () => void;
  /** 当前推荐理由（供按钮旁提示） */
  matchHint?: string | null;
  /** 所在表面主题：light=浅色面板（移动端 Tab），dark=暗色参数栏（桌面端右栏） */
  surface?: 'light' | 'dark';
}

export const StyleToolbar: React.FC<StyleToolbarProps> = ({
  data,
  onChange,
  onSmartMatch,
  matchHint,
  surface = 'light',
}) => {
  const dark = surface === 'dark';
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const currentFont =
    FONT_OPTIONS.find((f) => f.value === data.fontFamily) ?? FONT_OPTIONS[0];

  // 下拉打开时点击外部区域关闭
  useEffect(() => {
    if (!fontMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setFontMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [fontMenuOpen]);

  // 分区标签：与 ExportPanel 保持全局统一
  const labelClass = `block text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
    dark ? 'text-neutral-400' : 'text-neutral-500'
  }`;
  const labelIconClass = dark ? 'text-neutral-500' : 'text-neutral-700';
  const subLabelClass = `block text-xs font-medium mb-1.5 ${
    dark ? 'text-neutral-400' : 'text-neutral-600'
  }`;

  // 分段控件（全局统一风格）：容器 + 选中/未选中态
  const segContainer = `flex p-0.5 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-100'}`;
  const segGridContainer = `grid grid-cols-2 gap-0.5 p-0.5 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-100'}`;
  const segBtn = (active: boolean) =>
    `text-xs rounded-md font-medium transition-all ${
      active
        ? dark
          ? 'bg-neutral-700 text-white shadow-sm'
          : 'bg-white text-neutral-900 shadow-sm'
        : dark
          ? 'text-neutral-400 hover:text-neutral-200'
          : 'text-neutral-500 hover:text-neutral-800'
    }`;

  return (
    <div className="space-y-6">
      {/* 智能匹配：按内容一键推荐模板 / 画幅 / 字体 */}
      {onSmartMatch && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-700 text-white shadow-sm">
          <button
            type="button"
            onClick={onSmartMatch}
            title="按当前内容智能推荐模板 / 画幅 / 字体"
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
            智能匹配
          </button>
          {matchHint && (
            <span className="text-[11px] text-neutral-300 flex-1 min-w-0 truncate">
              {matchHint}
            </span>
          )}
        </div>
      )}

      {/* 贴图风格选择（固定两列，缩略图等比适配固定高度，不随画幅变化） */}
      <div>
        <label className={`${labelClass} mb-2.5`}>
          <Palette className={`w-3.5 h-3.5 ${labelIconClass}`} />
          <span>贴图风格模版 ({TEMPLATES.length} 款设计感预设)</span>
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((tmpl) => {
            const isSelected = data.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onChange({ templateId: tmpl.id })}
                aria-pressed={isSelected}
                className={`relative rounded-xl border text-left transition-all group overflow-hidden ${
                  isSelected
                    ? dark
                      ? 'border-neutral-300 ring-2 ring-white/20 shadow-sm shadow-white/10'
                      : 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                    : dark
                      ? 'border-neutral-700 hover:border-neutral-500'
                      : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {/* 固定高度缩略图区（真实渲染预览，等比缩放居中） */}
                <div className="h-28 flex items-center justify-center overflow-hidden px-2 pt-2 bg-neutral-100">
                  <TemplateThumbnail
                    templateId={tmpl.id}
                    aspectRatio={data.aspectRatio}
                    width={150}
                    height={96}
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {/* 名称条 */}
                <div className="px-2 py-1.5 bg-white">
                  <div className="font-bold text-xs text-neutral-900">{tmpl.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono line-clamp-1">
                    {tmpl.tags[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 画板尺寸与比例（统一分段控件选中风格，无勾选图标） */}
      <div>
        <label className={`${labelClass} mb-2.5`}>
          <Layout className={`w-3.5 h-3.5 ${labelIconClass}`} />
          <span>画板尺寸与比例</span>
        </label>

        <div className={segGridContainer}>
          {VISIBLE_RATIOS.map((item) => {
            const isSelected = data.aspectRatio === item.ratio;
            return (
              <button
                key={item.ratio}
                type="button"
                onClick={() => onChange({ aspectRatio: item.ratio })}
                aria-pressed={isSelected}
                title={`${item.width} × ${item.height}`}
                className={`p-2 rounded-md text-left flex items-center gap-2 ${segBtn(isSelected)}`}
              >
                <AspectRatioThumbnail ratio={item.ratio} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{item.label}</div>
                  <div className="text-[10px] font-mono opacity-60">
                    {item.width} × {item.height}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 文字与对齐（字体 / 字号 / 对齐 上下排列） */}
      <div className={`space-y-4 pt-2 border-t ${dark ? 'border-neutral-700/60' : 'border-neutral-200'}`}>
        <label className={labelClass}>
          <Type className={`w-3.5 h-3.5 ${labelIconClass}`} />
          <span>文字与对齐</span>
        </label>

        {/* 字体：下拉选择，选项以各自字体渲染预览 */}
        <div className="relative" ref={fontMenuRef}>
          <label className={subLabelClass}>字体</label>
          <button
            type="button"
            onClick={() => setFontMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={fontMenuOpen}
            className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-all ${
              dark
                ? 'bg-neutral-900 border border-neutral-700/60 hover:border-neutral-500 text-neutral-200'
                : 'bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 shadow-sm'
            }`}
          >
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="font-medium flex-shrink-0">{currentFont.label}</span>
              <span
                className="opacity-60 truncate"
                style={{ fontFamily: currentFont.cssFamily }}
              >
                {currentFont.preview}
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 flex-shrink-0 opacity-60 transition-transform duration-200 ${
                fontMenuOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {fontMenuOpen && (
            <div
              role="listbox"
              aria-label="选择字体"
              className={`absolute left-0 right-0 mt-1 rounded-lg overflow-hidden border shadow-lg z-20 ${
                dark
                  ? 'bg-neutral-900 border-neutral-700'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <div className="max-h-56 overflow-y-auto">
                {FONT_OPTIONS.map((font) => {
                  const isSelected = data.fontFamily === font.value;
                  return (
                    <button
                      key={font.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange({ fontFamily: font.value });
                        setFontMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between gap-2 text-left transition-colors ${
                        isSelected
                          ? dark
                            ? 'bg-neutral-800'
                            : 'bg-neutral-100'
                          : dark
                            ? 'hover:bg-neutral-800/60'
                            : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-sm leading-snug truncate ${
                            dark ? 'text-neutral-100' : 'text-neutral-900'
                          }`}
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {font.label}
                        </span>
                        <span
                          className={`block text-[11px] leading-snug truncate ${
                            dark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {font.preview}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 字号 */}
        <div>
          <label className={subLabelClass}>字号</label>
          <div className={segContainer}>
            {([
              { value: 'sm', label: '小', px: '14' },
              { value: 'base', label: '中', px: '16' },
              { value: 'lg', label: '大', px: '18' },
              { value: 'xl', label: '特大', px: '20' },
            ] as { value: FontSizeType; label: string; px: string }[]).map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => onChange({ fontSize: size.value })}
                title={`${size.label}号 · ${size.px}px`}
                className={`py-1.5 px-2 ${segBtn(data.fontSize === size.value)}`}
              >
                <span>{size.label}</span>
                <span className="opacity-60 ml-0.5 font-mono text-[10px]">{size.px}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 对齐方式 */}
        <div>
          <label className={subLabelClass}>对齐方式</label>
          <div className={segContainer}>
            {([
              { value: 'left', label: '左对齐', Icon: AlignLeft },
              { value: 'center', label: '居中对齐', Icon: AlignCenter },
              { value: 'justify', label: '两端对齐', Icon: AlignJustify },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ align: value })}
                title={label}
                aria-label={label}
                className={`py-1.5 px-2 flex items-center justify-center ${segBtn(data.align === value)}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
