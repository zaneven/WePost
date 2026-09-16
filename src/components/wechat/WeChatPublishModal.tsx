import React, { useCallback, useEffect, useState } from 'react';
import { CardData } from '@/types/card';
import {
  WeChatConfig,
  WeChatPublishForm,
  WeChatPublishStep,
  WeChatPublishResult,
  WeChatApiError,
} from '@/types/wechat';
import {
  loadWeChatConfig,
  saveWeChatConfig,
  clearWeChatConfig,
  hasWeChatConfig,
} from '@/lib/wechat/config';
import { fetchCurrentPublicIp } from '@/lib/wechat/ip';
import {
  getAccessToken,
  publishCardsToDraft,
} from '@/lib/wechat/publisher';
import { WechatIcon } from './WechatIcon';
import { useToast } from '@/components/ui/Toast';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Loader2,
  Settings,
  Send,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  Globe,
  FileText,
  FileImage,
} from 'lucide-react';

interface WeChatPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: CardData;
  cardCount?: number;
  /** 获取画板内所有渲染卡片 DOM 节点的提取函数 */
  getCardElements: () => HTMLElement[];
  surface?: 'light' | 'dark';
}

export const WeChatPublishModal: React.FC<WeChatPublishModalProps> = ({
  isOpen,
  onClose,
  cardData,
  cardCount = 1,
  getCardElements,
  surface = 'dark',
}) => {
  const toast = useToast();
  const dark = surface === 'dark';

  // 选项卡：'publish' (发布到草稿箱) | 'config' (公众号配置)
  const [activeTab, setActiveTab] = useState<'publish' | 'config'>('publish');

  // 本地持久化凭据状态
  const [config, setConfig] = useState<WeChatConfig>({
    appId: '',
    appSecret: '',
    authorDefault: '',
    proxyUrl: '',
  });
  const [showSecret, setShowSecret] = useState(false);

  // 公网 IP 探测
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [isFetchingIp, setIsFetchingIp] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  // 发布表单状态
  const [form, setForm] = useState<WeChatPublishForm>({
    title: '',
    author: '',
    digest: '',
    draftType: 'newspic',
    contentMode: 'image-only',
  });

  // 发布流水线状态
  const [publishStep, setPublishStep] = useState<WeChatPublishStep>('idle');
  const [stepDetail, setStepDetail] = useState<string>('');
  const [publishResult, setPublishResult] = useState<WeChatPublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [detectedWhitelistIp, setDetectedWhitelistIp] = useState<string | null>(null);

  // 连通性测试状态
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadIp = useCallback(async () => {
    setIsFetchingIp(true);
    try {
      const ip = await fetchCurrentPublicIp();
      setPublicIp(ip);
    } catch {
      setPublicIp(null);
    } finally {
      setIsFetchingIp(false);
    }
  }, []);

  // 载入已有配置和探测 IP
  useEffect(() => {
    if (!isOpen) return;

    const saved = loadWeChatConfig();
    if (saved) {
      setConfig(saved);
      // 若已有配置，默认进入发布页；否则进入配置页
      setActiveTab('publish');
    } else {
      setActiveTab('config');
    }

    // 初始化表单默认值
    setForm({
      title: cardData.title?.trim() || 'WePost 社交卡片',
      author: (cardData.author?.trim() || saved?.authorDefault || '').slice(0, 8),
      digest: cardData.subtitle?.trim() || cardData.content.slice(0, 50).trim() || '',
      draftType: 'newspic',
      contentMode: 'image-only',
    });

    setPublishStep('idle');
    setPublishResult(null);
    setPublishError(null);
    setDetectedWhitelistIp(null);
    setTestResult(null);

    // 探测公网 IP
    loadIp();
  }, [isOpen, cardData, loadIp]);

  const handleCopyIp = useCallback((ipText: string) => {
    navigator.clipboard.writeText(ipText);
    setCopiedIp(true);
    toast.show(`已复制 IP: ${ipText}`, 'success');
    setTimeout(() => setCopiedIp(false), 2000);
  }, [toast]);

  // 保存配置
  const handleSaveConfig = () => {
    if (!config.appId.trim()) {
      toast.show('请输入微信 AppID', 'error');
      return;
    }
    if (!config.appSecret.trim()) {
      toast.show('请输入微信 AppSecret', 'error');
      return;
    }

    const success = saveWeChatConfig(config);
    if (success) {
      toast.show('配置已成功保存到本地浏览器', 'success');
      setActiveTab('publish');
    } else {
      toast.show('保存失败，请检查浏览器存储权限', 'error');
    }
  };

  // 清除配置
  const handleClearConfig = () => {
    clearWeChatConfig();
    setConfig({ appId: '', appSecret: '', authorDefault: '', proxyUrl: '' });
    toast.show('已从本地浏览器清除凭证', 'success');
    setActiveTab('config');
  };

  // 测试接口连通性
  const handleTestConnection = async () => {
    if (!config.appId.trim() || !config.appSecret.trim()) {
      toast.show('请先填写完整 AppID 与 AppSecret', 'error');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      await getAccessToken(config.appId, config.appSecret, config.proxyUrl);
      setTestResult({ ok: true, message: '连通性测试通过！凭证有效且当前 IP 已在白名单中。' });
      toast.show('微信公众号接口连接正常！', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '连接失败';
      const wxErr = (err as Error & { wechatError?: WeChatApiError })?.wechatError;
      if (wxErr?.detectedIp) {
        setDetectedWhitelistIp(wxErr.detectedIp);
      }
      setTestResult({ ok: false, message: msg });
    } finally {
      setIsTesting(false);
    }
  };

  // 执行发布草稿流水线
  const handlePublish = async () => {
    if (!hasWeChatConfig()) {
      setActiveTab('config');
      toast.show('请先配置微信 AppID 与 Secret', 'error');
      return;
    }

    if (!form.title.trim()) {
      toast.show('文章标题不能为空', 'error');
      return;
    }

    const elements = getCardElements();
    if (!elements || elements.length === 0) {
      toast.show('未检测到画板卡片，请确认卡片已加载', 'error');
      return;
    }

    setPublishStep('rendering_card');
    setStepDetail(`正在渲染 ${elements.length} 张高清卡片图片...`);
    setPublishError(null);
    setDetectedWhitelistIp(null);

    try {
      // 步骤 A: 渲染所有卡片 DOM 节点为高清 PNG Blob
      const { toBlob, getFontEmbedCSS } = await import('html-to-image');
      const cardBlobs: Blob[] = [];

      for (let i = 0; i < elements.length; i++) {
        setStepDetail(`正在渲染第 ${i + 1}/${elements.length} 张高清卡片...`);
        const el = elements[i];
        let fontEmbedCSS: string | undefined;
        try {
          fontEmbedCSS = (await getFontEmbedCSS(el)) || undefined;
        } catch {
          // 忽略字体计算异常
        }

        const blob = await toBlob(el, {
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
          ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
          filter: (node) => !(node.classList && node.classList.contains('no-export')),
        });

        if (!blob) {
          throw new Error(`第 ${i + 1} 张卡片渲染图片失败`);
        }
        cardBlobs.push(blob);
      }

      // 步骤 B: 提交完整微信发布
      const result = await publishCardsToDraft({
        config,
        form,
        cardBlobs,
        textContent: cardData.content,
        onStep: (step, detail) => {
          setPublishStep(step);
          if (detail) setStepDetail(detail);
        },
      });

      setPublishResult(result);
      setPublishStep('success');
      toast.show('已成功保存至公众号草稿箱！', 'success');
    } catch (err: unknown) {
      console.error('发布微信草稿失败:', err);
      const msg = err instanceof Error ? err.message : '发布失败，请重试';
      const wxErr = (err as Error & { wechatError?: WeChatApiError })?.wechatError;
      if (wxErr?.detectedIp) {
        setDetectedWhitelistIp(wxErr.detectedIp);
      }
      setPublishError(msg);
      setPublishStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wechat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          dark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* 弹窗顶栏 */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b gap-3 sm:gap-4 ${
            dark ? 'border-neutral-800 bg-neutral-900/80' : 'border-neutral-200 bg-neutral-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
              <WechatIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="wechat-modal-title" className="text-sm font-bold whitespace-nowrap">
                  发布到微信公众号草稿箱
                </h2>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  本地纯前端
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate max-w-[220px] sm:max-w-none">
                卡片直达微信草稿，凭据仅存浏览器本地，安全零泄露
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 切换 Tab 按钮 */}
            <div
              className={`flex p-1 rounded-xl text-xs font-medium flex-shrink-0 ${
                dark ? 'bg-neutral-800' : 'bg-neutral-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab('publish')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  activeTab === 'publish'
                    ? dark
                      ? 'bg-neutral-700 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Send className="w-3.5 h-3.5 flex-shrink-0" />
                <span>发布草稿</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  activeTab === 'config'
                    ? dark
                      ? 'bg-neutral-700 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                <span>凭据设置</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                dark
                  ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              aria-label="关闭弹窗"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 弹窗主体内容滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 当前出口 IP 提醒横幅（常驻，方便随时复制加白名单） */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              dark
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <span className="font-semibold">当前出口 IP：</span>
                {isFetchingIp ? (
                  <span className="opacity-70 animate-pulse">正在探测...</span>
                ) : publicIp ? (
                  <code className="font-mono font-bold px-1.5 py-0.5 rounded bg-black/20 dark:bg-black/40 text-emerald-300 select-all">
                    {publicIp}
                  </code>
                ) : (
                  <span className="text-amber-400">探测超时（可点击刷新）</span>
                )}
                <span className="opacity-80 block text-[11px] mt-0.5">
                  请先前往微信公众平台「基本配置 → IP白名单」加入此 IP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {publicIp && (
                <button
                  type="button"
                  onClick={() => handleCopyIp(publicIp)}
                  className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                    copiedIp
                      ? 'bg-emerald-600 text-white'
                      : dark
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-800/40'
                        : 'bg-white hover:bg-neutral-100 text-emerald-800 border border-emerald-300'
                  }`}
                  title="复制当前出口 IP"
                >
                  {copiedIp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIp ? '已复制' : '复制 IP'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={loadIp}
                disabled={isFetchingIp}
                className={`p-1 rounded-md transition-colors ${
                  dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'
                } ${isFetchingIp ? 'animate-spin opacity-50' : ''}`}
                title="重新探测 IP"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 如果捕获到 40164 微信返回的明确 IP 提示，醒目提示并支持一键复制 */}
          {detectedWhitelistIp && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                dark
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold">微信拒绝访问：</span>
                  <span>微信服务端识别到的请求来源 IP 为 </span>
                  <code className="font-mono font-bold underline select-all">
                    {detectedWhitelistIp}
                  </code>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopyIp(detectedWhitelistIp)}
                className="px-2.5 py-1 rounded-md font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-1 flex-shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>复制未加白 IP</span>
              </button>
            </div>
          )}

          {/* TAB 1: 发布草稿箱 */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              {/* 发布表单 */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-400">
                    文章标题 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={64}
                    placeholder="输入微信文章标题（必填）"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-all ${
                      dark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                        : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                    }`}
                  />
                </div>

                {/* 草稿类型选择：贴图号（小红书多图轮播，推荐） vs 传统图文文章 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-400">
                      草稿类型
                    </label>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      {form.draftType === 'newspic'
                        ? '贴图号：手机端横滑多图轮播（推荐）'
                        : '普通图文：经典微信长文排版'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, draftType: 'newspic' })}
                      className={`py-2 px-3 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                        form.draftType === 'newspic'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                          : dark
                            ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                      }`}
                    >
                      <FileImage className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>贴图号 (图片消息)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, draftType: 'news' })}
                      className={`py-2 px-3 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                        form.draftType === 'news'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                          : dark
                            ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>普通图文文章</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-neutral-400">
                      作者名
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      maxLength={8}
                      placeholder="选填（最多 8 字）"
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-all ${
                        dark
                          ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                          : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-neutral-400">
                      正文内容组织
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, contentMode: 'image-only' })}
                        className={`flex-1 py-2 px-2 text-xs rounded-lg border font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                          form.contentMode === 'image-only'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                            : dark
                              ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {form.draftType === 'newspic' ? '仅贴图' : '仅长图'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, contentMode: 'image-with-text' })}
                        className={`flex-1 py-2 px-2 text-xs rounded-lg border font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                          form.contentMode === 'image-with-text'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                            : dark
                              ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {form.draftType === 'newspic' ? '贴图 + 纯文本' : '卡片 + 文字'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-400">
                    文章摘要（选填）
                  </label>
                  <textarea
                    rows={2}
                    value={form.digest}
                    onChange={(e) => setForm({ ...form, digest: e.target.value })}
                    maxLength={120}
                    placeholder="输入图文消息摘要，留空则默认截取部分内容"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none resize-none transition-all ${
                      dark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                        : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              {/* 发布流程执行状态提示 */}
              {publishStep !== 'idle' && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    publishStep === 'success'
                      ? dark
                        ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : publishStep === 'error'
                        ? dark
                          ? 'bg-rose-950/30 border-rose-900 text-rose-300'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                        : dark
                          ? 'bg-neutral-800/60 border-neutral-700 text-neutral-200'
                          : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {publishStep === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : publishStep === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    )}
                    <span>
                      {publishStep === 'success'
                        ? '草稿创建成功！已保存至微信公众平台草稿箱。'
                        : publishStep === 'error'
                          ? '发布草稿遇到错误：'
                          : stepDetail || '正在处理微信发布流水线...'}
                    </span>
                  </div>

                  {publishStep === 'error' && publishError && (
                    <div className="pl-6 font-mono text-[11px] leading-relaxed break-words text-rose-300">
                      {publishError}
                    </div>
                  )}

                  {publishStep === 'success' && publishResult && (
                    <div className="pl-6 space-y-2 text-[11px]">
                      <div>
                        <span className="opacity-70">草稿 Media ID：</span>
                        <code className="font-mono bg-black/20 px-1 py-0.5 rounded select-all">
                          {publishResult.mediaId}
                        </code>
                      </div>
                      <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                        {publishResult.previewUrl && (
                          <a
                            href={publishResult.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all whitespace-nowrap flex-shrink-0 shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span>预览临时图文</span>
                          </a>
                        )}
                        <a
                          href="https://mp.weixin.qq.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                            dark
                              ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                              : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span>前往微信公众平台草稿箱</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 凭证设置 */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* 安全提示 */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  dark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-emerald-400">零泄露安全保障：</span>
                  <span>
                    您的 AppID 与 AppSecret 仅保存在当前浏览器的 <code>localStorage</code> 中，绝不上传到任何远程数据库或第三方云端，无泄露风险。
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-400">
                    微信 AppID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                    placeholder="如 wx1234567890abcdef"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                      dark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                        : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-400">
                    微信 AppSecret <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={config.appSecret}
                      onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                      placeholder="公众平台「开发与设置 → 基本配置」中生成的 AppSecret"
                      className={`w-full pl-3.5 pr-10 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                        dark
                          ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                          : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-neutral-400 hover:text-neutral-200`}
                      title={showSecret ? '隐藏密钥' : '显示密钥'}
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-neutral-400">
                      默认作者名（选填）
                    </label>
                    <input
                      type="text"
                      value={config.authorDefault || ''}
                      onChange={(e) => setConfig({ ...config, authorDefault: e.target.value })}
                      placeholder="微信作者名"
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-all ${
                        dark
                          ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                          : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-neutral-400">
                      自定义代理 URL（高级，选填）
                    </label>
                    <input
                      type="text"
                      value={config.proxyUrl || ''}
                      onChange={(e) => setConfig({ ...config, proxyUrl: e.target.value })}
                      placeholder="留空默认走当前站点/服务内置代理"
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                        dark
                          ? 'bg-neutral-950 border-neutral-800 focus:border-emerald-500 text-white'
                          : 'bg-neutral-50 border-neutral-300 focus:border-emerald-600 text-neutral-900'
                      }`}
                    />
                    <span className="block text-[11px] text-neutral-400 mt-1">
                      若自建固定出站代理可填入完整 URL（如 <code className="font-mono text-emerald-400 select-all">https://proxy.example.com/api/wechat/proxy</code>），留空则走系统默认配置。
                    </span>
                  </div>
                </div>
              </div>

              {/* 测试结果提示 */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.ok
                      ? dark
                        ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : dark
                        ? 'bg-rose-950/30 border-rose-900 text-rose-300'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  )}
                  <span className="leading-relaxed">{testResult.message}</span>
                </div>
              )}

              {/* 操作按钮栏 */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    dark
                      ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                      : 'text-neutral-500 hover:text-rose-600 hover:bg-neutral-100'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除配置</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      dark
                        ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                        : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                    } ${isTesting ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isTesting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>测试连通性</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    保存配置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 弹窗底部操作栏 */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            dark ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-neutral-50/90'
          }`}
        >
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              已选 {cardCount} 张卡片（首张作为封面）
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap flex-shrink-0 transition-colors ${
                dark
                  ? 'hover:bg-neutral-800 text-neutral-300'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {publishStep === 'success' ? '关闭' : '取消'}
            </button>

            {activeTab === 'publish' && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={
                  publishStep === 'authenticating' ||
                  publishStep === 'rendering_card' ||
                  publishStep === 'uploading_cover' ||
                  publishStep === 'uploading_images' ||
                  publishStep === 'creating_draft'
                }
                className="px-5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishStep !== 'idle' &&
                publishStep !== 'success' &&
                publishStep !== 'error' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                ) : (
                  <Send className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>
                  {publishStep === 'success'
                    ? '再次发布'
                    : publishStep !== 'idle' && publishStep !== 'error'
                      ? '发布中…'
                      : form.draftType === 'newspic'
                        ? '发布为贴图号'
                        : '立即发布到草稿箱'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
