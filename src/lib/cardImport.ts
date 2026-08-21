import { CardData } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';

/**
 * 从 hash 字符串解析预注入的卡片数据（`#card=<base64url-json>`）。
 *
 * 纯函数：不访问 window / history，便于单元测试。
 * 同时兼容 base64url（`-` `_`、无 padding）与标准 base64（`+` `/`、含 `=`）。
 * 返回 null 表示无有效注入数据（调用方回退到 localStorage）。
 */
export function decodeCardDataFromHash(hash: string): CardData | null {
  const match = (hash || '').match(/^#card=([A-Za-z0-9+/_=-]+)$/);
  if (!match) return null;
  try {
    // 统一为标准 base64：base64url 的 -/_ 还原为 +/，并补齐 padding
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    // UTF-8 安全解码（直接 atob→string 会导致中文乱码）
    const json = new TextDecoder().decode(
      Uint8Array.from(binary, (c) => c.charCodeAt(0))
    );
    const parsed = JSON.parse(json) as Partial<CardData>;
    // 与默认值合并，保证字段完整、类型安全
    return { ...INITIAL_CARD_DATA, ...parsed };
  } catch {
    return null;
  }
}

/**
 * 读取并消费 URL hash 中的预注入卡片数据。
 *
 * 供外部（如 wepost-card-gen skill、分享链接）一键把结构化内容注入画板：
 * 打开 `http://localhost:3000/#card=<base64url>` 即可直接渲染对应卡片。
 *
 * 消费后清除 hash，使后续刷新读取 localStorage 中已持久化的最新编辑，
 * 避免陈旧的注入数据反复覆盖用户的二次编辑。
 * SSR 安全：服务端返回 null。
 */
export function loadCardDataFromHash(): CardData | null {
  if (typeof window === 'undefined') return null;
  const data = decodeCardDataFromHash(window.location.hash);
  if (data) {
    // 消费 hash：仅保留 path + search，移除 #card= 片段
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }
  return data;
}
