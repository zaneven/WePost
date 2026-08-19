import React from 'react';
import { Layers, Sparkles, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onResetExample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetExample }) => {
  return (
    <header className="h-14 border-b border-neutral-800/90 bg-neutral-950/95 backdrop-blur-xl sticky top-0 z-50 px-5 flex items-center justify-between text-neutral-100 flex-shrink-0">
      {/* 左侧 Logo 与品牌 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">WePost</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800/80 text-emerald-400 font-semibold border border-neutral-700/60">
              Studio
            </span>
          </div>
        </div>
      </div>

      {/* 右侧快捷操作与状态 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onResetExample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 rounded-lg transition-all"
          title="重置为示范文案"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">示范文案</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-0.5 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Retina 2x/3x 超清已就绪</span>
        </div>
      </div>
    </header>
  );
};
