import {
  WeChatConfig,
  WeChatPublishForm,
  WeChatPublishResult,
  WeChatPublishStep,
  WeChatArticlePayload,
  WeChatApiError,
} from '@/types/wechat';
import { extractIpFromWeChatError } from './ip';
import { stripMarkdown } from './markdown';

const DEFAULT_PROXY_ENDPOINT = '/api/wechat/proxy';

/**
 * 微信通用请求封装：支持通过本地 Next.js 代理转发或直接请求
 */
async function callProxyApi<T>(
  action: string,
  bodyData: FormData | Record<string, unknown>,
  proxyUrl?: string
): Promise<T> {
  const targetUrl = proxyUrl || DEFAULT_PROXY_ENDPOINT;
  const isFormData = bodyData instanceof FormData;

  let reqInit: RequestInit;
  if (isFormData) {
    bodyData.append('action', action);
    reqInit = {
      method: 'POST',
      body: bodyData,
    };
  } else {
    reqInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...bodyData }),
    };
  }

  let res: Response;
  try {
    res = await fetch(targetUrl, reqInit);
  } catch (err) {
    throw new Error(
      `网络请求失败，无法连接到代理接口 (${targetUrl})。如在纯静态托管环境，请确保已配置可用代理或本地运行。`
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        '未找到微信本地代理接口 (/api/wechat/proxy)。当前可能处于无服务端的纯静态部署模式，建议在本地环境运行 (npm run dev) 或在设置中配置自定义代理。'
      );
    }
    let errorText = `请求失败 (${res.status})`;
    try {
      const errJson = (await res.json()) as { error?: string };
      if (errJson.error) errorText = errJson.error;
    } catch {
      // 忽略非 JSON 错误
    }
    throw new Error(errorText);
  }

  const result = (await res.json()) as Record<string, unknown>;

  // 校验微信接口返回的业务错误码
  if (result.errcode && result.errcode !== 0) {
    const errcode = Number(result.errcode);
    const errmsg = String(result.errmsg || '微信接口返回未知错误');
    const detectedIp = extractIpFromWeChatError(errmsg) || undefined;

    const apiError: WeChatApiError = {
      errcode,
      errmsg,
      detectedIp,
    };

    let userFriendlyMsg = `微信接口报错 [${errcode}]: ${errmsg}`;
    if (errcode === 40164) {
      userFriendlyMsg = detectedIp
        ? `调用方 IP (${detectedIp}) 不在微信公众号的白名单中，请登录微信公众平台将此 IP 加入白名单后重试。`
        : '当前网络出口 IP 不在微信公众号 IP 白名单中，请在微信公众平台「设置与开发 → 基本配置 → IP白名单」中添加。';
    } else if (errcode === 40001 || errcode === 40013 || errcode === 40002) {
      userFriendlyMsg = `微信 AppID 或 AppSecret 不正确或不匹配 [${errcode}]: ${errmsg}`;
    } else if (errcode === 45009) {
      userFriendlyMsg = '该公众号今日接口调用频率已达上限。';
    }

    const err = new Error(userFriendlyMsg) as Error & { wechatError?: WeChatApiError };
    err.wechatError = apiError;
    throw err;
  }

  return result as T;
}

/**
 * 1. 获取微信 AccessToken
 */
export async function getAccessToken(
  appId: string,
  appSecret: string,
  proxyUrl?: string
): Promise<string> {
  const data = await callProxyApi<{ access_token: string }>(
    'token',
    { appId, appSecret },
    proxyUrl
  );
  if (!data?.access_token) {
    throw new Error('未能获取到有效的微信 AccessToken');
  }
  return data.access_token;
}

/**
 * 2. 上传永久图片素材（作为草稿封面 thumb_media_id）
 */
export async function uploadCoverMaterial(
  token: string,
  imageBlob: Blob,
  proxyUrl?: string
): Promise<string> {
  const form = new FormData();
  form.append('token', token);
  form.append('media', imageBlob, 'cover.png');

  const data = await callProxyApi<{ media_id: string }>(
    'material',
    form,
    proxyUrl
  );
  if (!data?.media_id) {
    throw new Error('上传草稿封面素材失败，未返回 thumb_media_id');
  }
  return data.media_id;
}

/**
 * 3. 上传图文正文中的图片到微信 CDN（获取 mmbiz.qpic.cn URL）
 */
export async function uploadContentImage(
  token: string,
  imageBlob: Blob,
  filename: string = 'card.png',
  proxyUrl?: string
): Promise<string> {
  const form = new FormData();
  form.append('token', token);
  form.append('media', imageBlob, filename);

  const data = await callProxyApi<{ url: string }>(
    'uploadimg',
    form,
    proxyUrl
  );
  if (!data?.url) {
    throw new Error('上传正文图片到微信 CDN 失败');
  }
  return data.url;
}

/**
 * 4. 提交文章到微信草稿箱 (draft/add)
 */
export async function addDraft(
  token: string,
  article: WeChatArticlePayload,
  proxyUrl?: string
): Promise<string> {
  const payload = {
    articles: [article],
  };

  const data = await callProxyApi<{ media_id: string }>(
    'draft',
    { token, payload },
    proxyUrl
  );
  if (!data?.media_id) {
    throw new Error('草稿提交成功但未返回 media_id');
  }
  return data.media_id;
}

/**
 * 5. 尝试拉取草稿详情以获取微信官方临时预览链接
 */
export async function getDraftPreviewUrl(
  token: string,
  mediaId: string,
  proxyUrl?: string
): Promise<string | undefined> {
  try {
    const data = await callProxyApi<{
      news_item?: Array<{ url?: string; title?: string }>;
    }>('draft_get', { token, mediaId }, proxyUrl);
    return data?.news_item?.[0]?.url;
  } catch {
    // 预览链接拉取失败不影响草稿本身的成功创建
    return undefined;
  }
}

/**
 * 组装微信图文正文 HTML
 */
export function buildDraftArticleHtml(
  cardImageUrls: string[],
  textContent?: string,
  mode: 'image-only' | 'image-with-text' = 'image-only'
): string {
  const imageSection = cardImageUrls
    .map(
      (url) => `
      <section style="margin: 0 0 16px 0; text-align: center; line-height: 0;">
        <img src="${url}" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" />
      </section>`
    )
    .join('');

  const cleanText = stripMarkdown(textContent);

  if (mode === 'image-only' || !cleanText.trim()) {
    return `
      <section style="margin: 0 auto; max-width: 677px; padding: 12px 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${imageSection}
      </section>
    `.trim();
  }

  // 纯文本换行转段落（已去除 Markdown 格式标记）
  const paragraphs = cleanText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 14px 0; line-height: 1.8; color: #333333; font-size: 15px; letter-spacing: 0.5px;">${escapeHtml(
          p
        )}</p>`
    )
    .join('');

  return `
    <section style="margin: 0 auto; max-width: 677px; padding: 12px 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      ${imageSection}
      <section style="padding: 16px 8px; border-top: 1px solid #f0f0f0; margin-top: 16px;">
        ${paragraphs}
      </section>
    </section>
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface PublishExecutionParams {
  config: WeChatConfig;
  form: WeChatPublishForm;
  cardBlobs: Blob[];
  textContent?: string;
  onStep?: (step: WeChatPublishStep, detail?: string) => void;
}

/**
 * 完整发布流水线编排（支持 newspic 贴图号 与 news 经典图文）
 */
export async function publishCardsToDraft(
  params: PublishExecutionParams
): Promise<WeChatPublishResult> {
  const { config, form, cardBlobs, textContent, onStep } = params;

  if (!cardBlobs || cardBlobs.length === 0) {
    throw new Error('未获取到卡片渲染图片，请确保画板中卡片正常显示');
  }

  // 阶段 1: 获取 AccessToken
  onStep?.('authenticating', '正在验证微信 AppID 与 Secret...');
  const token = await getAccessToken(config.appId, config.appSecret, config.proxyUrl);

  const isNewspic = form.draftType === 'newspic';

  if (isNewspic) {
    // —— 分支 A: 贴图号（图片消息 newspic，小红书多图轮播模式，推荐） ——
    // 微信要求贴图号的每一张图片都必须是永久素材的 media_id，最多支持 20 张
    const countToUpload = Math.min(cardBlobs.length, 20);
    onStep?.(
      'uploading_cover',
      `正在上传卡片永久素材 (共 ${countToUpload} 张贴图)...`
    );

    const permanentMediaIds: string[] = [];
    for (let i = 0; i < countToUpload; i++) {
      onStep?.(
        'uploading_cover',
        `正在上传第 ${i + 1}/${countToUpload} 张永久图片素材...`
      );
      const mediaId = await uploadCoverMaterial(token, cardBlobs[i], config.proxyUrl);
      permanentMediaIds.push(mediaId);
    }

    // 正文去除 markdown 标记的纯文本说明（微信贴图号 content 为纯文本描述）
    const cleanCaption =
      form.contentMode === 'image-with-text' ? stripMarkdown(textContent) : '';

    onStep?.('creating_draft', '正在提交至微信草稿箱（贴图号模式）...');
    const articlePayload: WeChatArticlePayload = {
      article_type: 'newspic',
      title: form.title.trim() || 'WePost 社交卡片',
      author: form.author.trim() || config.authorDefault || '',
      digest: form.digest.trim(),
      content: cleanCaption,
      thumb_media_id: permanentMediaIds[0],
      image_info: {
        image_list: permanentMediaIds.map((id) => ({ image_media_id: id })),
      },
      need_open_comment: form.needOpenComment ?? 0,
      only_fans_can_comment: form.onlyFansCanComment ?? 0,
    };

    const draftMediaId = await addDraft(token, articlePayload, config.proxyUrl);
    const previewUrl = await getDraftPreviewUrl(token, draftMediaId, config.proxyUrl);
    onStep?.('success', '贴图号发布成功！已保存至公众号草稿箱。');

    return {
      mediaId: draftMediaId,
      previewUrl,
      title: articlePayload.title,
      author: articlePayload.author || '',
      thumbMediaId: permanentMediaIds[0],
    };
  }

  // —— 分支 B: 传统图文文章 (news) ——
  // 阶段 2: 上传封面素材 (取第一张卡片作为封面图)
  onStep?.('uploading_cover', '正在上传草稿箱封面图片...');
  const coverBlob = cardBlobs[0];
  const thumbMediaId = await uploadCoverMaterial(token, coverBlob, config.proxyUrl);

  // 阶段 3: 上传所有卡片到微信图文 CDN
  onStep?.('uploading_images', `正在上传正文配图 (共 ${cardBlobs.length} 张)...`);
  const cdnUrls: string[] = [];
  for (let i = 0; i < cardBlobs.length; i++) {
    onStep?.('uploading_images', `正在上传第 ${i + 1}/${cardBlobs.length} 张卡片图...`);
    const cdnUrl = await uploadContentImage(
      token,
      cardBlobs[i],
      `card-${i + 1}.png`,
      config.proxyUrl
    );
    cdnUrls.push(cdnUrl);
  }

  // 阶段 4: 组装正文 HTML（段落已清理 Markdown）
  const contentHtml = buildDraftArticleHtml(cdnUrls, textContent, form.contentMode);

  // 阶段 5: 提交至草稿箱
  onStep?.('creating_draft', '正在保存到微信公众号草稿箱...');
  const articlePayload: WeChatArticlePayload = {
    article_type: 'news',
    title: form.title.trim() || 'WePost 精美卡片',
    author: form.author.trim() || config.authorDefault || '',
    digest: form.digest.trim(),
    content: contentHtml,
    thumb_media_id: thumbMediaId,
    need_open_comment: form.needOpenComment ?? 0,
    only_fans_can_comment: form.onlyFansCanComment ?? 0,
  };

  const draftMediaId = await addDraft(token, articlePayload, config.proxyUrl);
  const previewUrl = await getDraftPreviewUrl(token, draftMediaId, config.proxyUrl);
  onStep?.('success', '图文文章发布成功！已保存至公众号草稿箱。');

  return {
    mediaId: draftMediaId,
    previewUrl,
    title: articlePayload.title,
    author: articlePayload.author || '',
    thumbMediaId,
  };
}
