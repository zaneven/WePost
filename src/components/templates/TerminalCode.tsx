import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';

interface TemplateProps {
  data: CardData;
}

/**
 * 终端代码：深色终端窗口、红黄绿信号灯、行号槽与等宽字体，极客开发笔记。
 * 正文复用 'dark' 主题（青色代码块、石板引用边）。
 */
export const TerminalCode: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#0a0e14] text-[#c9d1d9] p-8 md:p-10 font-mono border border-[#1f2630] shadow-2xl">
      {/* 终端窗口顶栏 */}
      <header className="relative z-10">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1f2630]">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-[11px] text-[#6e7681] tracking-wide truncate">
            {data.subtitle || '~/wepost — zsh'}
          </span>
          <span className="ml-auto text-[11px] text-[#6e7681]">{data.date || 'commit'}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7ee787]">
          <span className="text-[#27c93f]">$</span>
          <span className="tracking-widest uppercase">{data.tag || 'dev.note'}</span>
        </div>

        <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
          <span className="text-[#6e7681]"># </span>
          {data.title}
        </h1>
      </header>

      {/* 正文：代码面板 + 行号槽 */}
      <main className="my-auto py-5 relative z-10">
        <div className="rounded-lg bg-[#0d1117] border border-[#1f2630] p-5 pl-9 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-7 border-r border-[#1f2630] flex flex-col items-center pt-5 text-[10px] text-[#3b424d] select-none gap-[2px]">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i}>{String(i + 1).padStart(2, '0')}</span>
            ))}
          </div>
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#27c93f"
            themeStyle="dark"
          />
        </div>
      </main>

      <footer className="relative z-10 pt-4 border-t border-[#1f2630] flex items-center justify-between text-[11px] text-[#6e7681]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#27c93f] flex-shrink-0">{'>'}</span>
          <span className="text-[#c9d1d9] font-semibold flex-shrink-0">{data.author || 'dev@wepost'}</span>
          <span className="text-[#3b424d] flex-shrink-0">·</span>
          <span className="line-clamp-1">{data.footerText || 'ship · learn · repeat'}</span>
        </div>

        {data.showWatermark && (
          <span className="px-2 py-0.5 rounded border border-[#1f2630] text-[#7ee787] tracking-widest text-[10px] flex-shrink-0">
            {data.watermarkText || 'WEPOST.DEV'}
          </span>
        )}
      </footer>
    </CardLayout>
  );
};
