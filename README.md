# WePost

<div align="center">

**一站式社交媒体卡片生成器：把文字一键变成可导出的精美卡片图**

[![Deploy to GitHub Pages](https://github.com/zaneven/WePost/actions/workflows/deploy.yml/badge.svg)](https://github.com/zaneven/WePost/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](docs/CONTRIBUTING.md)

**🚀 在线体验 / Live Demo：<https://zaneven.github.io/WePost/>**

[中文文档](README.md) | [English](README.en.md) | [架构设计](docs/ARCHITECTURE.md) | [贡献指南](docs/CONTRIBUTING.md)

</div>

---

## 📖 项目简介

**WePost** 是专为自媒体创作者、内容运营者与开发者打造的**卡片生成工作台**。把金句、早报、随笔、开发笔记、态度观点等任意文字内容结构化为 `CardData`，自动匹配模板与画幅，实时渲染为精美卡片，并可一键导出高清图片，直接用于小红书、朋友圈、公众号封面等社交场景。

纯前端架构、无后端依赖，可一键静态部署到 Cloudflare Pages 或 GitHub Pages。

---

## 🌟 核心特性

- 🎨 **卡片渲染引擎**
  - Markdown / 富文本实时渲染：标题、段落、引用（含 `>>` 嵌套）、列表（含任务列表 `- [ ]` / `- [x]`）、表格、围栏代码块
  - 10 套精心设计的卡片模板（极简杂志、暗黑毛玻璃、复古报刊、温暖便签、东方留白、酸性潮流、水墨留白、终端代码、先锋杂志、霓虹赛博）
  - 5 种画幅比例（3:4 / 1:1 / 9:16 / 2.35:1 / 4:3），覆盖小红书、朋友圈、视频号、公众号封面等场景
  - 代码块语法高亮（[Shiki](https://shiki.style/)，按需加载控制产物体积）
  - 数学公式渲染（[KaTeX](https://katex.org/)：`$...$` 行内 / `$$...$$` 块级，字体经 `fontEmbedCSS` 嵌入导出图）
  - 跨平台 CJK 字体兜底（macOS / Windows / Linux 衬线 / 楷体 / 无衬线 / 等宽）
  - 统一尺寸数据源 `getCanvasDimensions`，杜绝多处硬编码导致的比例失真

- 🛠️ **内容编辑工作台**
  - 内容表单 + 样式工具栏 + 导出面板 + 顶栏 + 底部操作栏
  - 9 套内容预设，灵感速选一键套用
  - **智能匹配**：`recommendStyle` 启发式推荐器按内容块类型 / 长度 / 关键词推荐模板 + 画幅 + 字体，一键应用并给出推荐理由（纯函数，无 AI 依赖）
  - **长文拆分多卡**：按画幅 / 字号估算容量、以块为原子单位不跨卡，支持卡组导航与「导出全部」批量编号导出
  - **水印版权控制**：`showWatermark` 开关统一作用于全 10 套模板
  - 撤销 / 重做历史（`useCardHistory`），含 `localStorage` 持久化与键盘快捷键
  - 正文溢出实时预警（`useCardOverflow`），导出前避免内容被裁切

- 🖼️ **高清导出与自动化**
  - 浏览器内导出（`html-to-image`），支持 2x / 3x 缩放、PNG / JPEG
  - **PDF 导出**（`puppeteer-core`），适合长图与多卡合订
  - Puppeteer 自动化脚本，单卡 / 多卡批量出图与日更 / 早报流水线
  - URL hash 预填充注入协议（`#card=base64url-json`），外部 skill 或分享链接一键注入内容

- 🚀 **静态部署（双目标）**
  - 纯前端架构，`next build` 产物静态导出至 `out/`
  - 一键部署至 Cloudflare Pages（根路径）或 GitHub Pages（子路径，GitHub Actions 自动构建）
  - 无后端依赖，零运维成本

---

## 🛠️ 技术栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端应用** | Next.js 14 (App Router), React 18, TypeScript 5 | 纯静态导出，无服务端运行时 |
| **样式与组件** | Tailwind CSS, Lucide Icons | 统一采用矢量图标，UI 禁用 Emoji |
| **卡片渲染** | 自研渲染引擎 + 模板组件 | 画板舞台、渲染器、模板注册表 |
| **Markdown** | 自研块解析 + Shiki + KaTeX | 标题 / 引用 / 列表 / 表格 / 代码块 + 语法高亮 + 数学公式 |
| **图片导出** | html-to-image, file-saver | 浏览器内 2x / 3x PNG / JPEG 导出 |
| **PDF 与自动化** | puppeteer-core | PDF 导出 + 无头批量出图脚本 |
| **部署** | Cloudflare Pages (wrangler) + GitHub Pages (Actions) | 双静态托管目标 |

> 数据层（Prisma + PostgreSQL）、缓存与队列（Redis + BullMQ）、对象存储与多平台发布 API 为**远期可选**能力，当前静态卡片生成器架构不依赖，详见 [路线图阶段五](docs/ROADMAP.md)。

---

## 🚀 快速上手

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

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可进入 WePost 卡片工作台。

### 4. 生产构建

```bash
# 静态导出至 out/（默认根路径，适配 Cloudflare Pages）
npm run build
```

### 5. 测试

```bash
npm test        # 单次运行（vitest）
npm run test:watch
```

---

## ☁️ 部署

WePost 为纯静态产物（`output: 'export'` → `out/`），支持两套托管目标，共享同一份代码：`next.config.mjs` 中的 `basePath` / `assetPrefix` 由 `GITHUB_PAGES` 环境变量控制，仅在 GitHub Pages 子路径部署时注入，不影响 Cloudflare Pages 根路径部署。

### 方式 A：Cloudflare Pages（根路径）

```bash
npm run deploy          # 构建 + wrangler 部署到 wepost 项目
# 或预览分支
npm run deploy:preview
```

### 方式 B：GitHub Pages（子路径，自动 CI）

推送到 `main` 分支即触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：

1. 以 `GITHUB_PAGES=true` 执行 `next build`，注入 `/<repo>` 子路径
2. 写入 `out/.nojekyll`，确保 `_next` 等下划线目录被服务
3. 上传 `out/` 为 Pages 构建产物并发布

部署地址：<https://zaneven.github.io/WePost/>

> 首次使用需在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**（本项目已配置）。

---

## 📂 目录结构

```
WePost/
├── .github/workflows/         # CI：GitHub Pages 自动部署
├── .claude/
│   ├── agents/                # AI Agent 角色配置
│   └── skills/wepost-card-gen # 把文字一键做成卡片的 Claude skill
├── docs/                      # 项目深度设计文档
│   ├── ARCHITECTURE.md        # 系统架构设计
│   ├── CONTRIBUTING.md        # 贡献与协作规范
│   └── ROADMAP.md             # 里程碑与迭代计划
├── scripts/                   # 自动化脚本
│   ├── export-card*.mjs       # Puppeteer 单卡 / 多卡批量出图
│   ├── export-daily.mjs       # 日更流水线
│   └── gen-card-url.mjs       # CardData → 预填充 URL 编码工具
├── src/
│   ├── app/                   # 路由与页面视图（/ 与 /export）
│   ├── components/
│   │   ├── canvas/            # 画板舞台、渲染器、缩略图
│   │   ├── templates/         # 10 套卡片模板实现
│   │   ├── editor/            # 内容表单、样式工具栏、导出面板
│   │   └── ui/                # 基础 UI 组件（Toast 等）
│   ├── core/
│   │   ├── templates/         # 模板与画幅元数据注册表（唯一尺寸数据源）
│   │   ├── markdown/          # Markdown 块解析
│   │   ├── split/             # 长文 → 多卡分块与容量估算
│   │   ├── match/             # 内容 → 模板/画幅/字体 智能推荐
│   │   └── export/            # 图片 / PDF 导出管线
│   ├── data/presets.ts        # 内容预设
│   ├── lib/                   # hooks 与工具（导出、历史、溢出、注入、文件名）
│   └── types/card.ts          # CardData 核心类型定义
├── tests/                     # 自动化测试（vitest）
├── AGENTS.md                  # 智能体协作与硬性约束指南
├── README.md / README.en.md   # 中英主文档
└── LICENSE                    # MIT 许可证
```

---

## 🤖 智能体与开发者规范 (AGENTS.md)

本项目深度支持 AI 智能体协作开发。所有开发者及智能体请严格遵守 [AGENTS.md](AGENTS.md) 中定义的铁律：

1. **统一语言**：计划与沟通回复全流程采用中文。
2. **矢量图标**：前端 UI 严禁使用 Emoji，统一采用 `Lucide React` 矢量图标。
3. **卡片预填充契约**：外部注入卡片数据须遵循 `#card=base64url-json` 协议，详见 AGENTS.md §5。

外部可通过 `wepost-card-gen` Claude skill 一键把任意文字内容结构化为卡片并在浏览器中打开预填充 URL。

---

## 🗺️ 路线图 (Roadmap)

- [x] **阶段一：卡片生成核心** —— 渲染引擎、10 模板、5 画幅、编辑器、图片导出、撤销 / 重做、URL hash 预填充、Cloudflare Pages 部署、测试基线
- [x] **阶段二：渲染与导出质量增强** —— Shiki 语法高亮、KaTeX 公式、表格 / 嵌套引用 / 任务列表、跨平台 CJK 字体兜底、导出稳定性、水印标准化、模板 × 画幅视觉回归快照测试
- [ ] **阶段三：内容输入与自动化（进行中）**
  - [x] 内容 → 卡片智能匹配（`recommendStyle`）
  - [x] 长文 → 多卡拆分与批量导出
  - [ ] AI 辅助：文案润色、摘要与金句提炼、封面卡生成
  - [ ] 批量出图流水线产品化、内容预设库扩充
- [ ] **阶段四：分享与分发** —— 卡片分享链接、使用热度看板
- [ ] **阶段五（远期可选）：多平台分发矩阵** —— 公众号 / 知乎 / 头条 / 小红书

详见 [docs/ROADMAP.md](docs/ROADMAP.md)。

---

## 🤝 贡献

欢迎提交 Issue 与 Pull Request！请先阅读 [贡献指南](docs/CONTRIBUTING.md) 与 [AGENTS.md](AGENTS.md) 中的协作约束。提交前请确保 `npm test` 与 `npm run build` 通过。

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) © 2026 WePost Contributors。
