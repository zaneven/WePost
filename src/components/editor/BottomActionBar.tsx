import React from 'react';
import { CardData } from '@/types/card';
import { TEMPLATES } from '@/core/templates/registry';
import type { useCardExport } from '@/lib/useCardExport';
import { Download, Copy, Check, Loader2 } from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface BottomActionBarProps {
  data: CardData;
  exportState: ExportState;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({ data, exportState }) => {
  const currentTemplate = TEMPLATES.find((t) => t.id === data.templateId);

  return (
    <div className="w-full border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 z-40 flex-shrink-0 shadow-2xl select-none">
      {/* 左侧：模板信息、比例、字数与状态 */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-neutral-400 font-mono min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-neutral-200 truncate">
          {currentTemplate?.name || '极简杂志'}
        </span>
        <span className="text-neutral-700">·</span>
        <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[11px]">
          {data.aspectRatio}
        </span>
        <span className="text-neutral-700">·</span>
        <span className="text-neutral-400 text-[11px] truncate">
          {data.content.length} 字
        </span>
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-neutral-500 font-sans ml-1.5">
          <span className="w-1 h-1 rounded-full bg-neutral-600" />
          <span>高清画板实时同步</span>
        </span>
      </div>

      {/* 右侧：复制与下载操作组 */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* 一键复制图片到剪贴板 */}
        <button
          type="button"
          onClick={() => exportState.handleCopyClipboard()}
          disabled={exportState.isCopying}
          aria-label="复制图片到剪贴板"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            exportState.copiedSuccess
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 hover:text-white border border-neutral-700/60 active:scale-[0.98]'
          } ${exportState.isCopying ? 'opacity-70 cursor-wait' : ''}`}
        >
          {exportState.isCopying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" aria-hidden="true" />
          ) : exportState.copiedSuccess ? (
            <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-neutral-300" aria-hidden="true" />
          )}
          <span>
            {exportState.copiedSuccess ? '已复制' : '复制图片'}
          </span>
        </button>

        {/* 高清下载主操作 */}
        <button
          type="button"
          onClick={() => exportState.handleDownload(data)}
          disabled={exportState.isExporting}
          aria-label={`下载 ${exportState.config.scale}x 高清图片`}
          className={`flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-500 text-neutral-950 font-bold shadow-lg shadow-emerald-500/25 active:scale-[0.98] ${
            exportState.isExporting ? 'opacity-70 cursor-wait' : ''
          }`}
        >
          {exportState.isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-950" aria-hidden="true" />
          ) : (
            <Download className="w-3.5 h-3.5 text-neutral-950" aria-hidden="true" />
          )}
          <span>
            {exportState.isExporting
              ? '导出中…'
              : `下载 ${exportState.config.scale}x`}
          </span>
        </button>
      </div>
    </div>
  );
};
