/**
 * 客户端公网出口 IP 探测与微信白名单错误解析工具
 */

/**
 * 探测获取用户当前的公网出口 IP 地址。
 * 微信验证 token 要求调用方的出口 IP 必须在微信公众平台配置的「IP白名单」中。
 */
export async function fetchCurrentPublicIp(): Promise<string | null> {
  const timeoutMs = 4000;

  // 候选免费开放探测节点（按优先级尝试）
  const candidates = [
    {
      url: 'https://api.ipify.org?format=json',
      extractor: (data: Record<string, unknown>) => (typeof data.ip === 'string' ? data.ip : null),
    },
    {
      url: 'https://api64.ipify.org?format=json',
      extractor: (data: Record<string, unknown>) => (typeof data.ip === 'string' ? data.ip : null),
    },
    {
      url: 'https://httpbin.org/ip',
      extractor: (data: Record<string, unknown>) => (typeof data.origin === 'string' ? data.origin.split(',')[0].trim() : null),
    },
  ];

  for (const item of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(item.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = (await res.json()) as Record<string, unknown>;
        const ip = item.extractor(json);
        if (ip && isValidIp(ip)) {
          return ip;
        }
      }
    } catch {
      // 当前节点失败，静默尝试下一节点
      continue;
    }
  }

  return null;
}

/** 简易 IPv4 / IPv6 格式校验 */
export function isValidIp(str: string): boolean {
  const trimmed = str.trim();
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(trimmed)) {
    const parts = trimmed.split('.').map(Number);
    return parts.every((p) => p >= 0 && p <= 255);
  }
  // IPv6
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  return ipv6Regex.test(trimmed) && trimmed.includes(':');
}

/**
 * 从微信公众平台 40164 报错文本中智能提取出微信实际识别到的来源 IP。
 * 典型微信报错文本：
 * "invalid ip 140.245.74.58 ipv6 ::ffff:140.245.74.58, not in whitelist rid: 6aaa37eb"
 * 或
 * "invalid ip 123.123.123.123, not in whitelist"
 */
export function extractIpFromWeChatError(errmsg?: string): string | null {
  if (!errmsg) return null;

  // 优先匹配紧跟在 "invalid ip" 后的标准 IPv4
  const v4Match = errmsg.match(/invalid ip\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i);
  if (v4Match && v4Match[1]) {
    return v4Match[1];
  }

  // 匹配其它位置的 IPv4
  const generalIpMatch = errmsg.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
  if (generalIpMatch && generalIpMatch[1]) {
    return generalIpMatch[1];
  }

  // 匹配 IPv6
  const v6Match = errmsg.match(/ipv6\s+([0-9a-fA-F:]+)/i);
  if (v6Match && v6Match[1]) {
    return v6Match[1].replace(/,.*$/, '').trim();
  }

  return null;
}
