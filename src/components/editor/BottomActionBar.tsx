import React from 'react';
import { CardData } from '@/types/card';
import { TEMPLATES } from '@/core/templates/registry';

interface BottomActionBarProps {
  data: CardData;
  /** 当前拆分出的卡片总数 */
  cardCount: number;
}

/** 预览区底部状态条：模板 / 画幅 / 字数 / 卡片数（复制下载已移至卡片 hover 与右侧导出面板）。 */
export const BottomActionBar: React.FC<BottomActionBarProps> = ({ data, cardCount }) => {
  const currentTemplate = TEMPLATES.find((t) => t.id === data.templateId);

  return (
    <div className="w-full border-t border-neutral-200 bg-white/95 dark:border-neutral-800/80 dark:bg-neutral-950/95 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 z-40 flex-shrink-0 shadow-2xl shadow-black/5 dark:shadow-black/20 select-none">
      {/* 左侧：模板信息、比例、字数与卡片数 */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          {currentTemplate?.name || '极简杂志'}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="bg-neutral-100 border border-neutral-200 text-neutral-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 px-1.5 py-0.5 rounded text-[11px]">
          {data.aspectRatio}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate">
          {data.content.length} 字
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
          {cardCount} 张卡片
        </span>
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-sans ml-1.5">
          <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          <span>高清画板实时同步</span>
        </span>
      </div>

      {/* 右侧：操作提示（复制 / 下载在卡片 hover 与右侧导出面板） */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 flex-shrink-0">
        <span>悬停卡片可单张复制 / 下载</span>
      </div>
    </div>
  );
};
