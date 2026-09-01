import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';
import { Sparkles, Feather, Bookmark } from 'lucide-react';

interface TemplateProps {
  data: CardData;
}

export const MinimalMagazine: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#fcfbf9] text-[#1a1a1a] p-8 md:p-10 font-serif border border-neutral-200/80 shadow-2xl">
      {/* 顶部极简网格与期刊头 */}
      <header className="relative z-10">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-neutral-900 rotate-45" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-neutral-600 font-semibold">
              {data.tag || 'WEPOST ESSAY'}
            </span>
          </div>
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
            {data.date || 'VOL. 01'}
          </div>
        </div>

        {/* 副标题与小标题 */}
        {data.subtitle && (
          <div className="pt-3 flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            <Bookmark className="w-3.5 h-3.5 text-neutral-700" />
            <span>{data.subtitle}</span>
          </div>
        )}

        {/* 标题 */}
        {data.title && (
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-neutral-950 leading-[1.3] font-serif">
            {data.title}
          </h1>
        )}
      </header>

      {/* 中间正文主体与首字下沉排版 */}
      <main className="my-auto min-h-0 overflow-hidden py-3 relative z-10">
        <MarkdownRenderer
          content={data.content}
          fontSize={data.fontSize}
          align={data.align}
          accentColor="#171717"
          themeStyle="minimal"
        />
      </main>

      {/* 底部作者、标语与页脚 */}
      <footer className="relative z-10 pt-6 border-t border-neutral-300 flex items-end justify-between text-xs text-neutral-600">
        <div className="space-y-1.5 max-w-[70%]">
          <div className="flex items-center gap-2 font-medium text-neutral-900">
            <Feather className="w-3.5 h-3.5 text-neutral-800" />
            <span className="font-serif text-sm tracking-wide">{data.author || '野生宝藏箱'}</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-sans tracking-normal line-clamp-1">
            {data.footerText || '记录每一次深度思考 · Keep Thinking'}
          </p>
        </div>

        {/* 右侧微水印/排版装饰 */}
        <div className="flex flex-col items-end gap-1">
          {data.showWatermark && (
            <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              <Sparkles className="w-3 h-3 text-neutral-400" />
              <span>{data.watermarkText || 'WEPOST'}</span>
            </div>
          )}
          <div className="w-12 h-1 bg-neutral-900 mt-1" />
        </div>
      </footer>

      {/* 背景微妙水印 */}
      <div className="absolute right-6 top-1/3 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
        <span className="font-serif text-[180px] font-black leading-none text-neutral-950">W</span>
      </div>
    </CardLayout>
  );
};
