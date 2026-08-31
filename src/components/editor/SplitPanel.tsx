import React from 'react';
import { Wand2, Minus, Layers } from 'lucide-react';
import type { SplitMode } from '@/core/split/splitContent';

interface SplitPanelProps {
  /** 当前拆分模式（自动容量 / 分割线），状态由 page 持有并持久化 */
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  /** 当前拆分出的卡片总数 */
  cardCount: number;
  /** 是否有卡片内容溢出画板（提示改用分割线拆分） */
  isOverflowing?: boolean;
  /** light = 移动端浅色 Tab；dark = 桌面右侧暗色参数栏 */
  surface?: 'light' | 'dark';
}

/**
 * 拆分多卡面板：拆分为常驻能力（预览区始终渲染拆分结果），此处选择拆分模式——
 * 自动拆分（按模板 / 画幅 / 字号容量智能切块，默认）或分割线拆分（按正文 ---
 * 分割线切分）。桌面端位于右侧设置栏，移动端位于「导出与复制」Tab。
 */
export const SplitPanel: React.FC<SplitPanelProps> = ({
  splitMode,
  onSplitModeChange,
  cardCount,
  isOverflowing = false,
  surface = 'light',
}) => {
  const dark = surface === 'dark';

  const MODES: Array<{
    value: SplitMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }> = [
    {
      value: 'auto',
      label: '自动拆分',
      icon: <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />,
      desc: '按模板与画幅容量智能切块，正文超出即拆',
    },
    {
      value: 'divider',
      label: '分割线拆分',
      icon: <Minus className="w-3.5 h-3.5" aria-hidden="true" />,
      desc: '按正文中的 --- 分割线切分，手动控制每张卡',
    },
  ];

  return (
    <div className="space-y-3">
      {/* 模式选择（单选卡片组） */}
      <div
        role="radiogroup"
        aria-label="拆分模式"
        className="grid grid-cols-1 gap-1.5"
      >
        {MODES.map((m) => {
          const selected = splitMode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSplitModeChange(m.value)}
              className={`flex items-start gap-2 text-left px-2.5 py-2 rounded-lg border transition-colors cursor-pointer ${
                selected
                  ? dark
                    ? 'border-emerald-400/60 bg-emerald-400/10'
                    : 'border-neutral-900 bg-neutral-100'
                  : dark
                    ? 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span
                className={`mt-0.5 flex-shrink-0 ${
                  selected
                    ? dark
                      ? 'text-emerald-400'
                      : 'text-neutral-900'
                    : dark
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                }`}
              >
                {m.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-bold ${
                    selected
                      ? dark
                        ? 'text-white'
                        : 'text-neutral-900'
                      : dark
                        ? 'text-neutral-300'
                        : 'text-neutral-700'
                  }`}
                >
                  {m.label}
                </span>
                <span
                  className={`block text-[11px] leading-snug ${
                    dark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  {m.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 拆分结果实时计数 */}
      <div
        className={`flex items-center gap-1.5 text-[11px] ${
          dark ? 'text-neutral-400' : 'text-neutral-500'
        }`}
      >
        <Layers className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>
          当前内容拆分为 <span className="font-bold">{cardCount}</span>{' '}
          张卡片，预览区实时拼接展示
        </span>
      </div>

      {/* 溢出提示：对应模式下的调优建议 */}
      {isOverflowing && (
        <div
          className={`text-[11px] leading-snug ${
            dark ? 'text-amber-400/90' : 'text-amber-600'
          }`}
        >
          {splitMode === 'auto'
            ? '仍有卡片内容超出画板（自动拆分按容量估算可能有偏差），可改用「分割线拆分」手动控制每张卡的内容。'
            : '有卡片内容超出画板：可在正文相应位置增加 --- 分割线，把该卡内容再切细一些。'}
        </div>
      )}
    </div>
  );
};
