'use client';

import React, { useState, useRef } from 'react';
import { CardData, TemplateId } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import { Header } from '@/components/editor/Header';
import { ContentForm } from '@/components/editor/ContentForm';
import { StyleToolbar } from '@/components/editor/StyleToolbar';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { CardStage } from '@/components/canvas/CardStage';
import { Edit3, Palette, Download, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  const exportTargetRef = useRef<HTMLDivElement>(null);

  const handleUpdateCard = (updates: Partial<CardData>) => {
    setCardData((prev) => ({ ...prev, ...updates }));
  };

  const handleResetExample = () => {
    setCardData(INITIAL_CARD_DATA);
  };

  const handleApplyPresetSample = (type: 'essay' | 'quote' | 'news' | 'note' | 'acid') => {
    switch (type) {
      case 'essay':
        setCardData({
          ...cardData,
          templateId: 'minimal-magazine',
          title: '在喧嚣的时代，重塑深度思考的秩序',
          subtitle: 'THINKING IN DEPTH / 思考碎片',
          tag: '深度阅读',
          content: `真正的专注，不是在安静的环境里做简单的事，而是在充满干扰的世界中守住内心的秩序。\n\n我们每天接收海量的信息碎片，却越来越少体验到思维深潜的愉悦。阅读长文、推演逻辑、写下真实感悟，是抵抗思维退化的终极武器。\n\n> 所谓卓越，就是将平凡的事反复雕琢，直到它泛出理性的光芒。\n\n放慢脚步，给大脑留出留白的时间，让灵感在沉淀中自然生长。`,
          author: 'WePost 研习社',
          date: '2026.08.19 · ISSUE 042',
          footerText: '保持专注 · 持续创造 · 记录真实的世界',
          fontFamily: 'serif',
          aspectRatio: '3:4',
        });
        break;
      case 'quote':
        setCardData({
          ...cardData,
          templateId: 'zen-quote',
          title: '山不让尘，川不辞盈',
          subtitle: '静水流深 · 东方禅思',
          tag: '东方美学',
          content: `万物皆有其时。\n\n急于奔赴结果，往往错过路旁的清风与明月。\n\n> 懂得留白的人，才能在繁芜的生活中寻得内心的从容。\n\n不争亦不随，在自己的时区里安静绽放。`,
          author: '林泉散人',
          date: '岁在丙午 · 秋月',
          footerText: '虚室生白 · 吉祥止止',
          fontFamily: 'serif',
          aspectRatio: '3:4',
        });
        break;
      case 'news':
        setCardData({
          ...cardData,
          templateId: 'vintage-news',
          title: 'AI 时代的自媒体内容创作：从流量追逐到价值深耕',
          subtitle: 'THE DAILY DISPATCH / 晨读参考',
          tag: '行业前瞻',
          content: `当生成式工具让内容生产的边际成本趋近于零，唯有具备独特审美与真实洞察的表达才具备长久生命力。\n\n- 机器提供效率，人类注入温度\n- 信息同质化加速，个人 IP 成为核心护城河\n- 精美排版与克制设计，正重塑读者的阅读信任\n\n> 真正的内容创作者，从不盲从算法，而是用文字重塑算法的世界。`,
          author: '特约观察员',
          date: 'EST. 2026 · NO. 88',
          footerText: '每日晨读 · 见微知著',
          fontFamily: 'serif',
          aspectRatio: '3:4',
        });
        break;
      case 'note':
        setCardData({
          ...cardData,
          templateId: 'warm-memo',
          title: '给今天认真生活的自己点个赞',
          subtitle: 'DAILY JOURNAL / 温暖日常',
          tag: '治愈便签',
          content: `喝了一杯热咖啡，读完了搁置很久的一本书。\n\n生活其实不需要每天都波澜壮阔，那些由一顿热饭、一次散步、一句问候组成的微小瞬间，才是支撑我们走得很远的秘密力量。\n\n> 慢慢来，谁不是一边经历迷茫，一边闪闪发光呢？\n\n今天也辛苦啦，今晚早点睡吧！`,
          author: '温暖收集官',
          date: 'TODAY // 晴朗',
          footerText: '温和对待世界，安静做好自己',
          fontFamily: 'kaiti',
          aspectRatio: '1:1',
        });
        break;
      case 'acid':
        setCardData({
          ...cardData,
          templateId: 'acid-bold',
          title: '打破既定框架，做不被定义的创造者！',
          subtitle: 'BREAK THE RULES // 青年态度',
          tag: '态度先锋',
          content: `如果大家都走同一条路，那终点注定平庸无奇。\n\n保持尖锐，敢于对无趣说不！你的独特，就是你面对这个世界最硬核的底牌。\n\n> 不要等风来，要做卷起风暴的那个人！\n\n- 拒绝标签化人生\n- 永远好奇，永远折腾\n- 为自己的热爱全力以赴`,
          author: '态度先锋队',
          date: '2026 / VOL.09',
          footerText: '拒绝平庸 · 勇敢发声 · DO SOMETHING COOL',
          fontFamily: 'sans',
          aspectRatio: '3:4',
        });
        break;
    }
  };

  return (
    <div className="w-full h-screen h-[100dvh] flex flex-col overflow-hidden bg-neutral-950">
      {/* 顶部固定导航 */}
      <Header onResetExample={handleResetExample} />

      {/* 主体工作台 (严格占满剩余高度，禁止外层滚动) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧控制区 (独立内部滚动) */}
        <aside className="w-full lg:w-[460px] xl:w-[500px] h-full flex flex-col flex-shrink-0 min-h-0 overflow-hidden border-r border-neutral-200 bg-white text-neutral-900 z-10 shadow-lg">
          {/* 导航标签切换 */}
          <div className="flex border-b border-neutral-200 px-4 pt-3 bg-neutral-50/70 flex-shrink-0">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>文案编辑</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'style'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>风格与排版</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'export'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出与复制</span>
            </button>
          </div>

          {/* 表单内容滚动区 (仅此处内部滚动) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {activeTab === 'content' && (
              <ContentForm
                data={cardData}
                onChange={handleUpdateCard}
                onApplyPresetSample={handleApplyPresetSample}
              />
            )}

            {activeTab === 'style' && (
              <StyleToolbar data={cardData} onChange={handleUpdateCard} />
            )}

            {activeTab === 'export' && (
              <ExportPanel data={cardData} renderTargetId="wepost-card-export-target" />
            )}
          </div>
        </aside>

        {/* 右侧实时画板区域 (自适应一屏显示，禁止任何外部滚动) */}
        <main className="flex-1 min-w-0 h-full flex flex-col min-h-0 overflow-hidden">
          <CardStage data={cardData} renderRef={exportTargetRef} />
        </main>
      </div>
    </div>
  );
}
