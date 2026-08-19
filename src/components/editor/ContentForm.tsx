import React from 'react';
import { CardData } from '@/types/card';
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
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ContentFormProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onApplyPresetSample: (type: 'essay' | 'quote' | 'news' | 'note' | 'acid') => void;
}

export const ContentForm: React.FC<ContentFormProps> = ({
  data,
  onChange,
  onApplyPresetSample,
}) => {
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
    <div className="space-y-6">
      {/* 预设文案快速切换 */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-neutral-700" />
          <span>灵感速选文案</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPresetSample('essay')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            深度长文
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('quote')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            金句格言
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('news')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            早报资讯
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('note')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            日系便签
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetSample('acid')}
            className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
          >
            态度先锋
          </button>
        </div>
      </div>

      {/* 标题区 */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <Type className="w-3.5 h-3.5 text-neutral-500" />
              主标题
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">支持核心观点</span>
          </label>
          <textarea
            rows={2}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="输入主标题..."
            className="w-full text-sm font-semibold rounded-lg border border-neutral-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              副标题 / 栏目名
            </label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="如：THINKING / 思考碎片"
              className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-neutral-400" />
              分类标签
            </label>
            <input
              type="text"
              value={data.tag}
              onChange={(e) => onChange({ tag: e.target.value })}
              placeholder="如：深度阅读、每日金句"
              className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* 正文编辑区 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-neutral-500" />
            正文内容 (支持轻量 Markdown)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              title="加粗 **text**"
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              title="斜体 *text*"
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ')}
              title="引用卡片 > quote"
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('==', '==')}
              title="重点高亮 ==highlight=="
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              title="行内代码 `code`"
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              title="无序列表 - item"
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          id="card-content-textarea"
          rows={7}
          value={data.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="输入正文，段落之间空一行，支持 **加粗**、*斜体*、> 引用金句、- 列表..."
          className="w-full text-sm rounded-lg border border-neutral-300 p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-sans"
        />
      </div>

      {/* 署名、日期与页脚 */}
      <div className="space-y-3 pt-2 border-t border-neutral-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-neutral-400" />
              作者 / 公众号署名
            </label>
            <input
              type="text"
              value={data.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="如：WePost 研习社"
              className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neutral-400" />
              日期 / 期数
            </label>
            <input
              type="text"
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="如：2026.08.19 · ISSUE 042"
              className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            底部标语 / Slogan
          </label>
          <input
            type="text"
            value={data.footerText}
            onChange={(e) => onChange({ footerText: e.target.value })}
            placeholder="如：记录每一次深度思考 · 保持专注"
            className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-medium text-neutral-600 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showWatermark ?? true}
              onChange={(e) => onChange({ showWatermark: e.target.checked })}
              className="rounded text-neutral-900 focus:ring-neutral-900"
            />
            <span>显示品牌水印角标</span>
          </label>

          {data.showWatermark && (
            <input
              type="text"
              value={data.watermarkText || ''}
              onChange={(e) => onChange({ watermarkText: e.target.value })}
              placeholder="水印文字"
              className="w-36 text-xs rounded border border-neutral-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};
