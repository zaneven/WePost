import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';

interface TemplateProps {
  data: CardData;
}

/**
 * 水墨留白：宣纸米黄底纹、淡墨大字镇纸水印、朱砂方印与竖向留白，东方书卷气。
 * 正文复用 'zen' 主题（细边竖线 + 斜体引用），视觉差异由外壳与朱砂点缀提供。
 */
export const InkWash: React.FC<TemplateProps> = ({ data }) => {
  // 取标题首字作背景淡墨水印（镇纸感）
  const bgChar = (data.title || '墨')[0];

  return (
    <CardLayout className="bg-[#f5f1e6] text-[#1c1917] p-10 md:p-14 font-serif border border-stone-300/60 shadow-2xl">
      {/* 背景大字淡墨水印 */}
      <span className="absolute -right-6 -bottom-12 text-[280px] leading-none font-serif text-stone-900/[0.05] select-none pointer-events-none">
        {bgChar}
      </span>
      {/* 右上朱砂竖条 */}
      <span className="absolute top-8 right-8 w-3 h-16 bg-[#9b2222] rounded-sm" />

      <header className="relative z-10">
        <div className="flex items-center gap-2 pb-5 border-b border-stone-400/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9b2222]" />
          <span className="text-xs tracking-[0.4em] uppercase text-stone-600 font-serif">
            {data.tag || '水墨 · 留白'}
          </span>
        </div>

        {data.title && (
          <h1 className="mt-5 text-3xl md:text-4xl font-normal tracking-wide text-stone-900 leading-[1.35] font-serif">
            {data.title}
          </h1>
        )}

        {data.subtitle && (
          <div className="mt-3 text-xs tracking-[0.25em] text-stone-500 font-serif">
            — {data.subtitle}
          </div>
        )}
      </header>

      <main className="my-auto py-8 relative z-10">
        <div className="max-w-xl mx-auto pl-5 border-l-2 border-stone-400/50">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#9b2222"
            themeStyle="zen"
          />
        </div>
      </main>

      <footer className="relative z-10 pt-6 border-t border-stone-400/40 flex items-end justify-between text-xs text-stone-700">
        <div className="space-y-1">
          <div className="text-sm font-serif tracking-widest text-stone-800">
            {data.author || '野生宝藏箱'}
          </div>
          <div className="text-[11px] text-stone-500 tracking-wider">
            {data.footerText || '虚室生白 · 吉祥止止'}
          </div>
          {data.date && (
            <div className="text-[11px] text-stone-400 font-serif mt-1">{data.date}</div>
          )}
        </div>

        {/* 朱砂方印（取水印前 2 字，由 showWatermark 统一控制） */}
        {data.showWatermark && (
          <div className="w-11 h-11 border-2 border-[#9b2222] rounded-sm flex items-center justify-center p-1 text-[#9b2222] font-serif text-[13px] font-bold tracking-tighter leading-none select-none rotate-2">
            {(data.watermarkText || '清心').slice(0, 2)}
          </div>
        )}
      </footer>
    </CardLayout>
  );
};
