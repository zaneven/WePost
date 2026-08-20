'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CardData } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import { buildPresetData, type PresetType } from '@/data/presets';
import { useCardHistory } from '@/lib/useCardHistory';
import { Header } from '@/components/editor/Header';
import { ContentForm } from '@/components/editor/ContentForm';
import { StyleToolbar } from '@/components/editor/StyleToolbar';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { CardStage } from '@/components/canvas/CardStage';
import { ToastProvider } from '@/components/ui/Toast';
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

  // 客户端挂载后从 localStorage 恢复（replace 不入历史栈，避免污染撤销）
  useEffect(() => {
    history.replace(loadPersistedCardData());
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
    <ToastProvider>
    <div className="w-full min-h-[100dvh] flex flex-col bg-neutral-950 lg:h-[100dvh] lg:overflow-hidden">
      {/* 顶部固定导航 */}
      <Header
        onResetExample={handleResetExample}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
      />

      {/* 主体工作台：大屏左右双栏；小屏纵向流式排列，画板优先可见 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* 左侧控制区 (大屏固定宽度内部滚动；小屏自适应高度) */}
        <aside className="w-full lg:w-[460px] xl:w-[500px] flex flex-col flex-shrink-0 min-h-0 border-r border-neutral-200 bg-white text-neutral-900 z-10 shadow-lg lg:h-full lg:overflow-hidden order-2 lg:order-1">
          {/* 导航标签切换 */}
          <div
            role="tablist"
            aria-label="编辑面板切换"
            className="flex border-b border-neutral-200 px-4 pt-3 bg-neutral-50/70 flex-shrink-0"
          >
            <button
              type="button"
              role="tab"
              id="tab-content"
              aria-selected={activeTab === 'content'}
              aria-controls="panel-content"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
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
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'style'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
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
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'export'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
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

        {/* 右侧实时画板区域 (小屏优先可见并占据稳定高度，大屏自适应一屏) */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0 h-[60vh] lg:h-full lg:overflow-hidden order-1 lg:order-2">
          <CardStage data={cardData} renderRef={exportTargetRef} />
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
