'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardData } from '@/types/card';
import { INITIAL_CARD_DATA, getMobileStageHeightVh } from '@/core/templates/registry';
import { buildPresetData, type PresetType } from '@/data/presets';
import { useCardHistory } from '@/lib/useCardHistory';
import { useCardOverflow } from '@/lib/useCardOverflow';
import { loadCardDataFromHash } from '@/lib/cardImport';
import { splitContentIntoCards } from '@/core/split/splitContent';
import { recommendStyle } from '@/core/match/recommendStyle';
import { buildCardFilename } from '@/lib/filename';
import { useToast } from '@/components/ui/Toast';
import { Header } from '@/components/editor/Header';
import { ContentForm } from '@/components/editor/ContentForm';
import { StyleToolbar } from '@/components/editor/StyleToolbar';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { CardStage } from '@/components/canvas/CardStage';
import { BottomActionBar } from '@/components/editor/BottomActionBar';
import { useCardExport, DEFAULT_EXPORT_CONFIG } from '@/lib/useCardExport';
import { Edit3, Palette, Download } from 'lucide-react';

const STORAGE_KEY = 'wepost:card-data:v1';

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

export default function HomePage() {
  const history = useCardHistory<CardData>(INITIAL_CARD_DATA);
  const cardData = history.present;
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  const exportTargetRef = useRef<HTMLDivElement>(null);
  // 导出配置在画板快捷操作与配置面板间共享（单一数据源）
  const cardExport = useCardExport(DEFAULT_EXPORT_CONFIG);
  // 移动端画板高度：按当前比例智能分配（竖屏更高、宽幅更小）
  const mobileStageHeightVh = getMobileStageHeightVh(cardData.aspectRatio);
  // 检测卡片内容是否溢出画板（被裁切），用于编辑区预警
  const isOverflowing = useCardOverflow('wepost-card-export-target', cardData);

  // 长文拆分：deck 为内容块数组（null = 单卡模式）；deckIndex 为当前活动块。
  // 模板 / 样式 / 标题等字段由单卡 cardData 共享，每张卡只换 content。
  const [deckChunks, setDeckChunks] = useState<string[] | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [isBatchExporting, setIsBatchExporting] = useState(false);
  const toast = useToast();
  // 基于当前内容的风格推荐（纯启发式，无 AI / 后端）
  const recommendation = useMemo(
    () => recommendStyle(cardData.content),
    [cardData.content]
  );

  const handleUpdateCard = useCallback(
    (updates: Partial<CardData>) => {
      // 拆分模式下编辑正文：同步回写当前块，切走再切回不丢失编辑
      if (deckChunks && updates.content !== undefined) {
        const idx = deckIndex;
        setDeckChunks((prev) => {
          if (!prev) return prev;
          const next = [...prev];
          next[idx] = updates.content as string;
          return next;
        });
      }
      history.set((prev) => ({ ...prev, ...updates }));
    },
    [history, deckChunks, deckIndex]
  );

  // 拆分当前长文为多卡（按画幅 + 字号估算单卡容量，块为原子单位不跨卡）
  const handleSplit = useCallback(() => {
    const chunks = splitContentIntoCards(cardData.content, {
      aspectRatio: cardData.aspectRatio,
      fontSize: cardData.fontSize,
    });
    if (chunks.length <= 1) {
      toast.show('内容较短，无需拆分', 'info');
      return;
    }
    setDeckChunks(chunks);
    setDeckIndex(0);
    history.set({ ...cardData, content: chunks[0] }, { immediate: true });
    toast.show(`已拆分为 ${chunks.length} 张卡片`, 'success');
  }, [cardData, history, toast]);

  // 切换活动卡（同步 content 到 cardData）
  const handleDeckNav = useCallback(
    (index: number) => {
      if (!deckChunks) return;
      const i = Math.max(0, Math.min(index, deckChunks.length - 1));
      setDeckIndex(i);
      history.set({ ...cardData, content: deckChunks[i] }, { immediate: true });
    },
    [deckChunks, cardData, history]
  );

  // 退出拆分模式（保留当前块为单卡）
  const handleExitDeck = useCallback(() => {
    setDeckChunks(null);
    setDeckIndex(0);
  }, []);

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

  // 批量导出全部卡片（每张编号文件名）
  const handleExportAll = useCallback(async () => {
    if (!deckChunks || isBatchExporting) return;
    const el = exportTargetRef.current;
    if (!el) return;
    setIsBatchExporting(true);
    const startIdx = deckIndex;
    const base = buildCardFilename(cardData.templateId, cardData.title);
    try {
      const { exportCardImage } = await import('@/core/export/exporter');
      for (let i = 0; i < deckChunks.length; i++) {
        setDeckIndex(i);
        history.set({ ...cardData, content: deckChunks[i] }, { immediate: true });
        // 等下一帧渲染落定，再由 exportCardImage 内部的 ensureRenderReady 闸门兜底
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => setTimeout(() => r(), 60));
        await exportCardImage(el, `${base}-${i + 1}`, cardExport.config);
      }
      toast.show(`已导出 ${deckChunks.length} 张图片`, 'success');
    } catch (err) {
      console.error('批量导出失败:', err);
      toast.show('批量导出失败，请重试', 'error');
    } finally {
      history.set({ ...cardData, content: deckChunks[startIdx] }, { immediate: true });
      setDeckIndex(startIdx);
      setIsBatchExporting(false);
    }
  }, [deckChunks, deckIndex, isBatchExporting, cardData, history, cardExport, toast]);

  const handleResetExample = useCallback(() => {
    history.set(INITIAL_CARD_DATA, { immediate: true });
  }, [history]);

  const handleApplyPresetSample = useCallback(
    (type: PresetType) => {
      history.set(buildPresetData(cardData, type), { immediate: true });
    },
    [cardData, history]
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
    // 仅执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-neutral-950 lg:h-[100dvh] lg:overflow-hidden relative select-none">
      {/* 顶部固定导航 */}
      <Header
        onResetExample={handleResetExample}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
      />

      {/* 主体工作台：大屏左右双栏；小屏纵向流式排列，画板优先可见 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden pb-14 lg:pb-0">
        {/* 左侧控制区 (大屏固定宽度内部滚动；小屏自适应高度) */}
        <aside className="w-full lg:w-[460px] xl:w-[500px] flex flex-col flex-shrink-0 min-h-0 border-r border-neutral-800/60 bg-neutral-50 text-neutral-900 z-10 shadow-2xl shadow-black/20 lg:h-full lg:overflow-hidden order-2 lg:order-1">
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

          {/* 表单内容滚动区 (大屏仅此处内部滚动) */}
          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
            className="flex-1 min-h-0 lg:overflow-y-auto p-6 focus:outline-none"
          >
            {activeTab === 'content' && (
              <ContentForm
                data={cardData}
                onChange={handleUpdateCard}
                onApplyPresetSample={handleApplyPresetSample}
                isOverflowing={isOverflowing}
                deckState={
                  deckChunks ? { chunks: deckChunks, index: deckIndex } : null
                }
                onSplit={handleSplit}
                onDeckNav={handleDeckNav}
                onExitDeck={handleExitDeck}
                onExportAll={handleExportAll}
                isBatchExporting={isBatchExporting}
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
              <ExportPanel
                data={cardData}
                exportState={cardExport}
              />
            )}
          </div>
        </aside>

        {/* 右侧实时画板区域 (小屏按比例智能分配高度，大屏占据全部剩余空间并自适应放大) */}
        <main
          className="flex-1 min-w-0 flex flex-col min-h-0 h-[var(--mobile-stage-h)] lg:h-full lg:overflow-hidden order-1 lg:order-2"
          style={{ '--mobile-stage-h': `${mobileStageHeightVh}vh` } as React.CSSProperties}
        >
          <CardStage
            data={cardData}
            renderRef={exportTargetRef}
            exportState={cardExport}
          />
        </main>
      </div>

      {/* 底部固定操作条 (吸底固定在页面底部) */}
      <div className="fixed lg:static bottom-0 left-0 right-0 z-40 flex-shrink-0">
        <BottomActionBar data={cardData} exportState={cardExport} />
      </div>
    </div>
  );
}
