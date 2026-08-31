/**
 * 图片上传客户端：POST FormData 到 WePost API（Cloudflare Worker + R2）。
 *
 * 线上前端与 API 同源（wepost.zaneven.com），本地 dev 跨域由 worker 侧 CORS 白名单放行。
 * 服务端约束：MIME ∈ png/jpeg/webp/gif、单张 ≤10MB、同源校验、按 IP 限流。
 */
const API_BASE = 'https://wepost.zaneven.com';

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

/** 客户端预校验：类型 + 大小，返回错误文案（null = 通过） */
export function validateImageFile(file: File): string | null {
  if (!UPLOAD_ACCEPT.split(',').includes(file.type)) {
    return '仅支持 PNG / JPG / WebP / GIF 图片';
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return '图片不能超过 10MB';
  }
  return null;
}

/** 上传本地图片，成功返回可插入 Markdown 的图片 URL */
export async function uploadImageFile(file: File): Promise<string> {
  const precheckError = validateImageFile(file);
  if (precheckError) throw new Error(precheckError);

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let message = `上传失败 (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // 非 JSON 响应，保留状态码文案
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { url?: string };
  if (!data?.url) throw new Error('上传响应缺少图片地址');
  return data.url;
}

/** 校验用户粘贴的图片链接（仅 http/https） */
export function isValidImageUrl(url: string): boolean {
  return /^https?:\/\/\S+$/i.test(url.trim());
}
