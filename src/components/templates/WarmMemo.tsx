import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';
import { Sun, Heart, Coffee, Pin } from 'lucide-react';

interface TemplateProps {
  data: CardData;
}

export const WarmMemo: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#fbf7ee] text-[#44382c] p-8 md:p-11 font-sans border border-amber-200/80 shadow-2xl">
      {/* 顶部半透明拟物胶带效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-amber-200/40 backdrop-blur-sm border-x border-amber-300/40 -rotate-1 shadow-sm pointer-events-none z-20" />

      {/* 顶部标题与日期 */}
      <header className="relative z-10 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>{data.tag || '今日碎碎念'}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-amber-800/70 font-mono">
            <Coffee className="w-3.5 h-3.5" />
            <span>{data.date || 'TODAY / NOTE'}</span>
          </div>
        </div>

        {/* 副标题 */}
        {data.subtitle && (
          <div className="pt-3 text-xs text-amber-700/80 font-medium tracking-wide">
            ~ {data.subtitle} ~
          </div>
        )}

        {/* 标题 */}
        {data.title && (
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-[#2d241c] leading-snug">
            {data.title}
          </h1>
        )}
      </header>

      {/* 中间便签白卡片 */}
      <main className="my-auto min-h-0 overflow-hidden py-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-sm relative">
          <Pin className="w-4 h-4 text-amber-500 absolute -top-2 right-6 -rotate-12" />
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#d97706"
            themeStyle="warm"
          />
        </div>
      </main>

      {/* 底部作者与标语 */}
      <footer className="relative z-10 pt-2 flex items-center justify-between text-xs text-amber-900/70 border-t border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800">
            <Heart className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div>
            <div className="font-bold text-[#352c23]">{data.author || '野生宝藏箱'}</div>
            <div className="text-[11px] text-amber-800/60 line-clamp-1">{data.footerText || '温和对待世界，安静做好自己'}</div>
          </div>
        </div>

        {data.showWatermark && (
          <div className="font-mono text-[11px] text-amber-700/60 bg-amber-100/60 px-2 py-0.5 rounded">
            {data.watermarkText || 'DAILY MEMO'}
          </div>
        )}
      </footer>
    </CardLayout>
  );
};
