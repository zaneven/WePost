import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';

interface TemplateProps {
  data: CardData;
}

/**
 * 先锋杂志：纯白纸面、粗黑顶饰条、大写无衬线粗体与红色点缀，国际主义排版。
 * 正文复用 'minimal' 主题（中性灰、细线），视觉差异由粗黑骨架与红色块提供。
 */
export const EditorialBold: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-white text-[#0a0a0a] p-9 md:p-12 font-sans border-t-8 border-[#dc2626] shadow-2xl">
      <header className="relative z-10">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[#dc2626]">
            <span className="w-2.5 h-2.5 bg-[#dc2626]" />
            {data.tag || 'OPINION'}
          </span>
          <span className="text-[11px] font-mono font-bold text-neutral-500">
            {data.date || 'ISSUE 042'}
          </span>
        </div>

        {data.subtitle && (
          <div className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
            {data.subtitle}
          </div>
        )}

        {data.title && (
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-black leading-[1.1] uppercase">
            {data.title}
          </h1>
        )}
      </header>

      <main className="my-auto py-7 relative z-10">
        <div className="max-w-lg mx-auto border-l-2 border-black/15 pl-5">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#dc2626"
            themeStyle="minimal"
          />
        </div>
      </main>

      <footer className="relative z-10 pt-5 border-t-2 border-black flex items-end justify-between text-xs">
        <div className="min-w-0">
          <div className="font-black text-black tracking-wide">{data.author || '野生宝藏箱'}</div>
          <div className="text-[11px] text-neutral-500 line-clamp-1">
            {data.footerText || '以文字，重塑算法的世界'}
          </div>
        </div>

        {data.showWatermark && (
          <span className="font-mono font-bold text-[10px] tracking-widest text-neutral-400 flex-shrink-0">
            {data.watermarkText || 'WEPOST'}
          </span>
        )}
      </footer>
    </CardLayout>
  );
};
