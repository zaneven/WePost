import React from 'react';
import { CardData, TemplateId } from '@/types/card';

/**
 * 单页标题模式封面卡：第一页不渲染正文，仅呈现大标题的「封面页」。
 *
 * 布局为统一的封面骨架（顶部 tag / 期数 → 中部超大标题 + 副标题 → 底部署名 / 标语 / 水印），
 * 视觉风格按当前模板逐款适配（底色 / 文字色 / 强调色 / 装饰元素），字号显著大于正文卡。
 * 渲染于 CardRenderer 根节点内，自动继承用户所选卡片字体（.wepost-card-font 覆盖）。
 */

interface CoverTheme {
  /** 外层容器类（底色 / 文字色 / 内边距） */
  wrapper: string;
  /** 顶部 meta 行（tag / 期数）样式 */
  meta: string;
  /** 超大标题样式 */
  title: string;
  /** 副标题样式 */
  subtitle: string;
  /** 底部署名 / 标语样式 */
  footer: string;
  /** 强调色（装饰 / 分隔线 / 水印） */
  accent: string;
  /** 模板专属装饰（渲染在标题上方 / 下方） */
  decor?: (accent: string, data: CardData) => React.ReactNode;
}

const COVER_THEMES: Record<TemplateId, CoverTheme> = {
  'minimal-magazine': {
    wrapper: 'bg-[#fcfbf9] text-[#1a1a1a] p-10 border border-neutral-200/80 shadow-2xl',
    meta: 'font-mono text-xs tracking-[0.3em] uppercase text-neutral-600',
    title: 'text-[52px] leading-[1.12] font-bold tracking-tight text-neutral-950',
    subtitle: 'mt-5 text-lg font-mono uppercase tracking-[0.25em] text-neutral-500',
    footer: 'text-xs text-neutral-600 border-t border-neutral-300 pt-5',
    accent: '#171717',
    decor: (accent) => (
      <>
        <div className="mb-6 h-[3px] w-16" style={{ backgroundColor: accent }} />
        <div className="mt-7 h-px w-full bg-neutral-300" />
      </>
    ),
  },
  'dark-glass': {
    wrapper:
      'bg-[#07090e] text-slate-100 p-10 border border-slate-800 shadow-2xl overflow-hidden',
    meta: 'font-mono text-xs tracking-[0.3em] uppercase text-cyan-300/80',
    title: 'text-[52px] leading-[1.12] font-bold tracking-tight text-white',
    subtitle: 'mt-5 text-lg tracking-[0.2em] text-slate-400',
    footer: 'text-xs text-slate-400 border-t border-slate-800 pt-5',
    accent: '#22d3ee',
    decor: () => (
      <>
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
        />
        <div className="mb-6 h-[2px] w-14 bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
      </>
    ),
  },
  'vintage-news': {
    wrapper: 'bg-[#f6eee3] text-[#3d2e1e] p-10 shadow-2xl',
    meta: 'font-mono text-xs tracking-[0.25em] uppercase text-[#8a6f4d]',
    title: 'text-[48px] leading-[1.18] font-bold tracking-tight text-[#2c2416]',
    subtitle: 'mt-5 text-base font-mono uppercase tracking-[0.2em] text-[#8a6f4d]',
    footer: 'text-xs text-[#6b5836] border-t-2 border-[#3d2e1e]/40 pt-5',
    accent: '#3d2e1e',
    decor: () => (
      <div className="absolute inset-3 border-2 border-[#3d2e1e]/50 pointer-events-none" />
    ),
  },
  'warm-memo': {
    wrapper: 'bg-[#fbf7ee] text-[#44382c] p-10 border border-amber-200/80 shadow-2xl',
    meta: 'text-xs font-medium tracking-[0.2em] uppercase text-amber-700/80',
    title: 'text-[50px] leading-[1.15] font-bold tracking-tight text-[#3a2f24]',
    subtitle: 'mt-5 text-lg tracking-wide text-amber-800/70',
    footer: 'text-xs text-amber-900/70 border-t border-amber-200 pt-5',
    accent: '#d97706',
    decor: () => (
      <div className="mb-5 text-[72px] leading-none text-amber-500/30 font-serif select-none">
        ”
      </div>
    ),
  },
  'zen-quote': {
    wrapper: 'bg-[#fbfbfa] text-[#1c1917] p-12 border border-stone-200 shadow-2xl',
    meta: 'font-mono text-[11px] tracking-[0.4em] uppercase text-stone-500',
    title: 'text-[46px] leading-[1.25] font-medium tracking-wide text-stone-800',
    subtitle: 'mt-6 text-base tracking-[0.35em] text-stone-400',
    footer: 'text-xs text-stone-500',
    accent: '#1c1917',
    decor: () => (
      <div className="mb-8 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rotate-45 bg-stone-800" />
        <span className="w-10 h-px bg-stone-300" />
      </div>
    ),
  },
  'acid-bold': {
    wrapper:
      'bg-[#facc15] text-black p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    meta: 'font-mono text-xs font-black tracking-[0.25em] uppercase',
    title: 'text-[54px] leading-[1.08] font-black tracking-tight uppercase',
    subtitle: 'mt-5 text-lg font-black tracking-[0.15em] uppercase',
    footer: 'text-xs font-bold border-t-4 border-black pt-5',
    accent: '#000000',
    decor: () => <div className="mb-6 h-3 w-20 bg-black" />,
  },
  'ink-wash': {
    wrapper: 'bg-[#f5f1e6] text-[#1c1917] p-12 border border-stone-300/60 shadow-2xl',
    meta: 'font-mono text-xs tracking-[0.35em] text-stone-500',
    title: 'text-[48px] leading-[1.2] font-bold tracking-wide text-stone-900',
    subtitle: 'mt-6 text-lg tracking-[0.3em] text-stone-500',
    footer: 'text-xs text-stone-600 border-t border-stone-300/60 pt-5',
    accent: '#b91c1c',
    decor: (_accent, data) => (
      <div className="absolute top-10 right-10 flex flex-col items-center gap-3">
        {/* 朱砂方印：取署名 / 水印前 2 字 */}
        <div
          className="w-14 h-14 flex items-center justify-center text-white text-xl font-bold rounded-sm"
          style={{ backgroundColor: '#b91c1c' }}
        >
          {(data.watermarkText || data.author || '清心').slice(0, 2)}
        </div>
        <div className="w-px h-24 bg-stone-400/50" />
      </div>
    ),
  },
  'terminal-code': {
    wrapper: 'bg-[#0a0e14] text-[#c9d1d9] p-10 border border-[#1f2630] shadow-2xl',
    meta: 'font-mono text-xs tracking-[0.2em] text-emerald-400/80',
    title: 'text-[44px] leading-[1.2] font-bold tracking-tight text-[#e6edf3] font-mono',
    subtitle: 'mt-5 text-base font-mono text-slate-500',
    footer: 'text-xs font-mono text-slate-500 border-t border-[#1f2630] pt-5',
    accent: '#3fb950',
    decor: () => (
      <>
        {/* 终端窗口圆点 */}
        <div className="mb-8 flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-2xl font-bold text-emerald-400">$&nbsp;</span>
      </>
    ),
  },
  'editorial-bold': {
    wrapper: 'bg-white text-[#0a0a0a] p-10 border-t-8 border-[#dc2626] shadow-2xl',
    meta: 'font-mono text-xs tracking-[0.3em] uppercase text-[#dc2626]',
    title: 'text-[52px] leading-[1.1] font-black tracking-tight text-[#0a0a0a]',
    subtitle: 'mt-5 text-lg font-bold tracking-[0.15em] uppercase text-neutral-500',
    footer: 'text-xs text-neutral-600 border-t-2 border-neutral-900 pt-5',
    accent: '#dc2626',
    decor: () => <div className="mb-6 w-14 h-2 bg-[#dc2626]" />,
  },
  'neon-cyber': {
    wrapper: 'bg-[#08080f] text-slate-100 p-10 border border-[#1e1e3f] shadow-2xl overflow-hidden',
    meta: 'font-mono text-xs tracking-[0.3em] uppercase text-cyan-300',
    title: 'text-[50px] leading-[1.12] font-bold tracking-tight text-white [text-shadow:0_0_24px_rgba(34,211,238,0.45)]',
    subtitle: 'mt-5 text-base font-mono tracking-[0.25em] text-fuchsia-400/90',
    footer: 'text-xs font-mono text-slate-400 border-t border-[#1e1e3f] pt-5',
    accent: '#22d3ee',
    decor: () => (
      <>
        <div
          className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #e879f9 0%, transparent 70%)' }}
        />
        <div className="mb-6 flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <span className="h-px w-16 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
        </div>
      </>
    ),
  },
};

export const TitleCard: React.FC<{ data: CardData }> = ({ data }) => {
  const theme = COVER_THEMES[data.templateId] ?? COVER_THEMES['minimal-magazine'];
  const accent = theme.accent;

  return (
    <div
      className={`w-full h-full flex flex-col justify-between relative overflow-hidden select-none ${theme.wrapper}`}
    >
      {/* 顶部：分类标签 + 日期 / 期数 */}
      <header className="relative z-10 flex items-start justify-between gap-4">
        <span className={theme.meta}>{data.tag || 'WEPOST'}</span>
        {data.date && (
          <span className={`${theme.meta} opacity-70 flex-shrink-0`}>{data.date}</span>
        )}
      </header>

      {/* 中部：超大标题 + 副标题 */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-center py-8 break-words">
        {theme.decor?.(accent, data)}
        <h1 className={theme.title}>{data.title || '输入标题'}</h1>
        {data.subtitle && <p className={theme.subtitle}>{data.subtitle}</p>}
      </main>

      {/* 底部：署名 / 标语 + 品牌水印 */}
      <footer className={`relative z-10 flex items-end justify-between gap-4 ${theme.footer}`}>
        <div className="min-w-0">
          {data.author && (
            <div className="font-semibold text-sm tracking-wide truncate">{data.author}</div>
          )}
          {data.footerText && <div className="mt-1 truncate opacity-80">{data.footerText}</div>}
        </div>
        {data.showWatermark && (
          <span
            className="flex-shrink-0 text-[10px] font-mono tracking-[0.25em] uppercase opacity-70"
            style={{ color: accent }}
          >
            {data.watermarkText || 'WEPOST'}
          </span>
        )}
      </footer>
    </div>
  );
};
