import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';
import { Zap, Flame } from 'lucide-react';

interface TemplateProps {
  data: CardData;
}

export const AcidBold: React.FC<TemplateProps> = ({ data }) => {
  return (
    <CardLayout className="bg-[#facc15] text-black p-8 md:p-10 font-sans border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* 顶部态度标签 */}
      <header className="relative z-10">
        <div className="flex items-center justify-between pb-4">
          <div className="inline-flex items-center gap-1.5 bg-black text-[#facc15] px-3 py-1 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
            <Flame className="w-3.5 h-3.5" />
            <span>{data.tag || 'HOT TOPIC // 态度'}</span>
          </div>

          <div className="bg-white border-2 border-black px-2.5 py-0.5 text-xs font-mono font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {data.date || '2026 / POST'}
          </div>
        </div>

        {/* 副标题 */}
        {data.subtitle && (
          <div className="pt-2 text-xs font-black uppercase tracking-widest text-black/80">
            ★ {data.subtitle}
          </div>
        )}

        {/* 标题 */}
        <div className="mt-3 bg-white border-3 border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          {data.title && (
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-black leading-tight">
              {data.title}
            </h1>
          )}
        </div>
      </header>

      {/* 中间正文 */}
      <main className="my-auto py-4 relative z-10">
        <div className="bg-white/90 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor="#000000"
            themeStyle="acid"
          />
        </div>
      </main>

      {/* 底部作者与标语 */}
      <footer className="relative z-10 pt-2 flex items-center justify-between text-xs font-bold border-t-2 border-black">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#facc15]" />
          </div>
          <div>
            <div className="font-black text-black">{data.author || '野生宝藏箱'}</div>
            <div className="text-[10px] text-black/70 line-clamp-1">{data.footerText || '拒绝平庸 · 勇敢发声'}</div>
          </div>
        </div>

        {data.showWatermark && (
          <div className="bg-black text-white px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest">
            {data.watermarkText || 'WEPOST ACID'}
          </div>
        )}
      </footer>
    </CardLayout>
  );
};
