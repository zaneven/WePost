import { WeChatConfig } from '@/types/wechat';

export const WECHAT_STORAGE_KEY = 'wepost:wechat:config:v1';

/** 从浏览器 localStorage 中安全读取微信凭据 */
export function loadWeChatConfig(): WeChatConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(WECHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WeChatConfig>;
    if (!parsed.appId || !parsed.appSecret) return null;
    return {
      appId: parsed.appId.trim(),
      appSecret: parsed.appSecret.trim(),
      authorDefault: parsed.authorDefault?.trim() || '',
      proxyUrl: parsed.proxyUrl?.trim() || '',
    };
  } catch (err) {
    console.warn('[WePost] 读取本地微信凭据失败:', err);
    return null;
  }
}

/** 将微信凭据保存到浏览器 localStorage（绝不上云、不传外网服务器） */
export function saveWeChatConfig(config: WeChatConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cleanConfig: WeChatConfig = {
      appId: config.appId.trim(),
      appSecret: config.appSecret.trim(),
      authorDefault: config.authorDefault?.trim() || '',
      proxyUrl: config.proxyUrl?.trim() || '',
    };
    window.localStorage.setItem(WECHAT_STORAGE_KEY, JSON.stringify(cleanConfig));
    return true;
  } catch (err) {
    console.error('[WePost] 保存本地微信凭据失败:', err);
    return false;
  }
}

/** 清除本地保存的微信凭据 */
export function clearWeChatConfig(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(WECHAT_STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('[WePost] 清除本地微信凭据失败:', err);
    return false;
  }
}

/** 判断用户是否已在本地保存过微信配置 */
export function hasWeChatConfig(): boolean {
  const config = loadWeChatConfig();
  return !!(config && config.appId && config.appSecret);
}

/** 对 Secret 进行掩码脱敏处理，如 "abcdef123456" -> "abcd••••3456" */
export function maskSecret(secret?: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
}
