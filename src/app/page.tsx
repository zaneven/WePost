'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CardData } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
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
import { Header, type EditorTheme } from '@/components/editor/Header';
import { ContentForm } from '@/components/editor/ContentForm';
import { StyleToolbar } from '@/components/editor/StyleToolbar';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { CardStage } from '@/components/canvas/CardStage';
import { BottomActionBar } from '@/components/editor/BottomActionBar';
import { SettingsPanel } from '@/components/editor/SettingsPanel';
import { SplitPanel } from '@/components/editor/SplitPanel';
import { MobileEditorSheet } from '@/components/editor/MobileEditorSheet';
import { useCardExport, DEFAULT_EXPORT_CONFIG } from '@/lib/useCardExport';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { Edit3, Palette, Download, Scissors } from 'lucide-react';

const STORAGE_KEY = 'wepost:card-data:v1';
const SPLIT_MODE_KEY = 'wepost:split-mode:v1';
const THEME_KEY = 'wepost:theme:v1';

/** 从 localStorage 读取上次主题（非法值回退暗色——编辑器默认整体暗色） */
function loadPersistedTheme(): EditorTheme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return raw === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

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
  // 移动端底部编辑抽屉：默认收起（预览占满视口），点击 Tab 展开
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);
  // 布局分流：大屏三栏（文案 | 画板 | Figma 式参数栏），小屏沿用三 Tab 布局
  const isDesktop = useIsDesktop();
  // 导出配置在卡片 hover 操作与配置面板间共享（单一数据源）
  const cardExport = useCardExport(DEFAULT_EXPORT_CONFIG);
  const toast = useToast();

  // 拆分模式为常驻必选项（默认自动拆分），选择持久化到 localStorage。
  // 左侧编辑区始终编辑完整正文，拆分结果由 content + 模式 + 画幅 + 字号 + 模板实时推导。
  const [splitMode, setSplitMode] = useState<SplitMode>('auto');
  // 挂载恢复完成后才允许写回持久化，避免初始 'auto' 在恢复读取前覆盖已存的模式
  const [splitModeHydrated, setSplitModeHydrated] = useState(false);

  // 编辑器亮 / 暗主题（默认暗色，顶部导航可切换），持久化到 localStorage。
  // 与拆分模式同款两段式水合：挂载恢复后才写回，避免初始 'dark' 覆盖已存的 'light'。
  const [theme, setTheme] = useState<EditorTheme>('dark');
  const [themeHydrated, setThemeHydrated] = useState(false);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

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

  // 单页标题模式：首页为大标题封面卡（无正文），正文从第二页开始；拆分仅作用于内容区域
  const titlePage = !!cardData.titlePage;
  /** 导出 / 状态条使用的总卡片数（封面卡计入） */
  const totalCardCount = chunks.length + (titlePage ? 1 : 0);

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
    setTheme(loadPersistedTheme());
    setThemeHydrated(true);
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

  // 主题持久化（挂载恢复完成后才写回）；同时把 dark class 同步到 <html>，
  // 使 dark: 变体对编辑器根 div 之外的浮层（如 Toast）同样生效
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (!themeHydrated) return;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // 隐私模式等，静默忽略
    }
  }, [theme, themeHydrated]);

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

  /** 单页标题模式开关（走历史栈，可撤销） */
  const handleTitlePageChange = useCallback(
    (enabled: boolean) => handleUpdateCard({ titlePage: enabled }),
    [handleUpdateCard]
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
      titlePage={titlePage}
      onTitlePageChange={handleTitlePageChange}
      cardCount={chunks.length}
      isOverflowing={isOverflowing}
    />
  );

  return (
    <div
      className={`w-full flex flex-col bg-neutral-950 relative h-[100dvh] overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}
    >
      {/* 顶部固定导航 */}
      <Header
        onResetExample={handleResetExample}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {isDesktop ? (
        <>
          {/* 大屏三栏工作台：文案编辑 | 实时画板（多卡堆叠） | 参数设置栏 */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* 左栏：文案编辑（始终编辑完整正文，内部滚动；随主题亮暗切换） */}
            <aside className="w-[380px] xl:w-[400px] h-full min-h-0 flex flex-col flex-shrink-0 border-r border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-800/60 dark:bg-neutral-950 dark:text-neutral-100 z-10 shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
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
              <BottomActionBar data={cardData} cardCount={totalCardCount} />
            </main>

            {/* 右栏：Figma 式参数栏（风格排版 + 拆分多卡 + 导出复制，可折叠分区，上下滚动；随主题亮暗切换） */}
            <aside className="w-[300px] xl:w-[320px] h-full min-h-0 flex-shrink-0 overflow-y-auto border-l border-neutral-200 bg-neutral-50 dark:border-neutral-800/60 dark:bg-neutral-950 z-10">
              <SettingsPanel
                data={cardData}
                onChange={handleUpdateCard}
                onSmartMatch={handleSmartMatch}
                matchHint={recommendation.reason}
                exportState={cardExport}
                splitMode={splitMode}
                onSplitModeChange={setSplitMode}
                titlePage={titlePage}
                onTitlePageChange={handleTitlePageChange}
                cardCount={chunks.length}
                isOverflowing={isOverflowing}
                surface={theme}
              />
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-h-0 flex flex-col">
            <main className="flex-1 min-h-0 relative">
              <CardStage
                data={cardData}
                chunks={chunks}
                exportState={cardExport}
              />
              <MobileEditorSheet
                expanded={mobileSheetExpanded}
                onExpandedChange={setMobileSheetExpanded}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={{
                  content: {
                    label: '文案编辑',
                    icon: <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />,
                    panel: (
                      <ContentForm
                        data={cardData}
                        onChange={handleUpdateCard}
                        onApplyPresetSample={handleApplyPresetSample}
                        isOverflowing={isOverflowing}
                      />
                    ),
                  },
                  style: {
                    label: '风格与排版',
                    icon: <Palette className="w-3.5 h-3.5" aria-hidden="true" />,
                    panel: (
                      <StyleToolbar
                        data={cardData}
                        onChange={handleUpdateCard}
                        onSmartMatch={handleSmartMatch}
                        matchHint={recommendation.reason}
                      />
                    ),
                  },
                  export: {
                    label: '导出与复制',
                    icon: <Download className="w-3.5 h-3.5" aria-hidden="true" />,
                    panel: (
                      <div className="space-y-6">
                        <ExportPanel
                          data={cardData}
                          exportState={cardExport}
                          cardCount={totalCardCount}
                          splitMode={splitMode}
                        />
                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
                            <Scissors className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />
                            拆分多卡
                          </h3>
                          {splitPanel(theme)}
                        </div>
                      </div>
                    ),
                  },
                }}
              />
            </main>
          </div>
          <BottomActionBar data={cardData} cardCount={totalCardCount} />
        </>
      )}
    </div>
  );
}
