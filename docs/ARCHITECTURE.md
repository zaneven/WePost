# WePost 系统架构与设计文档 (ARCHITECTURE.md)

本文档详细描述 **WePost** 系统的核心架构设计、模块边界划分、数据流转以及扩展点设计。

---

## 1. 系统总体架构

WePost 采用分层与插件化驱动架构，整体划分为展现层、服务网关层、核心业务引擎层以及基础支撑与数据层。

```
+-------------------------------------------------------------+
|                      1. 展现层 (Web UI)                      |
|  - 创作工作台 (Editor)     - 主题工坊 (Themes)                |
|  - 分发管理台 (Publish)    - 素材中心 (Media Library)         |
|  - 系统管理后台 (Admin Console)                              |
+-------------------------------------------------------------+
                              | (HTTP / SSE / WebSocket)
+-------------------------------------------------------------+
|                   2. 业务编排与 API 路由层                  |
|  - 鉴权中间件 (Auth)       - 限流与审计 (RateLimit & Audit)    |
|  - 微信 Token 管理器       - 任务调度中枢 (Task Dispatcher)   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     3. 核心领域引擎层                       |
|                                                             |
|  +---------------------+   +-----------------------------+  |
|  | 排版与渲染引擎       |   | 多平台分发调度器 (Publisher) |  |
|  | - Markdown Parser   |   | - Wechat Draft/Article Push |  |
|  | - Theme Styler      |   | - Zhihu Publisher           |  |
|  | - Juice CSS Inliner |   | - Xiaohongshu Publisher     |  |
|  +---------------------+   +-----------------------------+  |
|                                                             |
|  +---------------------+   +-----------------------------+  |
|  | AI 创作辅助套件     |   | 媒体处理流水线              |  |
|  | - LLM Prompt Router |   | - Image Compressor          |  |
|  | - Outline/Polish Gen|   | - Hotlink Image Mirror      |  |
|  +---------------------+   +-----------------------------+  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     4. 基础数据与存储层                     |
|  - 关系型数据库 (PostgreSQL / SQLite via Prisma ORM)        |
|  - 缓存与异步任务队列 (Redis / BullMQ)                       |
|  - 对象存储适配器 (Local File / TOS / S3 / OSS)             |
+-------------------------------------------------------------+
```

---

## 2. 核心模块设计

### 2.1 排版与渲染引擎 (`src/core/parser` & `src/core/theme`)
1. **Markdown AST 构建**：基于 `unified` / `remark` 将源 Markdown 文本转化为结构化语法树。
2. **主题样式注入**：根据选定主题（如商务经典、青葱雅致、科技极简），将预置 CSS 与排版规则应用至 AST。
3. **微信兼容 CSS 内联**：微信公众平台富文本对外链样式表及部分选择器存在限制，引擎通过 `juice` 将 CSS 属性精准内联到 HTML 标签的 `style` 属性中，并完成 HTML 实体清洗与闭合检查。

### 2.2 多平台发布适配器 (`src/core/publisher`)
所有发布渠道均实现标准的 `IPublisher` 接口：

```typescript
export interface PublishOptions {
  draftOnly?: boolean;
  coverMediaId?: string;
  autoFormatImages?: boolean;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  externalArticleId?: string;
  publishUrl?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

export interface IPublisher {
  readonly platformId: string;
  readonly platformName: string;

  validateCredentials(): Promise<boolean>;
  uploadMedia(fileBuffer: Buffer, filename: string): Promise<string>;
  publishArticle(article: ArticleEntity, options?: PublishOptions): Promise<PublishResult>;
  queryStatus(taskId: string): Promise<TaskStatus>;
}
```

### 2.3 媒体资源与防盗链处理
- **远程图片转存**：自动识别 Markdown 中的外链图片，经服务端并发下载、格式优化后上传至微信素材库或私有对象存储，替换原链接，规避第三方图床防盗链拦截。
- **智能压缩**：对超大图片自动进行无损/微损压缩，符合微信 10MB 限制。

---

## 3. 安全与架构原则

1. **凭证隔离**：微信 `AppSecret`、各类 API Key 均以环境变量或加密持久化存储，严禁在前端打包暴露。
2. **幂等性与重试**：网络请求与平台发布任务具备幂等性 Key，防止由于网络抖动引发重复发布。
3. **无 Emoji 约束**：前端界面全面使用 `Lucide` 矢量图标库，保障企业级视觉一致性。
4. **Admin 部署约束**：后台管理模块的变更必须执行自动化验证与生产部署发布流程。
