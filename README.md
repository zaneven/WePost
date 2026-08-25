# WePost

<div align="center">

**一站式社交媒体卡片生成器：把文字一键变成可导出的精美卡片图**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](docs/CONTRIBUTING.md)

[中文文档](README.md) | [English](README.en.md) | [架构设计](docs/ARCHITECTURE.md) | [贡献指南](docs/CONTRIBUTING.md)

</div>

---

## 📖 项目简介

**WePost** 是专为自媒体创作者、内容运营者与开发者打造的高性能**卡片生成工作台**。把金句、早报、随笔、开发笔记、态度观点等任意文字内容结构化为 `CardData`，自动匹配模板与画幅，实时渲染为精美卡片，并可一键导出高清图片，直接用于小红书、朋友圈、公众号封面等社交场景。

---

## 🌟 核心特性

- 🎨 **卡片渲染引擎**
  - Markdown / 富文本实时渲染（标题、段落、引用、列表、代码块）
  - 10 套精心设计的卡片模板（极简杂志、暗黑毛玻璃、复古报刊、温暖便签、东方留白、酸性潮流、水墨留白、终端代码、先锋杂志、霓虹赛博）
  - 5 种画幅比例（3:4 / 1:1 / 9:16 / 2.35:1 / 4:3），覆盖小红书、朋友圈、视频号、公众号封面等场景
  - 统一尺寸数据源，杜绝多处硬编码导致的比例失真

- 🛠️ **内容编辑工作台**
  - 内容表单 + 样式工具栏 + 导出面板 + 顶栏 + 底部操作栏
  - 9 套内容预设，灵感速选一键套用
  - 撤销 / 重做历史，含 `localStorage` 持久化与键盘快捷键
  - 正文溢出实时预警，导出前避免内容被裁切

- 🖼️ **高清导出与自动化**
  - 基于 `html-to-image` 的浏览器内导出，支持 2x / 3x 缩放、PNG / JPEG
  - Puppeteer 自动化脚本，批量出图与日更 / 早报流水线
  - URL hash 预填充注入协议（`#card=base64url-json`），外部 skill 或分享链接一键注入内容

- 🚀 **静态部署**
  - 纯前端架构，`next build` 产物静态导出，一键部署至 Cloudflare Pages
  - 无后端依赖，零运维成本

---

## 🛠️ 技术栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端应用** | Next.js (App Router), React, TypeScript | 纯静态导出，无服务端运行时 |
| **样式与组件** | Tailwind CSS, Lucide Icons | 统一采用矢量图标，禁止 Emoji |
| **卡片渲染** | 自研渲染引擎 + 模板组件 | 画板舞台、渲染器、模板注册表 |
| **图片导出** | html-to-image, Puppeteer | 浏览器内导出 + 无头自动化 |
| **部署** | Cloudflare Pages (wrangler) | 静态托管，边缘分发 |

> 数据层（Prisma + PostgreSQL）、缓存与队列（Redis + BullMQ）、对象存储与多平台发布 API 为**远期可选**能力，当前静态卡片生成器架构不依赖，详见 [路线图阶段五](docs/ROADMAP.md)。

---

## 🚀 快速上手

### 1. 环境准备
确保本机已安装以下环境：
- Node.js >= 18.18.0 (推荐 20.x+)
- npm >= 9.x
- Git

### 2. 克隆项目与安装依赖

```bash
cd WePost
npm install
```

### 3. 启动开发服务

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可进入 WePost 卡片工作台。

### 4. 导出与部署

```bash
# 生产构建（静态导出至 out/）
npm run build

# 部署至 Cloudflare Pages
npm run deploy
```

---

## 📂 目录结构

```
WePost/
├── .claude/
│   ├── agents/                # AI Agent 角色配置
│   └── skills/wepost-card-gen # 把文字一键做成卡片的 Claude skill
├── docs/                      # 项目深度设计文档
│   ├── ARCHITECTURE.md        # 系统架构设计
│   ├── CONTRIBUTING.md        # 贡献与协作规范
│   └── ROADMAP.md             # 里程碑与迭代计划
├── scripts/                  # 自动化脚本
│   ├── export-card*.mjs       # Puppeteer 批量出图
│   ├── export-daily.mjs       # 日更流水线
│   └── gen-card-url.mjs       # CardData → 预填充 URL 编码工具
├── src/
│   ├── app/                   # 路由与页面视图
│   ├── components/
│   │   ├── canvas/            # 画板舞台、渲染器、缩略图
│   │   ├── templates/          # 10 套卡片模板实现
│   │   ├── editor/             # 内容表单、样式工具栏、导出面板
│   │   └── ui/                 # 基础 UI 组件（Toast 等）
│   ├── core/
│   │   ├── templates/          # 模板与画幅元数据注册表（唯一尺寸数据源）
│   │   └── export/             # 图片导出管线
│   ├── data/presets.ts         # 内容预设
│   ├── lib/                    # hooks 与工具（导出、历史、溢出、注入、文件名）
│   └── types/card.ts           # CardData 核心类型定义
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

---

## 🗺️ 路线图 (Roadmap)

- [x] **阶段一**：卡片生成核心（渲染引擎、10 模板、5 画幅、编辑器、导出、历史、预填充、部署）
- [ ] **阶段二**：渲染与导出质量增强（Shiki 高亮、KaTeX 公式、字体子集、导出稳定性）
- [ ] **阶段三**：内容输入与自动化（智能匹配、AI 辅助、批量出图流水线）
- [ ] **阶段四**：分享与分发（分享链接、数据回流看板）
- [ ] **阶段五（远期可选）**：多平台分发矩阵（公众号 / 知乎 / 头条 / 小红书）

详见 [docs/ROADMAP.md](docs/ROADMAP.md)。

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。
