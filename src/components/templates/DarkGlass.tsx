import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { Terminal, Shield, Zap, Sparkles } from 'lucide-react';

interface TemplateProps {
  data: CardData;
}

export const DarkGlass: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-[#07090e] text-slate-100 p-10 md:p-12 flex flex-col justify-between select-none relative overflow-hidden font-sans border border-slate-800 shadow-2xl">
      {/* 科技感背景光晕效果 */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 顶部标签与终端感 Header */}
      <header className="relative z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              {data.tag || 'SYSTEM.INSIGHT'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>{data.date || 'SYS_DATE // 2026'}</span>
          </div>
        </div>

        {/* 副标题 */}
        {data.subtitle && (
          <div className="pt-4 text-xs font-mono text-cyan-300/70 uppercase tracking-widest">
            // {data.subtitle}
          </div>
        )}

        {/* 标题 */}
        <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
          {data.title}
        </h1>
      </header>

      {/* 中间毛玻璃卡片与正文内容 */}
      <main className="my-auto py-5 relative z-10">
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-inner">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#38bdf8"
            themeStyle="dark"
          />
        </div>
      </main>

      {/* 底部作者与水印 */}
      <footer className="relative z-10 pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold text-[10px]">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">{data.author || 'WePost 探索者'}</div>
            <div className="text-[11px] text-slate-500 line-clamp-1">{data.footerText || '探索未知 · 链接前沿思考'}</div>
          </div>
        </div>

        {data.showWatermark && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{data.watermarkText || 'WEPOST.AI'}</span>
          </div>
        )}
      </footer>
    </div>
  );
};
