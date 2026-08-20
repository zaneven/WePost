import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';

interface TemplateProps {
  data: CardData;
}

export const ZenQuote: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#fbfbfa] text-[#1c1917] p-12 md:p-16 font-serif border border-stone-200 shadow-2xl">
      {/* 顶部极简朱砂红点缀 */}
      <header className="relative z-10">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-700" />
            <span className="text-xs tracking-[0.4em] uppercase text-stone-500 font-serif">
              {data.tag || '留白 · 诗意'}
            </span>
          </div>

          <span className="text-xs font-serif tracking-widest text-stone-400">
            {data.date || '岁在丙午'}
          </span>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-normal tracking-wide text-stone-900 leading-[1.4] font-serif pt-2">
          {data.title}
        </h1>

        {data.subtitle && (
          <div className="pt-3 text-xs tracking-[0.25em] text-stone-500 font-serif">
            — {data.subtitle}
          </div>
        )}
      </header>

      {/* 中间正文 */}
      <main className="my-auto py-8 relative z-10">
        <div className="max-w-xl mx-auto pl-4 border-l border-stone-300/80">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#b91c1c"
            themeStyle="zen"
          />
        </div>
      </main>

      {/* 底部印章与落款 */}
      <footer className="relative z-10 pt-6 flex items-end justify-between text-xs text-stone-600">
        <div className="space-y-1">
          <div className="text-sm font-serif tracking-widest text-stone-800">
            {data.author || '山间客'}
          </div>
          <div className="text-[11px] text-stone-400 tracking-wider">
            {data.footerText || '静水流深 · 虚室生白'}
          </div>
        </div>

        {/* 朱砂红印章 */}
        <div className="w-10 h-10 border-2 border-red-700/80 rounded flex items-center justify-center p-1 text-red-700 font-serif text-[11px] font-bold tracking-tighter leading-none select-none">
          {data.watermarkText?.slice(0, 4) || '清心'}
        </div>
      </footer>
    </CardLayout>
  );
};
