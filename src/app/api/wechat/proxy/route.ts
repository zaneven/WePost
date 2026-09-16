import { NextRequest, NextResponse } from 'next/server';

/**
 * 微信接口本地透明代理转发服务（仅运行在 Node.js 环境下，如 npm run dev 或 Node 生产服务）。
 *
 * 核心目的：
 * 1. 消除浏览器端直接请求 api.weixin.qq.com 的 CORS 跨域限制；
 * 2. 保证请求直接由用户当前运行的本机网络发起，出口 IP 与用户所见的公网 IP 完全一致，满足微信 IP 白名单校验；
 * 3. 所有 AppID / Secret 仅在单次 HTTP 请求的内存中实时流转，绝不留存磁盘、数据库或云端。
 */


export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const action = formData.get('action') as string;
      const token = (formData.get('token') as string) || '';
      const media = formData.get('media') as File | null;

      if (!token) {
        return NextResponse.json(
          { errcode: 41001, errmsg: '缺少 access_token' },
          { status: 400 }
        );
      }
      if (!media) {
        return NextResponse.json(
          { errcode: 41005, errmsg: '缺少媒体文件参数 media' },
          { status: 400 }
        );
      }

      const forwardFormData = new FormData();
      forwardFormData.append('media', media, media.name || 'image.png');

      let targetUrl = '';
      if (action === 'material') {
        targetUrl = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${encodeURIComponent(
          token
        )}&type=image`;
      } else if (action === 'uploadimg') {
        targetUrl = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(
          token
        )}`;
      } else {
        return NextResponse.json(
          { error: `不支持的 FormData 动作: ${action}` },
          { status: 400 }
        );
      }

      const wxRes = await fetch(targetUrl, {
        method: 'POST',
        body: forwardFormData,
      });

      const wxData = (await wxRes.json()) as Record<string, unknown>;
      return NextResponse.json(wxData);
    }

    // JSON 请求处理
    const body = (await req.json()) as Record<string, unknown>;
    const action = body.action as string;

    switch (action) {
      case 'token': {
        const { appId, appSecret } = body as { appId?: string; appSecret?: string };
        if (!appId || !appSecret) {
          return NextResponse.json(
            { errcode: 40013, errmsg: 'appId 或 appSecret 不能为空' },
            { status: 400 }
          );
        }
        const wxUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(
          appId.trim()
        )}&secret=${encodeURIComponent(appSecret.trim())}`;
        const wxRes = await fetch(wxUrl, { method: 'GET' });
        const wxData = (await wxRes.json()) as Record<string, unknown>;
        return NextResponse.json(wxData);
      }

      case 'draft': {
        const { token, payload } = body as { token?: string; payload?: unknown };
        if (!token) {
          return NextResponse.json(
            { errcode: 41001, errmsg: '缺少 access_token' },
            { status: 400 }
          );
        }
        const wxUrl = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${encodeURIComponent(
          token
        )}`;
        const wxRes = await fetch(wxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });
        const wxData = (await wxRes.json()) as Record<string, unknown>;
        return NextResponse.json(wxData);
      }

      case 'draft_get': {
        const { token, mediaId } = body as { token?: string; mediaId?: string };
        if (!token || !mediaId) {
          return NextResponse.json(
            { errcode: 40007, errmsg: '缺少 token 或 mediaId' },
            { status: 400 }
          );
        }
        const wxUrl = `https://api.weixin.qq.com/cgi-bin/draft/get?access_token=${encodeURIComponent(
          token
        )}`;
        const wxRes = await fetch(wxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ media_id: mediaId }),
        });
        const wxData = (await wxRes.json()) as Record<string, unknown>;
        return NextResponse.json(wxData);
      }

      case 'ip': {
        const forwarded = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0].trim() || realIp || '127.0.0.1';
        return NextResponse.json({ ip: clientIp });
      }

      default:
        return NextResponse.json(
          { error: `未知的代理动作: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器代理异常';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
