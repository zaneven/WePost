import React, { useCallback } from 'react';
import { CardData } from '@/types/card';
import type { PresetType } from '@/data/presets';
import { useToast } from '@/components/ui/Toast';
import {
  Type,
  Tag,
  User,
  Calendar,
  Quote,
  Bold,
  Italic,
  Code,
  Highlighter,
  List,
  MessageSquareQuote,
  BookOpen,
  AlertTriangle,
  Eraser,
  Clipboard,
  Layers,
  ChevronLeft,
  ChevronRight,
  Images,
  X,
  Loader2,
} from 'lucide-react';

interface DeckState {
  chunks: string[];
  index: number;
}

interface ContentFormProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onApplyPresetSample: (type: PresetType) => void;
  /** 卡片内容是否已溢出画板（被裁切） */
  isOverflowing?: boolean;
  /** 长文拆分卡组状态（null = 单卡模式） */
  deckState?: DeckState | null;
  onSplit?: () => void;
  onDeckNav?: (index: number) => void;
  onExitDeck?: () => void;
  onExportAll?: () => void;
  isBatchExporting?: boolean;
}

export const ContentForm: React.FC<ContentFormProps> = ({
  data,
  onChange,
  onApplyPresetSample,
  isOverflowing = false,
  deckState = null,
  onSplit,
  onDeckNav,
  onExitDeck,
  onExportAll,
  isBatchExporting = false,
}) => {
  const toast = useToast();

  // 复制当前文案全文到系统剪贴板
  const handleCopyText = useCallback(async () => {
    const text = [
      data.title,
      data.subtitle,
      data.tag,
      data.content,
      `${data.author} · ${data.date}`,
      data.footerText,
    ]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.show('文案已复制到剪贴板', 'success');
    } catch (err) {
      console.error('复制文案失败:', err);
      toast.show('复制文案失败，请检查浏览器权限', 'error');
    }
  }, [data, toast]);

  const handleClearAll = useCallback(() => {
    onChange({
      title: '',
      subtitle: '',
      tag: '',
      content: '',
      author: '',
      date: '',
      footerText: '',
    });
    toast.show('已清空全部文案', 'info');
  }, [onChange, toast]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('card-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = data.content;
    const selectedText = currentText.substring(start, end) || '强调文本';

    const newText =
      currentText.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      currentText.substring(end);

    onChange({ content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* 预设文案快速切换 */}
      <div>
        <div
          role="group"
          aria-label="灵感速选文案"
          className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-neutral-800" aria-hidden="true" />
          <span>灵感速选文案</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPresetSample('essay')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            深度长文
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('quote')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            金句格言
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('news')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            早报资讯
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('note')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            日系便签
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('acid')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            态度先锋
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('ink')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            水墨随笔
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('code')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            开发笔记
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('editorial')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            评论专栏
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('neon')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium border border-neutral-200 transition-colors"
          >
            赛博信号
          </button>
        </div>
      </div>

      {/* 文案快捷操作：复制全文 / 清空 / 拆分多卡 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyText}
          title="复制当前全部文案到剪贴板"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
          复制全文
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          title="清空所有文案字段"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 hover:border-red-300 hover:text-red-600 text-neutral-700 hover:bg-red-50/50 transition-colors"
        >
          <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
          清空全部
        </button>
        {!deckState && (
          <button
            type="button"
            onClick={onSplit}
            title="把长文按画幅容量拆分为多张卡片"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-400 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            拆分多卡
          </button>
        )}
      </div>

      {/* 卡组导航（拆分模式） */}
      {deckState && deckState.chunks.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 border border-neutral-200">
          <button
            type="button"
            onClick={() => onDeckNav?.(deckState.index - 1)}
            disabled={deckState.index <= 0}
            title="上一张"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="flex-1 text-center text-xs font-semibold text-neutral-700">
            第 {deckState.index + 1} / {deckState.chunks.length} 张
          </span>
          <button
            type="button"
            onClick={() => onDeckNav?.(deckState.index + 1)}
            disabled={deckState.index >= deckState.chunks.length - 1}
            title="下一张"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onExportAll}
            disabled={isBatchExporting}
            title="批量导出全部卡片为编号图片"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            {isBatchExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Images className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            导出全部
          </button>
          <button
            type="button"
            onClick={onExitDeck}
            title="退出拆分模式"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 标题区 */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="card-title"
            className="block text-xs font-medium text-neutral-800 mb-1 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <Type className="w-3.5 h-3.5 text-neutral-700" aria-hidden="true" />
              主标题
            </span>
            <span className="text-[11px] text-neutral-500 font-normal">支持核心观点</span>
          </label>
          <textarea
            id="card-title"
            rows={2}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="输入主标题..."
            className="w-full text-sm font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 resize-none transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="card-subtitle"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              副标题 / 栏目名
            </label>
            <input
              id="card-subtitle"
              type="text"
              value={data.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="如：THINKING / 思考碎片"
              className="w-full text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
            />
          </div>

          <div>
            <label
              htmlFor="card-tag"
              className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-neutral-600" aria-hidden="true" />
              分类标签
            </label>
            <input
              id="card-tag"
              type="text"
              value={data.tag}
              onChange={(e) => onChange({ tag: e.target.value })}
              placeholder="如：深度阅读、每日金句"
              className="w-full text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* 正文编辑区 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="card-content-textarea"
            className="text-xs font-bold text-neutral-800 flex items-center gap-1.5"
          >
            <Quote className="w-3.5 h-3.5 text-neutral-700" aria-hidden="true" />
            正文内容 (支持轻量 Markdown)
          </label>
          <div
            className="flex items-center gap-1 flex-nowrap overflow-x-auto pb-1 -mb-1 wepost-toolbar-scroll"
            role="group"
            aria-label="Markdown 格式工具"
          >
            <button
              type="button"
              onClick={() => insertMarkdown('## ', '')}
              title="二级标题 ## title"
              aria-label="插入二级标题"
              className="px-1.5 py-0.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              title="加粗 **text**"
              aria-label="加粗"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <Bold className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              title="斜体 *text*"
              aria-label="斜体"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <Italic className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ')}
              title="引用卡片 > quote"
              aria-label="插入引用"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('==', '==')}
              title="重点高亮 ==highlight=="
              aria-label="重点高亮"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <Highlighter className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              title="行内代码 `code`"
              aria-label="行内代码"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <Code className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              title="无序列表 - item"
              aria-label="无序列表"
              className="p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('1. ')}
              title="有序列表 1. item"
              aria-label="有序列表"
              className="px-1.5 py-0.5 text-xs font-mono font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              1.
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n---\n')}
              title="分割线 ---"
              aria-label="分割线"
              className="px-1 py-0.5 text-xs font-mono font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80 rounded"
            >
              —
            </button>
          </div>
        </div>

        <textarea
          id="card-content-textarea"
          rows={8}
          value={data.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="输入正文，不同格式换行即可分块。支持 ## 标题、**加粗**、*斜体*、> 引用金句、- 列表、1. 编号、--- 分割线..."
          className={`w-full text-sm font-normal rounded-lg border bg-white text-neutral-900 placeholder:text-neutral-400 p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-900/20 font-sans ${
            isOverflowing
              ? 'border-amber-400 focus:ring-amber-500/20 focus:border-amber-500'
              : 'border-neutral-300 focus:border-neutral-900'
          }`}
          aria-describedby="card-content-hint"
        />
        {/* 字符计数 + 溢出预警 */}
        <div
          id="card-content-hint"
          className={`mt-1.5 flex items-center justify-between text-[11px] transition-colors ${
            isOverflowing ? 'text-amber-600' : 'text-neutral-400'
          }`}
        >
          <span className="flex items-center gap-1">
            {isOverflowing && <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
            {isOverflowing
              ? '正文已超出画板范围，部分内容将被裁切，建议精简或缩小字号'
              : '不同格式换行即可分块，空一行可分段'}
          </span>
          <span className="font-mono flex-shrink-0">{data.content.length} 字</span>
        </div>
      </div>

      {/* 署名、日期与页脚 */}
      <div className="space-y-3 pt-2 border-t border-neutral-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="card-author"
              className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1"
            >
              <User className="w-3 h-3 text-neutral-600" aria-hidden="true" />
              作者 / 公众号署名
            </label>
            <input
              id="card-author"
              type="text"
              value={data.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="如：WePost 研习社"
              className="w-full text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
            />
          </div>

          <div>
            <label
              htmlFor="card-date"
              className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-neutral-600" aria-hidden="true" />
              日期 / 期数
            </label>
            <input
              id="card-date"
              type="text"
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="如：2026.08.19 · ISSUE 042"
              className="w-full text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="card-footer-text"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            底部标语 / Slogan
          </label>
          <input
            id="card-footer-text"
            type="text"
            value={data.footerText}
            onChange={(e) => onChange({ footerText: e.target.value })}
            placeholder="如：记录每一次深度思考 · 保持专注"
            className="w-full text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label
            htmlFor="card-show-watermark"
            className="text-xs font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer"
          >
            <input
              id="card-show-watermark"
              type="checkbox"
              checked={data.showWatermark ?? true}
              onChange={(e) => onChange({ showWatermark: e.target.checked })}
              className="rounded text-neutral-900 focus:ring-neutral-900"
            />
            <span>显示品牌水印角标</span>
          </label>

          {data.showWatermark && (
            <input
              id="card-watermark-text"
              type="text"
              value={data.watermarkText || ''}
              onChange={(e) => onChange({ watermarkText: e.target.value })}
              placeholder="水印文字"
              aria-label="水印文字"
              className="w-36 text-xs font-medium rounded border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};
