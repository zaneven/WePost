# WePost 系统架构与设计文档 (ARCHITECTURE.md)

本文档描述 **WePost** 的核心架构设计、模块边界划分、数据流转以及扩展点设计。

> **产品形态**：纯前端静态应用。`next build` 产物静态导出至 `out/`，部署于 Cloudflare Pages 边缘节点。无服务端运行时、无数据库、无外部 API 依赖；用户编辑状态持久化于浏览器 `localStorage`。

---

## 1. 系统总体架构

WePost 采用纯前端的分层与数据驱动架构，整体划分为展现层、卡片渲染引擎、导出管线与部署层。

```
+-------------------------------------------------------------+
|                       1. 展现层 (Web UI)                     |
|  - 卡片工作台 (Canvas)   - 内容编辑器 (Editor)              |
|  - 导出面板 (Export)      - 预填充注入 (Hash Import)         |
+-------------------------------------------------------------+
                              | (React state / hooks)
+-------------------------------------------------------------+
|                 2. 卡片渲染引擎 (Card Engine)                |
|  - 模板注册表 (templates/registry)  —— 模板与画幅元数据     |
|  - 画板舞台 (CardStage)             —— 统一逻辑尺寸数据源   |
|  - 渲染器 (CardRenderer)            —— 按 templateId 分发   |
|  - Markdown 渲染 (MarkdownRenderer) —— 卡片内富文本          |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                   3. 导出与自动化管线                       |
|  - 浏览器内导出 (html-to-image)     —— 2x/3x PNG/JPEG      |
|  - 无头自动化 (Puppeteer scripts)    —— 批量 / 日更出图      |
|  - 预填充编码 (gen-card-url)         —— CardData → URL      |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     4. 部署与分发层                         |
|  - Cloudflare Pages (wrangler)      —— 静态托管 / 边缘分发   |
|  - localStorage                     —— 编辑态浏览器持久化   |
+-------------------------------------------------------------+
```

---

## 2. 核心模块设计

### 2.1 卡片渲染引擎 (`src/core/templates` & `src/components/canvas`)

1. **模板与画幅注册表**：`registry.ts` 是模板元数据（`TemplateMeta`）与画幅元数据（`AspectRatioMeta`）的**唯一数据源**。所有尺寸（导出物理像素宽高、画板逻辑渲染宽高）均从此处派生，杜绝多处硬编码导致的比例失真。
2. **统一尺寸派生**：`getCanvasDimensions(ratio)` 返回画板逻辑尺寸，供 `CardStage` / `CardRenderer` 统一引用；`getMobileStageHeightVh(ratio)` 按比例智能分配移动端画板占位高度。
3. **渲染分发**：`CardRenderer` 依据 `CardData.templateId` 选择对应模板组件渲染，`CardStage` 负责画板容器与缩略图预览。
4. **卡片内 Markdown**：`MarkdownRenderer` 为自研轻量渲染器，支持标题、段落、引用、列表、代码块等卡片场景所需子集。

### 2.2 内容编辑与状态管理 (`src/components/editor` & `src/lib`)

- **编辑器组件**：`ContentForm`（内容输入）、`StyleToolbar`（字号 / 对齐 / 字体 / 配色）、`ExportPanel`（导出参数）、`Header`、`BottomActionBar`。
- **历史与持久化**：`useCardHistory` 实现撤销 / 重做栈，配合 `localStorage` 持久化最新编辑，支持键盘快捷键。
- **溢出预警**：`useCardOverflow` 实时检测正文是否超出画板可容纳区域，导出前提示裁切风险。
- **导出**：`useCardExport` 封装 `html-to-image` 调用，`src/core/export/exporter.ts` 统一导出参数与文件名生成（`filename.ts`）。
- **内容预设**：`src/data/presets.ts` 集中维护灵感速选预设，`buildPresetData` 将预设字段合并到当前 `CardData`（保留用户既有的非覆盖字段）。

### 2.3 预填充注入协议 (`src/lib/cardImport.ts`)

为支持外部（如 `wepost-card-gen` skill、分享链接）一键把结构化内容注入画板，应用接受 URL hash 形式的卡片数据预填充：

- **协议**：`http://localhost:3000/#card=<base64url-json>`，JSON 为合法的 `Partial<CardData>`。
- **实现**：`decodeCardDataFromHash`（纯函数，可单测）+ `loadCardDataFromHash`（读取并消费 hash）。
- **优先级**：URL hash 注入 > `localStorage` 上次编辑 > `INITIAL_CARD_DATA` 默认示例。
- **向后兼容**：无 `#card=` 时行为与此前完全一致；hash 消费后清除，刷新读取 `localStorage` 中的最新编辑。
- **编码工具**：`scripts/gen-card-url.mjs`（读 CardData JSON 文件 → 输出预填充 URL）。
- **约束**：注入的 `templateId` / `aspectRatio` 必须为合法枚举值；其余字段缺失时与默认值合并兜底。修改注入逻辑须同步更新 `tests/cardImport.test.ts`。

### 2.4 自动化导出管线 (`scripts/`)

- `export-card*.mjs`：基于 Puppeteer 的批量出图脚本，针对不同画幅 / 模板组合导出高清图。
- `export-daily.mjs`：日更 / 早报流水线脚本，可扩展为可配置任务。
- `gen-card-url.mjs`：`CardData` JSON 文件 → 预填充 URL 编码工具。

---

## 3. 数据模型

核心数据模型定义于 `src/types/card.ts`：

- **`CardData`**：卡片的完整状态，含正文、标题、副标题、标签、作者、日期、页脚、模板 ID、画幅、字号、对齐、字体族、自定义配色与水印等字段。
- **`TemplateId` / `AspectRatioType` / `FontFamilyType` 等**：受控枚举，确保注入与编辑均落合法值域。
- **`ExportConfig`**：导出参数（scale 2|3、format png|jpeg、quality）。

---

## 4. 安全与架构原则

1. **无服务端凭证面**：当前为纯静态前端，无后端、无数据库，不存在服务端密钥泄露面。未来若引入 AI API Key 或平台发布凭证，须以环境变量或加密持久化存储，严禁前端打包暴露。
2. **无 Emoji 约束**：前端界面全面使用 `Lucide` 矢量图标库，保障视觉一致性。
3. **唯一数据源**：模板、画幅与尺寸元数据集中于 `registry.ts`，新增模板或画幅只在此处登记，避免散落硬编码。
4. **纯函数可测**：尺寸派生、预填充解码、文件名生成、预设合并等核心逻辑均为纯函数并配单测。

---

## 5. 扩展点

1. **新增模板**：在 `registry.ts` 登记 `TemplateMeta` → 在 `src/components/templates/` 新增模板组件 → 在 `CardRenderer` 注册分发 → （可选）在 `presets.ts` 配套预设。
2. **新增画幅**：在 `registry.ts` 的 `ASPECT_RATIOS` 登记元数据（含导出像素与画板逻辑尺寸），尺寸派生函数自动生效。
3. **新增导出后端**：`exporter.ts` 抽象导出调用，可在 `html-to-image` 之外增加 Puppeteer / SVG 等导出实现。
4. **远期：多平台分发**：若启动 [Phase 5](ROADMAP.md)，引入 `IPublisher` 契约与对应适配器，届时补充发布调度与凭证管理架构。
