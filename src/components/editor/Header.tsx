import React from 'react';
import { Layers, RefreshCw, Undo2, Redo2, Bot, Sun, Moon } from 'lucide-react';

export type EditorTheme = 'light' | 'dark';

interface HeaderProps {
  onResetExample: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** 当前编辑器主题（默认暗色），由 page.tsx 持有并持久化 */
  theme?: EditorTheme;
  /** 点击切换亮 / 暗主题 */
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(
  ({
    onResetExample,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    theme = 'dark',
    onToggleTheme,
  }) => {
    const isDark = theme === 'dark';
    return (
      <header className="h-14 border-b border-neutral-200 bg-white/95 dark:border-neutral-800/90 dark:bg-neutral-950/95 backdrop-blur-xl w-full flex-shrink-0 z-50 px-3 sm:px-5 flex items-center justify-between text-neutral-900 dark:text-neutral-100 select-none overflow-hidden">
        {/* 左侧 Logo 与品牌 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">WePost</span>
              <span className="hidden min-[380px]:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-emerald-600 border border-neutral-200 dark:bg-neutral-800/80 dark:text-emerald-400 dark:border-neutral-700/60 font-semibold">
                Studio
              </span>
            </div>
          </div>
        </div>

        {/* 右侧快捷操作与状态 */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* 亮 / 暗主题切换 */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            className="p-2 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          {/* 撤销 / 重做 */}
          <div className="flex items-center gap-1 bg-neutral-100/90 border border-neutral-200 dark:bg-neutral-900/90 dark:border-neutral-800 rounded-lg p-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="撤销 (Cmd/Ctrl+Z)"
              aria-label="撤销"
              className={`p-1.5 rounded transition-colors ${
                canUndo
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800'
                  : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="重做 (Cmd/Ctrl+Shift+Z)"
              aria-label="重做"
              className={`p-1.5 rounded transition-colors ${
                canRedo
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800'
                  : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5 hidden sm:block" />

          <a
            href="/agent"
            title="Agent 接入说明"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 border border-neutral-200 dark:text-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white dark:border-neutral-800 rounded-lg transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400" />
            <span className="hidden sm:inline">Agent 接入</span>
          </a>

          <button
            type="button"
            onClick={onResetExample}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 border border-neutral-200 dark:text-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white dark:border-neutral-800 rounded-lg transition-all"
            title="重置为示范文案"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">示范文案</span>
          </button>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';
