import React from 'react';
import { Layers, Sparkles, RefreshCw, FileText, Share2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onResetExample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetExample }) => {
  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* 左侧 Logo 与品牌 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center shadow-md">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-neutral-900">WePost</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold border border-neutral-200">
              Studio v1.0
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 hidden sm:block">
            现代内容排版 · 微信贴图号图片生成器
          </p>
        </div>
      </div>

      {/* 右侧快捷操作 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetExample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
          title="重置为示范文案"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">示范文案</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-200 mx-1" />

        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Retina 超清导出已就绪</span>
        </div>
      </div>
    </header>
  );
};
