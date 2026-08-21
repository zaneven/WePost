---
name: wepost-card-gen
description: 基于 WePost 项目把文字内容生成社交媒体卡片/贴图。把用户提供的任意内容（文章、金句、早报、便签、态度观点等）智能结构化为 WePost CardData，自动匹配模板/画幅/排版，生成"一键打开浏览器即见渲染卡片"的 localhost 预填充 URL，可立即复制到剪贴板或下载高清图。触发场景：把…做成卡片、生成卡片、卡片排版、做张贴图、WePost 卡片、把这段话做成图、配一张图、做成小红书图。当用户想把文字内容快速变成可导出的精美卡片图时使用本 skill。
---

# WePost 卡片生成器

## 它做什么

把用户给的一段或一组文字，结构化成 WePost 的 `CardData`，通过 URL hash（`#card=<base64url-json>`）注入到正在运行的 WePost 应用。浏览器打开链接后，画板在挂载瞬间直接渲染对应卡片，用户可立即「复制到剪贴板」或「下载高清图」导出。**无需用户手动逐字段粘贴。**

## 工作前提（已就绪，无需用户配置）

- 注入通道：`src/lib/cardImport.ts` 在应用挂载时读取 `#card=` hash（纯客户端，静态导出兼容）。优先级：URL hash 注入 > localStorage 上次编辑 > 默认示例。
- 编码工具：`scripts/gen-card-url.mjs`（读 CardData JSON 文件 → 输出预填充 URL）。
- 渲染目标：本地开发服务器 `http://localhost:3000`（`npm run dev`）。
- 平台为 macOS，用 `open` 命令唤起默认浏览器。

## 第一步：把内容结构化为 CardData

读懂用户给的内容，按下表填写 `CardData`。**正文 content 必须写成轻量 Markdown**（见下方语法）。

### CardData 字段

| 字段 | 类型 | 说明与建议 |
| :--- | :--- | :--- |
| `title` | string | 主标题。建议 ≤ 20 字，提炼核心观点 |
| `subtitle` | string | 副标题 / 栏目名。英文+中文风格更出彩，如 `THINKING / 思考碎片` |
| `tag` | string | 分类标签，2–4 字，如 `深度阅读` |
| `content` | string | 正文，支持轻量 Markdown（见下）。不同格式换行即可分块，空一行可分段 |
| `author` | string | 署名 / 公众号名 |
| `date` | string | 日期 / 期数，如 `2026.08.20 · ISSUE 043` |
| `footerText` | string | 底部标语 / Slogan |
| `templateId` | enum | `minimal-magazine` \| `dark-glass` \| `vintage-news` \| `warm-memo` \| `zen-quote` \| `acid-bold` |
| `aspectRatio` | enum | `3:4` \| `1:1` \| `9:16` \| `2.35:1` \| `4:3` |
| `fontSize` | enum | `sm`(14px) \| `base`(16px) \| `lg`(18px) \| `xl`(20px) |
| `align` | enum | `left` \| `center` \| `justify` |
| `fontFamily` | enum | `sans` \| `serif` \| `mono` \| `kaiti`。**当前未接入渲染**（字体由模板决定），可省略 |
| `showWatermark` | boolean | 是否显示品牌水印角标，默认 `true` |
| `watermarkText` | string | 水印文字。注意 `zen-quote` 模板取**前 4 字**作朱砂印章 |

> `customBgColor` / `customTextColor` / `customAccentColor` 字段虽存在于类型定义，但模板尚未消费，**不要填**。

### 内容类型 → 模板 / 画幅 选型表（智能匹配，用户未指定时据此选择）

| 内容类型 | templateId | aspectRatio | 视觉字体 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| 深度长文 / 思考 / 书摘精读 | `minimal-magazine` | `3:4` | 衬线 | 经典杂志留白，首字下沉 |
| 金句 / 格言 / 诗歌 / 禅意东方 | `zen-quote` | `3:4` 或 `1:1` | 衬线 | 极致留白 + 朱砂印章 |
| 早报资讯 / 行业观察 / 晨读 | `vintage-news` | `3:4` | 衬线 | 牛皮纸 + 印章徽标 |
| 生活便签 / 治愈 / 碎碎念 | `warm-memo` | `1:1` | 无衬线 | 日系奶油柔色 |
| 科技 / 极客 / 商业洞察 | `dark-glass` | `9:16` 或 `3:4` | 无衬线 | 暗黑磨砂玻璃 |
| 态度 / 潮流 / 青年观点 / 醒目标语 | `acid-bold` | `3:4` | 无衬线 | 撞色粗黑波普 |
| 公众号推文封面 | 任一 | `2.35:1` | — | 仅标题/副标题/标语，正文从简 |

### 画幅与容量（避免内容被裁切）

应用画板尺寸固定，内容过多会被裁切并预警。按画幅控制正文长度：

| aspectRatio | 画板逻辑像素 | 正文建议字数 |
| :--- | :--- | :--- |
| `3:4` | 540 × 720 | ≤ ~260 字 |
| `1:1` | 600 × 600 | ≤ ~120 字 |
| `9:16` | 450 × 800 | ≤ ~320 字（竖长，容量最大） |
| `4:3` | 640 × 480 | ≤ ~180 字 |
| `2.35:1` | 705 × 300 | 仅封面信息，正文 ≤ 1–2 句 |

> 超长时优先：精简文案 > 降 `fontSize` 到 `sm` > 换更大画幅（如 `3:4`→`9:16`）。

### 正文 Markdown 语法（精确，源自 MarkdownRenderer）

逐行扫描、按块类型聚合：**不同格式之间只需单换行即可各自成块**（无需空行）；标题 / 分割线自成一块，列表与引用的连续同类行合并为一块，普通段落的连续行合并为一块；空行用于显式分段。每块只能是**一种**类型：

```
## 二级小标题            （正文小标题，推荐）
### 三级小标题
> 引用金句
（多行引用，每行都以 > 开头）

- 无序列表项
- 第二项                （项间用单换行，不要空行，否则拆成多块）

1. 有序列表项           （数字自动补零为 01 02）
2. 第二项

---                      （单独一行的分割线）

行内：**加粗** *斜体* `代码` ==高亮==
```

普通段落内部的单个换行会渲染为软换行（不断段）。**不同格式之间单换行即可各自成块**（如 `## 标题` 后直接写正文、列表后接段落，都无需空行）。**关键**：列表项之间不要留空行，否则会被拆成多个独立列表块导致间距异常。

## 第二步：生成预填充 URL 并打开

1. 用 Write 工具把上一步的 `CardData` JSON 写到临时文件，如 `/tmp/wepost-card.json`。
2. 生成 URL：
   ```bash
   node scripts/gen-card-url.mjs /tmp/wepost-card.json
   ```
   （输出形如 `http://localhost:3000/#card=eyJ0aXRsZ...`）
3. 确保开发服务器在跑：先探测，未跑则在后台启动并等待就绪：
   ```bash
   curl -sf -o /dev/null http://localhost:3000 || echo "NOT_RUNNING"
   ```
   若 `NOT_RUNNING`，用 Bash 工具的 `run_in_background` 启动 `npm run dev`，然后轮询至就绪：
   ```bash
   for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
   ```
4. 打开浏览器（macOS）：
   ```bash
   open "http://localhost:3000/#card=..."
   ```
5. 在回复里同时展示：所选模板/画幅/字数、生成的 CardData JSON（便于复核与复用）、以及 URL。

> 用户只要 URL / 不要自动打开时，跳过第 4 步，仅输出 URL 与 JSON。

## 模式

### A. 单张卡片
按上述完整流程产出一张。

### B. 多张卡片系列（小红书 / 视频号图文）
用户给较长文章或多个要点时，拆成 N 张卡片（每张一个 `CardData`），建议：
- 同系列用**同一模板**保持视觉统一；首张可做封面（`2.35:1` 或带期数的 `3:4`），后续为正文卡。
- 每张写到独立文件 `/tmp/wepost-card-1.json`、`/tmp/wepost-card-2.json`…，逐一 `node scripts/gen-card-url.mjs` 生成 URL。
- 默认只 `open` 第一张，其余以编号列表形式在回复中列出全部 URL，方便用户依次打开导出。
- 正文按画幅容量拆分，每张讲清一个要点，避免裁切。

## 规则与约束（继承 AGENTS.md）

- **统一中文**：所有沟通与生成的内容默认中文。
- **图标禁 Emoji**：本 skill 不产出 UI 代码；卡片正文文字可含符号但建议克制，保持专业。
- 内容字段如用户未给齐，按内容类型给出**得体的默认值**（如 `footerText`、`watermarkText`），并在回复中标注哪些是自动补全的，提示用户可改。
- 不臆造数据：用户只给正文时，title/subtitle/tag 等从正文提炼，不要凭空编造无关信息。

## 示例

用户：「把这段做成卡片：真正的专注，不是在安静里做简单的事，而是在干扰中守住内心的秩序。」

→ 识别为「金句/思考」，选 `zen-quote` / `3:4`。生成 CardData（title 取核心句的精炼、正文保留原文并用 `>` 包裹金句、author 默认 `野生宝藏箱`、date 取当天、watermarkText 取前 4 字印章），写 JSON、跑脚本、开浏览器，回复展示 JSON 与 URL。
