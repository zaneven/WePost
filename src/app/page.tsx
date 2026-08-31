'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CardData } from '@/types/card';
import { INITIAL_CARD_DATA, getMobileStageHeightVh } from '@/core/templates/registry';
import { buildPresetData, type PresetType } from '@/data/presets';
import { useCardHistory } from '@/lib/useCardHistory';
import { useCardsOverflow } from '@/lib/useCardOverflow';
import { loadCardDataFromHash } from '@/lib/cardImport';
import {
  splitContentIntoCards,
  splitContentByDivider,
  type SplitMode,
} from '@/core/split/splitContent';
import { recommendStyle } from '@/core/match/recommendStyle';
import { useToast } from '@/components/ui/Toast';
import { Header } from '@/components/editor/Header';
import { ContentForm } from '@/components/editor/ContentForm';
import { StyleToolbar } from '@/components/editor/StyleToolbar';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { CardStage } from '@/components/canvas/CardStage';
import { BottomActionBar } from '@/components/editor/BottomActionBar';
import { SettingsPanel } from '@/components/editor/SettingsPanel';
import { SplitPanel } from '@/components/editor/SplitPanel';
import { useCardExport, DEFAULT_EXPORT_CONFIG } from '@/lib/useCardExport';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { Edit3, Palette, Download, Scissors } from 'lucide-react';

const STORAGE_KEY = 'wepost:card-data:v1';
const SPLIT_MODE_KEY = 'wepost:split-mode:v1';

/** 从 localStorage 读取上次编辑内容，与默认值合并以保证字段完整 */
function loadPersistedCardData(): CardData {
  if (typeof window === 'undefined') return INITIAL_CARD_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CARD_DATA;
    const parsed = JSON.parse(raw) as Partial<CardData>;
    return { ...INITIAL_CARD_DATA, ...parsed };
  } catch {
    return INITIAL_CARD_DATA;
  }
}

/** 从 localStorage 读取上次拆分模式（非法值回退自动拆分） */
function loadPersistedSplitMode(): SplitMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const raw = window.localStorage.getItem(SPLIT_MODE_KEY);
    return raw === 'divider' ? 'divider' : 'auto';
  } catch {
    return 'auto';
  }
}

export default function HomePage() {
  const history = useCardHistory<CardData>(INITIAL_CARD_DATA);
  const cardData = history.present;
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  // 布局分流：大屏三栏（文案 | 画板 | Figma 式参数栏），小屏沿用三 Tab 布局
  const isDesktop = useIsDesktop();
  // 导出配置在卡片 hover 操作与配置面板间共享（单一数据源）
  const cardExport = useCardExport(DEFAULT_EXPORT_CONFIG);
  // 移动端画板高度：按当前比例智能分配（竖屏更高、宽幅更小）
  const mobileStageHeightVh = getMobileStageHeightVh(cardData.aspectRatio);
  const toast = useToast();

  // 拆分模式为常驻必选项（默认自动拆分），选择持久化到 localStorage。
  // 左侧编辑区始终编辑完整正文，拆分结果由 content + 模式 + 画幅 + 字号 + 模板实时推导。
  const [splitMode, setSplitMode] = useState<SplitMode>('auto');
  // 挂载恢复完成后才允许写回持久化，避免初始 'auto' 在恢复读取前覆盖已存的模式
  const [splitModeHydrated, setSplitModeHydrated] = useState(false);

  const chunks = useMemo(() => {
    return splitMode === 'divider'
      ? splitContentByDivider(cardData.content)
      : splitContentIntoCards(cardData.content, {
          aspectRatio: cardData.aspectRatio,
          fontSize: cardData.fontSize,
          templateId: cardData.templateId,
        });
  }, [
    cardData.content,
    cardData.aspectRatio,
    cardData.fontSize,
    cardData.templateId,
    splitMode,
  ]);

  // 检测是否有卡片内容溢出画板（被裁切），用于编辑区与拆分面板预警
  const isOverflowing = useCardsOverflow(chunks.length, cardData);

  // 基于当前内容的风格推荐（纯启发式，无 AI / 后端）
  const recommendation = useMemo(
    () => recommendStyle(cardData.content),
    [cardData.content]
  );

  // 客户端挂载后恢复数据（replace 不入历史栈，避免污染撤销）。
  // 优先级：URL hash 注入（#card=<base64url>）> localStorage 上次编辑 > 默认示例。
  // 这样 wepost-card-gen skill 生成的预填充链接可在挂载瞬间直接渲染卡片。
  // 注：hash 注入时同步落盘 localStorage——React 18 StrictMode（reactStrictMode=true）
  // 会双调用本 effect：首次消费 hash 并替换为注入值，第二次 hash 已被消费而回退到
  // localStorage；同步写入保证第二次也能读回最新注入值，避免被陈旧 localStorage 覆盖。
  useEffect(() => {
    const fromHash = loadCardDataFromHash();
    if (fromHash) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fromHash));
      } catch {
        // 容量超限或隐私模式，静默忽略
      }
      history.replace(fromHash);
    } else {
      history.replace(loadPersistedCardData());
    }
    setSplitMode(loadPersistedSplitMode());
    setSplitModeHydrated(true);
    // 仅执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 拆分模式持久化（挂载恢复完成后才写回）
  useEffect(() => {
    if (!splitModeHydrated) return;
    try {
      window.localStorage.setItem(SPLIT_MODE_KEY, splitMode);
    } catch {
      // 隐私模式等，静默忽略
    }
  }, [splitMode, splitModeHydrated]);

  // 持久化：防抖写入 localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cardData));
      } catch {
        // 容量超限或隐私模式，静默忽略
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [cardData]);

  // 全局撤销 / 重做快捷键 (Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z 或 Y)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        history.redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [history]);

  const handleUpdateCard = useCallback(
    (updates: Partial<CardData>) => {
      history.set((prev) => ({ ...prev, ...updates }));
    },
    [history]
  );

  const handleResetExample = useCallback(() => {
    history.set(INITIAL_CARD_DATA, { immediate: true });
  }, [history]);

  const handleApplyPresetSample = useCallback(
    (type: PresetType) => {
      history.set(buildPresetData(cardData, type), { immediate: true });
    },
    [cardData, history]
  );

  // 一键应用智能匹配推荐（模板 / 画幅 / 字体）
  const handleSmartMatch = useCallback(() => {
    history.set(
      {
        ...cardData,
        templateId: recommendation.templateId,
        aspectRatio: recommendation.aspectRatio,
        fontFamily: recommendation.fontFamily,
      },
      { immediate: true }
    );
    toast.show(`已应用：${recommendation.reason}`, 'success');
  }, [cardData, recommendation, history, toast]);

  const splitPanel = (surface: 'light' | 'dark') => (
    <SplitPanel
      surface={surface}
      splitMode={splitMode}
      onSplitModeChange={setSplitMode}
      cardCount={chunks.length}
      isOverflowing={isOverflowing}
    />
  );

  return (
    <div
      className={`w-full flex flex-col bg-neutral-950 relative select-none ${
        isDesktop ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'
      }`}
    >
      {/* 顶部固定导航 */}
      <Header
        onResetExample={handleResetExample}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
      />

      {isDesktop ? (
        <>
          {/* 大屏三栏工作台：文案编辑 | 实时画板（多卡堆叠） | 参数设置栏 */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* 左栏：文案编辑（始终编辑完整正文，内部滚动） */}
            <aside className="w-[460px] xl:w-[500px] h-full min-h-0 flex flex-col flex-shrink-0 border-r border-neutral-800/60 bg-neutral-50 text-neutral-900 z-10 shadow-2xl shadow-black/20 overflow-hidden">
              <div
                tabIndex={0}
                className="flex-1 min-h-0 overflow-y-auto p-6 focus:outline-none"
              >
                <ContentForm
                  data={cardData}
                  onChange={handleUpdateCard}
                  onApplyPresetSample={handleApplyPresetSample}
                  isOverflowing={isOverflowing}
                />
              </div>
            </aside>

            {/* 中栏：实时画板 + 底部状态条 */}
            <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
              <CardStage data={cardData} chunks={chunks} exportState={cardExport} />
              <BottomActionBar data={cardData} cardCount={chunks.length} />
            </main>

            {/* 右栏：Figma 式暗色参数栏（风格排版 + 拆分多卡 + 导出复制，可折叠分区，上下滚动） */}
            <aside className="w-[300px] xl:w-[320px] h-full min-h-0 flex-shrink-0 overflow-y-auto border-l border-neutral-800/60 bg-neutral-950 z-10">
              <SettingsPanel
                data={cardData}
                onChange={handleUpdateCard}
                onSmartMatch={handleSmartMatch}
                matchHint={recommendation.reason}
                exportState={cardExport}
                splitMode={splitMode}
                onSplitModeChange={setSplitMode}
                cardCount={chunks.length}
                isOverflowing={isOverflowing}
              />
            </aside>
          </div>
        </>
      ) : (
        <>
          {/* 小屏纵向流式排列，画板优先可见 */}
          <div className="flex-1 min-h-0 flex flex-col pb-14">
            {/* 下方控制区（自适应高度，随页面滚动） */}
            <aside className="w-full flex flex-col flex-shrink-0 min-h-0 border-t border-neutral-800/60 bg-neutral-50 text-neutral-900 z-10 shadow-2xl shadow-black/20 order-2">
              {/* 导航标签切换 */}
              <div
                role="tablist"
                aria-label="编辑面板切换"
                className="flex border-b border-neutral-800 px-4 pt-3 bg-neutral-950 flex-shrink-0"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-content"
                  aria-selected={activeTab === 'content'}
                  aria-controls="panel-content"
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'content'
                      ? 'border-white text-white bg-neutral-900 rounded-t-lg'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>文案编辑</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-style"
                  aria-selected={activeTab === 'style'}
                  aria-controls="panel-style"
                  onClick={() => setActiveTab('style')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'style'
                      ? 'border-white text-white bg-neutral-900 rounded-t-lg'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>风格与排版</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-export"
                  aria-selected={activeTab === 'export'}
                  aria-controls="panel-export"
                  onClick={() => setActiveTab('export')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'export'
                      ? 'border-white text-white bg-neutral-900 rounded-t-lg'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>导出与复制</span>
                </button>
              </div>

              {/* 表单内容区 */}
              <div
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                tabIndex={0}
                className="flex-1 min-h-0 p-6 focus:outline-none"
              >
                {activeTab === 'content' && (
                  <ContentForm
                    data={cardData}
                    onChange={handleUpdateCard}
                    onApplyPresetSample={handleApplyPresetSample}
                    isOverflowing={isOverflowing}
                  />
                )}

                {activeTab === 'style' && (
                  <StyleToolbar
                    data={cardData}
                    onChange={handleUpdateCard}
                    onSmartMatch={handleSmartMatch}
                    matchHint={recommendation.reason}
                  />
                )}

                {activeTab === 'export' && (
                  <div className="space-y-6">
                    <ExportPanel
                      data={cardData}
                      exportState={cardExport}
                      cardCount={chunks.length}
                    />
                    <div className="pt-4 border-t border-neutral-200">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                        <Scissors className="w-3.5 h-3.5 text-neutral-700" aria-hidden="true" />
                        拆分多卡
                      </h3>
                      {splitPanel('light')}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* 上方实时画板区域（按比例智能分配高度，多卡纵向滚动浏览） */}
            <main
              className="flex-1 min-w-0 flex flex-col min-h-0 h-[var(--mobile-stage-h)] order-1"
              style={{ '--mobile-stage-h': `${mobileStageHeightVh}vh` } as React.CSSProperties}
            >
              <CardStage data={cardData} chunks={chunks} exportState={cardExport} />
            </main>
          </div>

          {/* 底部吸固状态条 */}
          <div className="fixed bottom-0 left-0 right-0 z-40 flex-shrink-0">
            <BottomActionBar data={cardData} cardCount={chunks.length} />
          </div>
        </>
      )}
    </div>
  );
}
