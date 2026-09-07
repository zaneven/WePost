# WePost

<div align="center">

**一站式社交媒体卡片生成器：把文字一键变成可导出的精美卡片图**

[![Deploy to GitHub Pages](https://github.com/zaneven/WePost/actions/workflows/deploy.yml/badge.svg)](https://github.com/zaneven/WePost/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](docs/CONTRIBUTING.md)

**在线体验 / Live Demo：<https://zaneven.github.io/WePost/>**  
**生产服务单源 / Production Base：<https://wepost.zaneven.com>**

[中文文档](README.md) | [English](README.en.md) | [架构设计](docs/ARCHITECTURE.md) | [贡献指南](docs/CONTRIBUTING.md) | [路线图](docs/ROADMAP.md)

</div>

---

## 项目简介

**WePost** 是专为自媒体创作者、内容运营者与开发者打造的**卡片生成工作台**。把金句、早报、随笔、开发笔记、态度观点等任意文字内容结构化为 `CardData`，自动匹配模板与画幅，实时渲染为精美卡片，并可一键导出高清图片，直接用于小红书、朋友圈、公众号封面等社交场景。

项目支持纯前端静态导出部署（GitHub Pages），同时配套部署了集成无头渲染接口（`/api/render`）与控制台的完整生产服务（`https://wepost.zaneven.com`）。

---

## 适用场景与典型用法

WePost 把任意文字内容快速变成可直接发布的社交配图，覆盖高频创作场景：

- **小红书图文 / 封面**：笔记首图、合集封面、金句贴纸——支持 3:4 竖版与 1:1 方图，搭配「单页标题封面卡」打造抓人眼球的首图
- **朋友圈配图 / 九宫格**：每日打卡、随笔碎碎念、节日问候，1:1 方图排版舒适
- **微信公众号封面 / 头图**：2.35:1 横幅推文主封面，复古报刊、先锋杂志模板契合资讯与观点
- **微信视频号封面**：9:16 全屏竖版，霓虹赛博、暗黑毛玻璃适配科技与潮流
- **金句 / 语录图片**：东方留白、水墨留白模板呈现禅意格言与诗歌
- **每日早报 / 资讯图**：复古报刊模板搭配表格 / 引用 / 列表，信息密度高
- **开发笔记 / 代码截图**：终端代码模板 + Shiki 语法高亮，代码片段直接生成可分享图片
- **长文 / 多图连载与长图**：长文智能拆分为多张卡组，支持首卡封面模式、批量编号导出与一键拼合长图
- **文章 / 博客配图**：Markdown 段落、图文混排（`![alt](url)`）、引用、公式（KaTeX）一键成图

---

## 模板预览

10 套精心设计的卡片模板，覆盖深色 / 浅色、东方 / 现代、复古 / 潮流等多种风格。以下样例均由 WePost 的 `/export` 路由真实渲染导出（3:4 画幅，包含 Shiki 代码高亮、表格、数学公式、水印等渲染能力）：

### 卡片正文模板

| | |
|:---:|:---:|
| **极简杂志**<br><sub>Minimalist Magazine</sub><br><img src="docs/samples/minimal-magazine.png" width="300" alt="极简杂志样例"> | **暗黑毛玻璃**<br><sub>Modern Dark Glass</sub><br><img src="docs/samples/dark-glass.png" width="300" alt="暗黑毛玻璃样例"> |
| **复古报刊**<br><sub>Vintage Press</sub><br><img src="docs/samples/vintage-news.png" width="300" alt="复古报刊样例"> | **温暖便签**<br><sub>Warm Healing Note</sub><br><img src="docs/samples/warm-memo.png" width="300" alt="温暖便签样例"> |
| **东方留白**<br><sub>Zen Aesthetic</sub><br><img src="docs/samples/zen-quote.png" width="300" alt="东方留白样例"> | **酸性潮流**<br><sub>Acid & Neo-Brutalism</sub><br><img src="docs/samples/acid-bold.png" width="300" alt="酸性潮流样例"> |
| **水墨留白**<br><sub>Ink Wash Aesthetic</sub><br><img src="docs/samples/ink-wash.png" width="300" alt="水墨留白样例"> | **终端代码**<br><sub>Terminal / Dev Note</sub><br><img src="docs/samples/terminal-code.png" width="300" alt="终端代码样例"> |
| **先锋杂志**<br><sub>Editorial Bold</sub><br><img src="docs/samples/editorial-bold.png" width="300" alt="先锋杂志样例"> | **霓虹赛博**<br><sub>Neon Cyberpunk</sub><br><img src="docs/samples/neon-cyber.png" width="300" alt="霓虹赛博样例"> |

### 单页标题模式（封面卡）预览

当开启「单页标题模式」时，首张卡片将自动转换为专属的**超大标题封面卡**（正文从第二张卡片起切块展示），专为自媒体多图合集首图、小红书引流封面与推文头图打造：

| | |
|:---:|:---:|
| **极简杂志 · 封面卡**<br><img src="docs/samples/cover-minimal-magazine.png" width="300" alt="极简杂志封面卡"> | **暗黑毛玻璃 · 封面卡**<br><img src="docs/samples/cover-dark-glass.png" width="300" alt="暗黑毛玻璃封面卡"> |
| **复古报刊 · 封面卡**<br><img src="docs/samples/cover-vintage-news.png" width="300" alt="复古报刊封面卡"> | **酸性潮流 · 封面卡**<br><img src="docs/samples/cover-acid-bold.png" width="300" alt="酸性潮流封面卡"> |
| **温暖便签 · 封面卡**<br><img src="docs/samples/cover-warm-memo.png" width="300" alt="温暖便签封面卡"> | **水墨留白 · 封面卡**<br><img src="docs/samples/cover-ink-wash.png" width="300" alt="水墨留白封面卡"> |

> 在线体验所有模板与封面模式：<https://zaneven.github.io/WePost/>

---

## 核心特性

### 1. 卡片渲染引擎
- **全能 Markdown / 富文本**：支持标题、段落、引用（含 `>>` 嵌套）、有序/无序列表、任务列表（`- [ ]` / `- [x]`）、表格、围栏代码块
- **图文混排渲染**：原生支持 Markdown 图片语法（`![alt](url)`），且编辑器内置本地图片上传转换能力
- **10 套卡片模板**：极简杂志、暗黑毛玻璃、复古报刊、温暖便签、东方留白、酸性潮流、水墨留白、终端代码、先锋杂志、霓虹赛博
- **常用画幅覆盖**：页面主推 3:4（微信/小红书）、1:1（方形）、9:16（竖屏海报），底层 registry 兼容 2.35:1 与 4:3
- **代码语法高亮**：基于 [Shiki](https://shiki.style/) 动态按需加载高亮语言包与 WASM，保障导出稳定性
- **数学公式渲染**：基于 [KaTeX](https://katex.org/) 支持行内 `$...$` 与块级 `$$...$$` 公式，导出自动嵌入字体
- **开源中文字体库**：内置思源黑体（Noto Sans SC）、思源宋体（Noto Serif SC）、霞鹜文楷（LXGW WenKai）等开源商用字体与跨平台系统字体栈，支持下拉实时预览切换
- **统一尺寸数据源**：`getCanvasDimensions` 作为唯一尺寸数据源，杜绝渲染与导出比例漂移

### 2. 现代内容工作台
- **AI 智能提取填写**：直接粘贴长文、随笔、资讯或会议记录，由大模型智能提取主副标题、正文、作者、日期、标签并推荐风格参数，一键自动填入表单，且支持撤销回退
- **三栏桌面工作台**：左侧文案编辑面板、中间自适应画板舞台、右侧 Figma 式可折叠设置栏（风格排版、拆分多卡、导出面板）
- **移动端专属适配**：移动端提供底栏抽屉式编辑器（`MobileEditorSheet`），手机端操作直观顺手
- **亮暗双主题支持**：默认深色沉浸式设计，顶部导航栏一键平滑切换亮/暗模式，弹窗、Toast 与卡片候选深度适配
- **长文智能拆分多卡**：
  - **自动拆分**：按画幅与字号容量智能切块，以块为原子单位不跨卡
  - **分割线拆分**：支持在正文中用 `---` 手动切分卡片
  - **单页标题模式**：首张卡作为超大标题封面卡，正文顺延至后续卡片
- **智能推荐匹配**：`recommendStyle` 启发式推荐器，根据内容特征推荐模板、画幅与字体（纯函数，零外部依赖）
- **9 套内容预设**：金句、科技、早报、治愈等灵感速选
- **撤销/重做与防溢出预警**：`useCardHistory` 支持快捷键与 localStorage 持久化；`useCardOverflow` 实时防裁切预警

### 3. 高清导出与接口能力
- **多格式导出**：浏览器端（`html-to-image`）支持 2x / 3x 分辨率，PNG / JPEG 导出与一键复制图片
- **多卡长图拼合**：多卡模式下一键将全部卡片无缝拼接为一张超长图并复制到剪贴板
- **复制 API 参数**：导出面板一键复制当前卡片状态对应的 `POST /api/render` JSON 参数，可直接发给 Agent 或用于脚本自动化
- **无头批量出图**：提供 Puppeteer 脚本与 `/export` 渲染路由，支持日更流水线与 CI 批量导出
- **URL Hash 注入协议**：`#card=<base64url-json>` 纯客户端预填充协议，方便外部一键导入内容或生成分享链接

---

## 技术栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | Next.js 14 (App Router), React 18, TypeScript 5 | 纯静态导出，支持客户端状态管理与本地持久化 |
| **样式与组件** | Tailwind CSS, Lucide React | 统一采用矢量图标，严格禁止 Emoji |
| **开源字体** | Noto Sans SC, Noto Serif SC, LXGW WenKai | 自托管开源商用中文字体库，支持下拉预览 |
| **渲染引擎** | 自研 CardRenderer + CardStage + 模板注册表 | 统一尺寸源、画板自适应缩放与覆盖层 |
| **富文本解析** | 自研 Markdown 块解析 + Shiki + KaTeX | 标题/引用/列表/表格/公式/图片混排 |
| **图片导出** | html-to-image, file-saver | 浏览器内高清导出、长图拼合 |
| **无头自动化** | puppeteer-core | `/export` 路由配合无头自动化出图与样例生成 |
| **生产服务** | Cloudflare Workers (WePost-API) | 线上单源提供 `/api/render` 出图接口与完整服务 |
| **静态托管** | GitHub Pages (Actions) | 自动化 CI 静态预览站点 |

---

## 快速上手

### 1. 环境准备

- Node.js >= 18.18.0（推荐 20.x+）
- npm >= 9.x
- Git

### 2. 克隆项目与安装依赖

```bash
git clone https://github.com/zaneven/WePost.git
cd WePost
npm install
```

### 3. 启动开发服务

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可进入卡片工作台。

### 4. 生产构建与本地验证

```bash
# 静态导出至 out/ 目录
npm run build

# 运行单元测试
npm test
```

---

## 部署说明

WePost 纯前端静态产物通过 `next build` 导出至 `out/` 目录。

### 静态站点部署（GitHub Pages）

推送到 `main` 分支会自动触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：
1. 注入 `GITHUB_PAGES=true`，设置 `basePath` 子路径
2. 自动生成 `out/.nojekyll` 并发布到 GitHub Pages
3. 演示地址：<https://zaneven.github.io/WePost/>

### 生产服务单源（wepost.zaneven.com）

WePost 的完整线上服务（前端控制台 + 后端无头渲染 Worker + Agent 接口）已统一并入单源体系：
- 生产环境由 `WePost-API` 仓库统筹组装前端产物并部署至 Cloudflare Workers
- 本仓库的 `npm run deploy` 脚本已按架构演进标注废弃，前端静态产物直接在发布管线中作为静态资源打包

---

## 目录结构

```
WePost/
├── .github/workflows/         # CI/CD：GitHub Pages 自动部署流水线
├── .claude/
│   ├── agents/                # Claude / AI Agent 角色定义与协作规范
│   └── skills/wepost-card-gen # 结构化文字一键调接口出图的 Claude skill
├── docs/                      # 设计与规范文档
│   ├── ARCHITECTURE.md        # 架构设计与领域模型
│   ├── CONTRIBUTING.md        # 贡献与协作规范
│   ├── ROADMAP.md             # 里程碑与功能演进路线图
│   └── samples/               # 10 套模板与大标题封面卡真实样例图 (PNG)
├── scripts/                   # 自动化脚本
│   ├── gen-template-samples.mjs # 样例图自动生成（含正文模板与封面卡）
│   ├── template-samples.json    # 样例卡片数据源
│   ├── export-card*.mjs       # Puppeteer 单卡 / 多卡批量出图脚本
│   └── export-daily.mjs       # 日更自动化出图流水线
├── src/
│   ├── app/                   # Next.js 页面与路由（/ 与 /export）
│   ├── components/
│   │   ├── canvas/            # 画板舞台、渲染器、单页封面卡、缩略图
│   │   ├── templates/         # 10 套卡片模板组件实现
│   │   ├── editor/            # 三栏工作台组件（ContentForm, SettingsPanel, StyleToolbar 等）
│   │   └── ui/                # 基础 UI 矢量组件（Toast 等）
│   ├── core/
│   │   ├── fonts.ts           # 开源商用中文字体注册表与 CSS 字体栈
│   │   ├── templates/         # 模板注册表与画幅定义（唯一尺寸源）
│   │   ├── split/             # 长文多卡拆分与容量估算引擎
│   │   ├── match/             # 启发式智能风格推荐器
│   │   └── export/            # 导出管线与配置
│   ├── data/presets.ts        # 内容灵感预设
│   ├── lib/                   # hooks 与工具（aiFill, 导出, 历史, 溢出, hash 导入）
│   └── types/card.ts          # CardData 核心类型定义
├── tests/                     # 自动化测试用例（vitest）
├── AGENTS.md                  # 智能体协作指南与硬性规范
├── README.md / README.en.md   # 中英文项目主文档
└── wrangler.toml              # 部署配置文件
```

---

## 智能体协作与 wepost-card-gen Skill

### 智能体协作规范 (AGENTS.md)
本项目严格执行 [AGENTS.md](AGENTS.md) 中的工程规范：
1. **中文沟通**：所有的规划、讨论与代码注释统一使用中文。
2. **矢量图标**：前端 UI 严禁使用 Emoji 字符，统一采用 `Lucide React` 专业矢量图标。
3. **闭环保证**：变更后须保证 `npm test` 全绿且 `npm run build` 成功。

### wepost-card-gen Skill
项目内置 [`wepost-card-gen`](.claude/skills/wepost-card-gen/SKILL.md) 技能：
- **接口直出图**：直接调用 `POST https://wepost.zaneven.com/api/render` 接口，在云端无头渲染并返回卡片图片链接，**本地无需运行开发服务或浏览器**。
- **智能结构化**：给一段文字，Agent 自动提炼标题、副标题、标签、金句与排版参数，并匹配最佳模板与画幅。
- **轻量 Hash 协议**：亦支持通过 `#card=<base64url-json>` 生成即开即用的网页预览链接。

---

## 路线图 (Roadmap)

- [x] **阶段一：卡片生成核心** —— 渲染引擎、10 套模板、多画幅、编辑器、高清图片导出、撤销/重做、URL hash 注入
- [x] **阶段二：渲染与导出质量增强** —— Shiki 语法高亮、KaTeX 公式、表格 / 嵌套引用 / 任务列表、Markdown 图片混排、开源中文字体库、模板回归快照测试
- [ ] **阶段三：内容输入与自动化（进行中）**
  - [x] 内容 → 卡片智能推荐（`recommendStyle`）
  - [x] 长文 → 多卡智能拆分（自动容量 / 分割线拆分）与批量导出
  - [x] 单页标题模式（封面卡生成与无头渲染导出）
  - [x] AI 智能提取填写（长文本粘贴自动提取填入表单）
  - [x] 多卡长图无缝拼合导出
  - [x] 导出面板「复制 API 参数」功能
  - [ ] 批量出图流水线产品化
- [ ] **阶段四：分享与分发** —— 卡片分享链接协议增强、使用热度轻量统计
- [ ] **阶段五（远期可选）：多平台分发矩阵** —— 公众号 / 知乎 / 头条 / 小红书适配器

详见 [docs/ROADMAP.md](docs/ROADMAP.md)。

---

## 贡献指南

欢迎提交 Issue 与 Pull Request！请先阅读 [贡献指南](docs/CONTRIBUTING.md) 与 [AGENTS.md](AGENTS.md)。提交前请确保本地执行 `npm test` 与 `npm run build` 通过。

---

## 许可证

本项目采用 [MIT 许可证](LICENSE) © 2026 WePost Contributors。

---

## 关键词

**小红书**：小红书图片生成 · 小红书图文制作 · 小红书封面生成器 · 小红书配图工具 · 小红书笔记封面 · 小红书合集封面  
**微信**：朋友圈文案配图 · 朋友圈九宫格 · 朋友圈图片生成 · 微信公众号封面 · 公众号头图制作 · 公众号封面生成 · 微信视频号封面  
**文字转图片**：文字转图片 · 文字生成图片 · 文字做图工具 · 文字配图 · 一句话生成图片 · Markdown 转图片 · 代码转图片  
**图片形态**：长图生成 · 多图切块 · 封面卡生成 · 卡片图生成 · 图文卡片 · 在线做图工具 · 卡片生成器
