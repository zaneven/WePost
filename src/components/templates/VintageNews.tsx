import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';
import { Newspaper, Award, Calendar } from 'lucide-react';

interface TemplateProps {
  data: CardData;
}

export const VintageNews: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#f6eee3] text-[#2c2416] p-8 md:p-10 font-serif border-4 border-[#3d2e1e] shadow-2xl">
      {/* 报纸双细线内边框 */}
      <div className="absolute inset-2 border border-[#8a7258] pointer-events-none" />

      {/* 报头区 */}
      <header className="relative z-10 pt-2 text-center">
        <div className="flex items-center justify-between border-b-2 border-[#3d2e1e] pb-2 text-[11px] font-sans uppercase font-bold tracking-widest text-[#6d543b]">
          <div className="flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-[#3d2e1e]" />
            <span>{data.tag || 'DAILY DISPATCH'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#3d2e1e]" />
            <span>{data.date || 'EST. 2026 · NO. 88'}</span>
          </div>
        </div>

        {/* 报纸大刊头 */}
        <div className="py-2 border-b border-[#3d2e1e] flex items-center justify-center gap-3">
          <div className="h-[1px] bg-[#3d2e1e] flex-1" />
          <span className="font-serif text-sm md:text-base tracking-[0.25em] font-black uppercase text-[#3d2e1e]">
            {data.subtitle || 'THE WEPOST CHRONICLE'}
          </span>
          <div className="h-[1px] bg-[#3d2e1e] flex-1" />
        </div>

        {/* 主标题 */}
        {data.title && (
          <h1 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-[#22170c] leading-[1.25] px-2 font-serif">
            {data.title}
          </h1>
        )}
      </header>

      {/* 中间正文 */}
      <main className="my-auto py-4 relative z-10 px-2">
        <div className="border-t border-b border-[#c4ab8f] py-4">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#854d0e"
            themeStyle="vintage"
          />
        </div>
      </main>

      {/* 底部印章与作者署名 */}
      <footer className="relative z-10 pb-2 px-2 flex items-center justify-between text-xs text-[#594430]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded border border-[#854d0e] flex items-center justify-center text-[#854d0e]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#2c2416] tracking-wide">{data.author || '野生宝藏箱'}</div>
            <div className="text-[10px] text-[#78614a] line-clamp-1">{data.footerText || '晨起读好文 · 见微知著'}</div>
          </div>
        </div>

        {data.showWatermark && (
          <div className="border-2 border-dashed border-[#854d0e]/60 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest text-[#854d0e] uppercase">
            {data.watermarkText || 'VERIFIED'}
          </div>
        )}
      </footer>
    </CardLayout>
  );
};
