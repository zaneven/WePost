/**
 * 微信公众号草稿箱发布相关类型定义
 */

/** 微信公众号本地配置凭证（仅存客户端 localStorage） */
export interface WeChatConfig {
  appId: string;
  appSecret: string;
  authorDefault?: string;
  /** 自定义代理地址（可选，如用户自建 CORS 转发） */
  proxyUrl?: string;
}

/** 草稿箱图文发布参数表单 */
export interface WeChatPublishForm {
  /** 文章标题（微信限制 1~64 字符） */
  title: string;
  /** 作者名（微信限制 0~8 字符） */
  author: string;
  /** 摘要（微信限制 0~120 字符） */
  digest: string;
  /** 草稿类型：newspic=贴图号（小红书多图轮播） | news=传统图文文章 */
  draftType: 'newspic' | 'news';
  /** 正文内容组织模式：仅卡片图 | 卡片图 + 文字排版 */
  contentMode: 'image-only' | 'image-with-text';
  /** 是否开启评论 (1=开启, 0=不开启) */
  needOpenComment?: 0 | 1;
  /** 仅粉丝可评论 (1=是, 0=否) */
  onlyFansCanComment?: 0 | 1;
}

/** 微信草稿箱发布执行阶段 */
export type WeChatPublishStep =
  | 'idle'
  | 'authenticating'    // 正在获取 AccessToken 与校验凭证
  | 'rendering_card'   // 正在渲染高清卡片图片
  | 'uploading_cover'  // 正在上传微信永久封面素材 (thumb_media_id)
  | 'uploading_images' // 正在上传正文图片到微信 CDN (uploadimg)
  | 'creating_draft'   // 正在写入草稿箱 (draft/add)
  | 'success'          // 发布成功
  | 'error';           // 发布失败

/** 微信草稿箱发布成功响应 */
export interface WeChatPublishResult {
  mediaId: string;
  previewUrl?: string;
  title: string;
  author: string;
  thumbMediaId: string;
}

/** 微信 API 错误结构 */
export interface WeChatApiError {
  errcode: number;
  errmsg: string;
  /** 若为 40164 错误，从 errmsg 中解析出的微信检测到未加白的 IP */
  detectedIp?: string;
}

/** 微信 draft/add 接口请求规范中的 article 单项 */
export interface WeChatArticlePayload {
  title: string;
  author?: string;
  digest?: string;
  content: string;
  thumb_media_id: string;
  /** 文章类型：newspic=贴图号图片消息 | news=图文文章 */
  article_type?: 'news' | 'newspic';
  /** 贴图号专属：多张永久素材图片集合（最多 20 张） */
  image_info?: {
    image_list: Array<{ image_media_id: string }>;
  };
  need_open_comment?: number;
  only_fans_can_comment?: number;
  content_source_url?: string;
}
