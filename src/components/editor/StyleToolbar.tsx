import React from 'react';
import { 
  CardData, 
  TemplateId, 
  AspectRatioType, 
  FontSizeType, 
  AlignType, 
  FontFamilyType 
} from '@/types/card';
import { TEMPLATES, ASPECT_RATIOS } from '@/core/templates/registry';
import { 
  Layout, 
  Palette, 
  Sliders, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify,
  Check,
  Type
} from 'lucide-react';

interface StyleToolbarProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
}

export const StyleToolbar: React.FC<StyleToolbarProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 模版风格选择 */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-neutral-700" />
          <span>贴图风格模版 (6 款设计感预设)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TEMPLATES.map((tmpl) => {
            const isSelected = data.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onChange({ templateId: tmpl.id })}
                className={`relative p-3 rounded-xl border text-left transition-all group overflow-hidden ${
                  isSelected
                    ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                {/* 顶部色彩小标 */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-5 h-5 rounded-md border border-black/10 shadow-inner flex items-center justify-center text-white"
                    style={{ background: tmpl.bgPreview }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-neutral-900" />}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {tmpl.tags[0]}
                  </span>
                </div>

                <div className="font-bold text-xs text-neutral-900">{tmpl.name}</div>
                <div className="text-[10px] text-neutral-500 font-mono line-clamp-1">{tmpl.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 画面比例 */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-neutral-700" />
          <span>画板尺寸与比例</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((item) => {
            const isSelected = data.aspectRatio === item.ratio;
            return (
              <button
                key={item.ratio}
                type="button"
                onClick={() => onChange({ aspectRatio: item.ratio })}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    {item.ratio === '3:4' ? '1080 × 1440' : item.ratio === '1:1' ? '1080 × 1080' : item.ratio === '9:16' ? '1080 × 1920' : item.ratio === '2.35:1' ? '1080 × 460' : '1080 × 810'}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 排版精细调节 */}
      <div className="space-y-4 pt-2 border-t border-neutral-200">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-neutral-700" />
          <span>排版细节微调</span>
        </label>

        {/* 字号与对齐 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              正文字号
            </label>
            <div className="flex bg-neutral-100 p-0.5 rounded-lg">
              {(['sm', 'base', 'lg', 'xl'] as FontSizeType[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ fontSize: size })}
                  className={`flex-1 py-1 text-xs rounded-md font-medium capitalize transition-all ${
                    data.fontSize === size
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              对齐方式
            </label>
            <div className="flex bg-neutral-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onChange({ align: 'left' })}
                title="左对齐"
                className={`flex-1 py-1 flex items-center justify-center rounded-md transition-all ${
                  data.align === 'left'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ align: 'center' })}
                title="居中对齐"
                className={`flex-1 py-1 flex items-center justify-center rounded-md transition-all ${
                  data.align === 'center'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ align: 'justify' })}
                title="两端对齐"
                className={`flex-1 py-1 flex items-center justify-center rounded-md transition-all ${
                  data.align === 'justify'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
