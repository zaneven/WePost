---
name: wepost-card-gen
description: 基于 WePost 接口服务把文字内容做成社交媒体卡片图。把用户提供的任意内容（文章、金句、早报、便签、态度观点等）智能结构化为 WePost CardData，自动匹配模板/画幅/排版，调用接口 wepost.zaneven.com/api/render 出图，返回可直接使用的卡片图片链接（可下载/复制）。触发场景：把…做成卡片、生成卡片、卡片排版、做张贴图、WePost 卡片、把这段话做成图、配一张图、做成小红书图。当用户想把文字内容快速变成可导出的精美卡片图时使用本 skill。
---

# WePost 卡片生成器（接口版）

## 它做什么

把用户给的一段或一组文字，结构化成 WePost 的 `CardData`，调用接口 `POST https://wepost.zaneven.com/api/render`（`X-API-Key` 鉴权）出图，返回**卡片图片链接**。**无需本地 WePost 应用、无需浏览器。** 智能匹配：只给 `content` 即可自动选模板/画幅/字体。

## 工作前提（已就绪）

- 接口已部署：`https://wepost.zaneven.com/api/render`（单源 `wepost.zaneven.com`，含 `/admin` 控制台与 `/` 接入页）。
- 鉴权：请求头 `X-API-Key: <key>`，key 存于 `~/.wepost/config.json`（本机已预置 `{apiBase, apiKey, agentId}`）。
- 每次调用：先 `cat ~/.wepost/config.json` 读 `apiKey` 与 `apiBase`（缺省 `https://wepost.zaneven.com`）。

## 第一步：把内容结构化为 CardData

读懂用户给的内容，按下表填写 `CardData`。**正文 content 必须写成轻量 Markdown**（见下方语法）。多数时候只填 `title`/`content`/`author`/`date`，其余交给接口智能匹配或默认兜底。

### CardData 字段

| 字段 | 类型 | 说明与建议 |
| :--- | :--- | :--- |
| `content` | string（必填）| 正文，支持轻量 Markdown（见下）。不同格式换行即可分块，空一行可分段 |
| `title` | string | 主标题。建议 ≤ 20 字，提炼核心观点 |
| `subtitle` | string | 副标题 / 栏目名，如 `THINKING / 思考碎片` |
| `tag` | string | 分类标签，2–4 字，如 `深度阅读` |
| `author` | string | 署名 / 公众号名 |
| `date` | string | 日期 / 期数，如 `2026.08.20 · ISSUE 043` |
| `footerText` | string | 底部标语 / Slogan |
| `templateId` | enum | 10 模板：`minimal-magazine` `dark-glass` `vintage-news` `warm-memo` `zen-quote` `acid-bold` `ink-wash` `terminal-code` `editorial-bold` `neon-cyber`。省略则智能匹配 |
| `aspectRatio` | enum | `3:4` `1:1` `9:16` `2.35:1` `4:3`。省略则智能匹配 |
| `fontFamily` | enum | `sans` `serif` `mono` `kaiti`。省略则由模板决定 |
| `fontSize` | enum | `sm` `base` `lg` `xl`，缺省 `base` |
| `align` | enum | `left` `center` `justify`，缺省 `left` |
| `showWatermark` | boolean | 品牌水印角标，缺省 `true` |
| `watermarkText` | string | 水印文字；`zen-quote` 取前 4 字作朱砂印章 |

### 内容类型 → 模板 / 画幅 选型表（智能匹配，用户未指定时据此选择）

| 内容类型 | templateId | aspectRatio | 说明 |
| :--- | :--- | :--- | :--- |
| 深度长文 / 思考 / 书摘精读 | `minimal-magazine` | `3:4` 或 `9:16`（长） | 经典杂志留白，首字下沉 |
| 金句 / 格言 / 诗歌 / 禅意东方 | `zen-quote` | `1:1` 或 `3:4` | 极致留白 + 朱砂印章 |
| 早报资讯 / 行业观察 / 晨读 | `vintage-news` | `3:4` | 牛皮纸 + 印章徽标 |
| 生活便签 / 治愈 / 碎碎念 | `warm-memo` | `1:1` | 日系奶油柔色 |
| 科技 / 极客 / 商业洞察 | `dark-glass` | `9:16` 或 `3:4` | 暗黑磨砂玻璃 |
| 态度 / 潮流 / 青年观点 / 醒目标语 | `acid-bold` | `3:4` | 撞色粗黑波普 |
| 古风 / 诗书 / 东方意境 | `ink-wash` | `3:4` | 水墨留白 |
| 代码 / 开发笔记 | `terminal-code` | `9:16` | 终端窗口 |
| 观点评论 / 杂志专栏 | `editorial-bold` | `3:4` | 粗黑国际主义 |
| 赛博 / 未来科技 | `neon-cyber` | `9:16` 或 `3:4` | 霓虹发光 |
| 公众号推文封面 | 任一 | `2.35:1` | 仅标题/副标题/标语 |

### 画幅与容量（避免内容被裁切）

| aspectRatio | 画板逻辑像素 | 正文建议字数 |
| :--- | :--- | :--- |
| `3:4` | 540 × 720 | ≤ ~260 字 |
| `1:1` | 600 × 600 | ≤ ~120 字 |
| `9:16` | 450 × 800 | ≤ ~320 字 |
| `4:3` | 640 × 480 | ≤ ~180 字 |
| `2.35:1` | 705 × 300 | 仅封面信息，≤ 1–2 句 |

> 超长时优先：精简文案 > 降 `fontSize` 到 `sm` > 换更大画幅。

### 正文 Markdown 语法（精确，源自 MarkdownRenderer）

逐行扫描、按块类型聚合：不同格式之间单换行即可各自成块；空行显式分段。每块只能是**一种**类型：

```
## 二级小标题            （正文小标题，推荐）
### 三级小标题
> 引用金句
（多行引用，每行以 > 开头）

- 无序列表项
- 第二项                （项间单换行，不要空行，否则拆成多块）

1. 有序列表项           （数字自动补零为 01 02）
2. 第二项

---                      （单独一行的分割线）

行内：**加粗** *斜体* `代码` ==高亮==
```

**关键**：列表项之间不要留空行，否则被拆成多个独立列表块导致间距异常。

## 第二步：调接口出图

1. 读 key：`cat ~/.wepost/config.json` 取 `apiKey` 与 `apiBase`。
2. 把上一步的 `CardData` 作为 JSON body，调接口：
   ```bash
   curl -sS -X POST "${API_BASE}/api/render" \
     -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" \
     -d @/tmp/wepost-card.json
   ```
   （用 Write 工具把 CardData 写到 `/tmp/wepost-card.json`，再 `-d @` 传入，避免 shell 转义问题。）
3. 响应形如：
   ```json
   { "id":"...", "url":"https://wepost.zaneven.com/cards/<id>.png",
     "width":1200, "height":1200, "templateId":"zen-quote", "aspectRatio":"1:1", "cached":false }
   ```
4. 把 `url` 给用户；如需本地文件，可下载：
   ```bash
   curl -sS -o ~/Desktop/卡片.png "${url}"
   ```
5. 回复中展示：所选模板/画幅/字数、最终 CardData JSON（便于复核复用）、图片链接。

### 错误处理

- `401`：key 无效/被吊销 → 提示用户：用控制台 `/admin` 重新生成（管理员可新建 Agent 并更新 `~/.wepost/config.json`）。
- `429`：当日配额用尽（响应带 `resetAt`）→ 告知用户次日重试或管理员调高配额。
- `400`：`templateId`/`aspectRatio` 等枚举非法 → 检查是否拼错；只给 `content` 走智能匹配最省心。

## 模式

### A. 单张卡片
按上述完整流程出一张，返回链接。

### B. 多张卡片系列（小红书 / 视频号图文）
用户给较长文章或多个要点时，拆成 N 张，建议：
- 同系列用**同一模板**保持视觉统一；首张可做封面（`2.35:1` 或带期数的 `3:4`）。
- 每张一个 `CardData`，写到 `/tmp/wepost-card-1.json` … 逐一调接口，把 N 个 `url` 按编号列出。
- 正文按画幅容量拆分，每张讲清一个要点。

## 规则与约束

- **统一中文**：所有沟通与生成的内容默认中文。
- **图标禁 Emoji**：卡片正文文字可含符号但建议克制，保持专业。
- 内容字段用户未给齐时，按内容类型给**得体默认值**（如 `footerText`/`watermarkText`），并标注哪些是自动补全的，提示可改。
- 不臆造数据：用户只给正文时，title/subtitle/tag 从正文提炼。

## 示例

用户：「把这段做成卡片：真正的专注，不是在安静里做简单的事，而是在干扰中守住内心的秩序。」

→ 识别「金句/思考」，选 `zen-quote` / `1:1`。CardData：title 取核心句精炼、正文原文用 `>` 包裹、author 默认 `野生宝藏箱`、date 当天。写 JSON → `curl POST /api/render` → 返回图片链接，回复展示 JSON + 链接。