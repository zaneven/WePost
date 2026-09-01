import React, { useState } from 'react';
import { CardData } from '@/types/card';
import type { useCardExport } from '@/lib/useCardExport';
import type { SplitMode } from '@/core/split/splitContent';
import { StyleToolbar } from './StyleToolbar';
import { ExportPanel } from './ExportPanel';
import { SplitPanel } from './SplitPanel';
import { ChevronDown, Palette, Download, Scissors } from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface SettingsPanelProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onSmartMatch?: () => void;
  matchHint?: string | null;
  exportState: ExportState;
  /** 当前拆分模式 */
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  /** 单页标题模式：首页为大标题封面卡 */
  titlePage: boolean;
  onTitlePageChange: (enabled: boolean) => void;
  /** 当前拆分出的卡片总数 */
  cardCount: number;
  /** 是否有卡片内容溢出画板 */
  isOverflowing?: boolean;
}

/** Figma 式可折叠分区标题条 */
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-neutral-800/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer select-none"
      >
        <span className="text-emerald-400">{icon}</span>
        <span className="flex-1">{title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
            open ? '' : '-rotate-90'
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1">{children}</div>
      )}
    </section>
  );
};

/**
 * 桌面端右侧常驻参数栏：风格排版 + 拆分多卡 + 导出复制，可折叠分区堆叠，上下滚动。
 * （移动端仍走 page.tsx 的 Tab 布局，不经过本组件。）
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  data,
  onChange,
  onSmartMatch,
  matchHint,
  exportState,
  splitMode,
  onSplitModeChange,
  titlePage,
  onTitlePageChange,
  cardCount,
  isOverflowing = false,
}) => {
  return (
    <div>
      <CollapsibleSection title="风格排版" icon={<Palette className="w-3.5 h-3.5" aria-hidden="true" />}>
        <StyleToolbar
          data={data}
          onChange={onChange}
          onSmartMatch={onSmartMatch}
          matchHint={matchHint}
          surface="dark"
        />
      </CollapsibleSection>

      <CollapsibleSection title="拆分多卡" icon={<Scissors className="w-3.5 h-3.5" aria-hidden="true" />}>
        <SplitPanel
          surface="dark"
          splitMode={splitMode}
          onSplitModeChange={onSplitModeChange}
          titlePage={titlePage}
          onTitlePageChange={onTitlePageChange}
          cardCount={cardCount}
          isOverflowing={isOverflowing}
        />
      </CollapsibleSection>

      <CollapsibleSection title="导出复制" icon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}>
        <ExportPanel
          data={data}
          exportState={exportState}
          cardCount={cardCount}
          splitMode={splitMode}
          surface="dark"
        />
      </CollapsibleSection>
    </div>
  );
};
