import React from 'react';

type TabId = 'content' | 'style' | 'export';

interface MobileEditorSheetProps {
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  tabs: {
    content: { label: string; icon: React.ReactNode; panel: React.ReactNode };
    style: { label: string; icon: React.ReactNode; panel: React.ReactNode };
    export: { label: string; icon: React.ReactNode; panel: React.ReactNode };
  };
}

export const MobileEditorSheet: React.FC<MobileEditorSheetProps> = ({
  expanded,
  onExpandedChange,
  activeTab,
  onTabChange,
  tabs,
}) => {
  const tabList = [tabs.content, tabs.style, tabs.export] as const;
  const tabIds = ['content', 'style', 'export'] as const;

  const handleTabClick = (id: TabId) => {
    if (id === activeTab && expanded) {
      onExpandedChange(false);
    } else {
      onTabChange(id);
      onExpandedChange(true);
    }
  };

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-30 flex flex-col rounded-t-2xl border border-neutral-200 dark:border-neutral-800 border-b-0 bg-white dark:bg-neutral-950 shadow-[0_-10px_28px_-14px_rgba(0,0,0,0.55)] transition-[height] duration-300 ease-out ${
        expanded ? 'h-[62%]' : 'h-14'
      }`}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-2 flex-shrink-0 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-sm"
        role="tablist"
        aria-label="编辑面板切换"
      >
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          title={expanded ? '收起编辑面板' : '展开编辑面板'}
          aria-label={expanded ? '收起' : '展开'}
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M6 15l6 6 6-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <path d="M6 9l6-6 6 6" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-1 flex-1 min-w-0">
          {tabIds.map((id, i) => {
            const tab = tabList[i];
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabClick(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {expanded && (
        <div
          role="tabpanel"
          className="flex-1 min-h-0 overflow-y-auto p-4 text-neutral-900 dark:text-neutral-100 pb-8"
        >
          {activeTab === 'content'
            ? tabs.content.panel
            : activeTab === 'style'
              ? tabs.style.panel
              : tabs.export.panel}
        </div>
      )}
    </div>
  );
};