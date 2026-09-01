import React, { useCallback, useState } from 'react';
import { CardData } from '@/types/card';
import type { useCardExport } from '@/lib/useCardExport';
import type { SplitMode } from '@/core/split/splitContent';
import { useToast } from '@/components/ui/Toast';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  FileImage,
  Braces,
  Loader2
} from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface ExportPanelProps {
  data: CardData;
  exportState: ExportState;
  /** 当前卡片总数（>1 时：下载 = 全部逐张导出，复制 = 拼接长图） */
  cardCount: number;
  /** 当前拆分模式（写入 API 请求体的 split 字段） */
  splitMode?: SplitMode;
  /** 所在表面主题：light=浅色面板（移动端 Tab），dark=暗色参数栏（桌面端右栏） */
  surface?: 'light' | 'dark';
}

/** 渲染接口请求说明的前缀（方法 + 端点 + 请求头），请求体由当前 CardData 动态生成 */
const API_REQUEST_PREFIX = [
  'POST https://wepost.zaneven.com/api/render',
  'Content-Type: application/json',
  'X-API-Key: <YOUR_API_KEY>',
  '',
].join('\n');

export const ExportPanel: React.FC<ExportPanelProps> = ({
  data,
  exportState,
  cardCount,
  splitMode = 'auto',
  surface = 'light',
}) => {
  const toast = useToast();
  const [isCopyingParams, setIsCopyingParams] = useState(false);
  const [copiedParams, setCopiedParams] = useState(false);

  /** 复制当前卡片状态对应的 /api/render 请求参数，便于直接发给 Agent 固定请求方式 */
  const handleCopyApiParams = useCallback(async () => {
    const snippet = `${API_REQUEST_PREFIX}${JSON.stringify(
      { ...data, split: splitMode },
      null,
      2
    )}`;
    setIsCopyingParams(true);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedParams(true);
      toast.show('API 请求参数已复制，可直接发给 Agent', 'success');
      setTimeout(() => setCopiedParams(false), 2000);
    } catch (err) {
      console.error('复制 API 参数失败:', err);
      toast.show('复制 API 参数失败，请检查浏览器权限', 'error');
    } finally {
      setIsCopyingParams(false);
    }
  }, [data, splitMode, toast]);
  const {
    config,
    setConfig,
    isExporting,
    isCopying,
    copiedSuccess,
    handleDownload,
    handleCopyClipboard,
    handleDownloadAll,
    handleCopyStitched,
  } = exportState;
  const dark = surface === 'dark';
  const isDeck = cardCount > 1;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
    dark ? 'text-neutral-400' : 'text-neutral-500'
  }`;
  const labelIconClass = dark ? 'text-neutral-500' : 'text-neutral-700';

  return (
    <div className="space-y-5">
      {/* 导出倍率 */}
      <div>
        <label className={labelClass}>
          <Sparkles className={`w-3.5 h-3.5 ${labelIconClass}`} aria-hidden="true" />
          <span>导出分辨率</span>
        </label>
        <div className={`flex p-0.5 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
          {([
            { value: 2, label: '2x', desc: '高清' },
            { value: 3, label: '3x', desc: '超清' },
          ] as { value: 2 | 3; label: string; desc: string }[]).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setConfig({ ...config, scale: item.value })}
              title={`${item.label} ${item.desc}`}
              aria-pressed={config.scale === item.value}
              className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${
                config.scale === item.value
                  ? dark
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'bg-white text-neutral-900 shadow-sm'
                  : dark
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{item.label}</span>
              <span className="opacity-60 ml-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 图片格式 */}
      <div>
        <label className={labelClass}>
          <FileImage className={`w-3.5 h-3.5 ${labelIconClass}`} aria-hidden="true" />
          <span>图片格式</span>
        </label>
        <div className={`flex p-0.5 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
          {([
            { value: 'png', label: 'PNG' },
            { value: 'jpeg', label: 'JPG' },
          ] as { value: 'png' | 'jpeg'; label: string }[]).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setConfig({ ...config, format: item.value })}
              aria-pressed={config.format === item.value}
              className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${
                config.format === item.value
                  ? dark
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'bg-white text-neutral-900 shadow-sm'
                  : dark
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮组：多卡时下载 = 全部逐张导出、复制 = 拼接长图 */}
      <div className="space-y-2.5 pt-1">
        {/* 一键复制到剪贴板 */}
        <button
          type="button"
          onClick={() => (isDeck ? handleCopyStitched() : handleCopyClipboard())}
          disabled={isCopying}
          className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all active:scale-[0.98] ${
            copiedSuccess
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : dark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700/60'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
          } ${isCopying ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isCopying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : copiedSuccess ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>
            {copiedSuccess
              ? '已复制'
              : isCopying
                ? '复制中…'
                : isDeck
                  ? `复制拼接长图（${cardCount} 张）`
                  : '复制图片'}
          </span>
        </button>

        {/* 下载高清图片 */}
        <button
          type="button"
          onClick={() => (isDeck ? handleDownloadAll(data) : handleDownload(data))}
          disabled={isExporting}
          className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-500 text-neutral-950 shadow-lg shadow-emerald-500/25"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>
            {isExporting
              ? '导出中…'
              : isDeck
                ? `下载全部 ${cardCount} 张`
                : `下载 ${config.scale}x ${config.format === 'png' ? 'PNG' : 'JPG'}`}
          </span>
        </button>

        {/* 复制 API 参数：当前状态对应的 /api/render 请求格式，可发给 Agent 复现 */}
        <button
          type="button"
          onClick={handleCopyApiParams}
          disabled={isCopyingParams}
          title="复制当前卡片对应的 /api/render 请求参数，可直接发给 Agent 固定请求方式"
          className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all active:scale-[0.98] ${
            copiedParams
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/40'
              : dark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-dashed border-neutral-700/60'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 border border-dashed border-neutral-300'
          } ${isCopyingParams ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isCopyingParams ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : copiedParams ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Braces className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{copiedParams ? 'API 参数已复制' : isCopyingParams ? '复制中…' : '复制 API 参数'}</span>
        </button>
      </div>
    </div>
  );
};
