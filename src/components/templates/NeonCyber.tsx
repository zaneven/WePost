import React from 'react';
import { CardData } from '@/types/card';
import { MarkdownRenderer } from '../canvas/MarkdownRenderer';
import { CardLayout } from '../canvas/CardLayout';

interface TemplateProps {
  data: CardData;
}

/**
 * 霓虹赛博：近黑底色、网格光晕、青紫渐变发光文字与霓虹边框玻璃面板，未来赛博质感。
 * 正文复用 'dark' 主题（青色代码块），霓虹发光由外壳的内联样式提供。
 */
export const NeonCyber: React.FC<TemplateProps> = ({ data }) => {
  const cyan = '#22d3ee';
  const fuchsia = '#e879f9';

  return (
    <CardLayout className="bg-[#08080f] text-slate-100 p-9 md:p-12 font-sans border border-[#1e1e3f] shadow-2xl">
      {/* 网格背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(#3b3b6b 1px, transparent 1px), linear-gradient(90deg, #3b3b6b 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* 双色光晕 */}
      <div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${fuchsia}22, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cyan}22, transparent 70%)` }}
      />

      <header className="relative z-10">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a4a]">
          <span
            className="text-xs font-mono uppercase tracking-[0.35em]"
            style={{ color: cyan, textShadow: `0 0 8px ${cyan}88` }}
          >
            {data.tag || 'SYS.NET'}
          </span>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-full border border-[#2a2a4a]">
            {data.date || '2049.07'}
          </span>
        </div>

        {data.subtitle && (
          <div className="mt-3 text-xs font-mono tracking-widest uppercase" style={{ color: fuchsia }}>
            {'> '}
            {data.subtitle}
          </div>
        )}

        <h1
          className="mt-2 text-2xl md:text-3xl font-black tracking-tight leading-snug bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(90deg, ${cyan}, ${fuchsia})`,
            textShadow: `0 0 24px ${cyan}33`,
          }}
        >
          {data.title}
        </h1>
      </header>

      <main className="my-auto py-6 relative z-10">
        <div
          className="rounded-xl p-5 border bg-white/[0.03] backdrop-blur-sm"
          style={{
            borderColor: `${cyan}44`,
            boxShadow: `0 0 24px ${cyan}22, inset 0 0 16px ${fuchsia}11`,
          }}
        >
          <MarkdownRenderer
            content={data.content}
            fontSize={data.fontSize}
            align={data.align}
            accentColor={cyan}
            themeStyle="dark"
          />
        </div>
      </main>

      <footer className="relative z-10 pt-4 border-t border-[#2a2a4a] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: cyan, boxShadow: `0 0 8px ${cyan}` }}
          />
          <span className="text-slate-200 font-semibold flex-shrink-0">
            {data.author || 'NEON.OPERATOR'}
          </span>
          <span className="text-slate-600 flex-shrink-0">·</span>
          <span className="line-clamp-1">{data.footerText || 'jack in · ride the signal'}</span>
        </div>

        {data.showWatermark && (
          <span
            className="font-mono tracking-widest text-[10px] px-2 py-0.5 rounded border flex-shrink-0"
            style={{
              color: fuchsia,
              borderColor: `${fuchsia}66`,
              textShadow: `0 0 8px ${fuchsia}88`,
            }}
          >
            {data.watermarkText || 'WEPOST.NET'}
          </span>
        )}
      </footer>
    </CardLayout>
  );
};
