import React from 'react';
import { CardData } from '@/types/card';
import type { useCardExport } from '@/lib/useCardExport';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  FileImage,
  Loader2
} from 'lucide-react';

type ExportState = ReturnType<typeof useCardExport>;

interface ExportPanelProps {
  data: CardData;
  exportState: ExportState;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ data, exportState }) => {
  const {
    config,
    setConfig,
    isExporting,
    isCopying,
    copiedSuccess,
    handleDownload,
    handleCopyClipboard,
  } = exportState;

  return (
    <div className="space-y-5">
      {/* 导出配置 */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
            <span>导出分辨率与格式</span>
          </label>
          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
            超高清无损
          </span>
        </div>

        {/* 倍率切换 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfig({ ...config, scale: 2 })}
            className={`py-2 px-3 rounded-lg border text-left text-xs transition-all ${
              config.scale === 2
                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10 font-bold text-neutral-900 shadow-sm'
                : 'border-neutral-200 bg-white/60 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <div className="font-semibold">2x 高清推荐</div>
            <div className="text-[10px] text-neutral-400 font-normal">微信/社交平台最佳大小</div>
          </button>

          <button
            type="button"
            onClick={() => setConfig({ ...config, scale: 3 })}
            className={`py-2 px-3 rounded-lg border text-left text-xs transition-all ${
              config.scale === 3
                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10 font-bold text-neutral-900 shadow-sm'
                : 'border-neutral-200 bg-white/60 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <div className="font-semibold">3x 极致超清</div>
            <div className="text-[10px] text-neutral-400 font-normal">Retina 视网膜超清画质</div>
          </button>
        </div>

        {/* 格式切换 */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-neutral-500">图片格式:</span>
          <div className="flex gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => setConfig({ ...config, format: 'png' })}
              className={`flex-1 py-1 text-xs rounded border transition-all ${
                config.format === 'png'
                  ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              PNG (文字极度锐利)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, format: 'jpeg' })}
              className={`flex-1 py-1 text-xs rounded border transition-all ${
                config.format === 'jpeg'
                  ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              JPG (体积更小)
            </button>
          </div>
        </div>
      </div>

      {/* 核心操作按钮组 */}
      <div className="space-y-2.5">
        {/* 一键复制到剪贴板 */}
        <button
          type="button"
          onClick={() => handleCopyClipboard()}
          disabled={isCopying}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-md ${
            copiedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-[0.99]'
          }`}
        >
          {isCopying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>正在生成并复制...</span>
            </>
          ) : copiedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>已复制到剪贴板！可直接粘贴至公众号</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>一键复制图片到剪贴板 (Cmd+V 粘贴)</span>
            </>
          )}
        </button>

        {/* 下载高清图片 */}
        <button
          type="button"
          onClick={() => handleDownload(data)}
          disabled={isExporting}
          className="w-full py-3 px-4 rounded-xl border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
              <span>正在导出高清贴图...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-neutral-700" />
              <span>下载 {config.scale}x 高清贴图 ({config.format.toUpperCase()})</span>
            </>
          )}
        </button>
      </div>

      <div className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1">
        <FileImage className="w-3.5 h-3.5" />
        <span>支持一键粘贴到微信公众号后台图文编辑器</span>
      </div>
    </div>
  );
};
