# WePost

<div align="center">

**一站式现代内容排版、智能创作与多平台发布引擎**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](docs/CONTRIBUTING.md)

[中文文档](README.md) | [English](README.en.md) | [架构设计](docs/ARCHITECTURE.md) | [贡献指南](docs/CONTRIBUTING.md)

</div>

---

## 📖 项目简介

**WePost** 是专为自媒体创作者、开发者、内容运营团队打造的高性能内容生产与分发工作台。它将现代 Markdown 写作体验、高度可定制的富文本排版引擎与多渠道自动化发布能力完美融合，解决传统公众号与多平台排版繁琐、格式错乱、分发效率低下的痛点。

---

## 🌟 核心特性

- 🎨 **专业级排版引擎**
  - Markdown / 富文本实时双向渲染
  - 微信公众号兼容的自动化 CSS 样式内联与净化
  - 丰富的主题预设、代码高亮（Prism/Shiki）与 LaTeX 数学公式支持
  - 精美引用卡片、脚注自动生成、图文分割线与版权模块

- 🚀 **多平台发布中心**
  - **微信公众平台**：一键推送到草稿箱、永久图文素材库与群发准备
  - **多渠道扩展**：模块化 `IPublisher` 架构，支持知乎、今日头条、小红书等多渠道适配
  - **发布任务队列**：支持批量分发、失败重试、异步任务追踪与发布状态回执

- 🤖 **AI 智能创作套件**
  - 智能选题推荐与文章大纲扩写
  - 文案润色、风格切换与错别字/敏感词合规检测
  - AI 自动提炼摘要与封面图/插图智能生成接入

- 🖼️ **全功能媒体素材库**
  - 微信防盗链图片自动转存与本地化
  - 智能图片压缩、尺寸裁剪与 WebP 转换
  - 支持本地存储、火山引擎 TOS、阿里云 OSS 与 AWS S3

---

## 🛠️ 技术栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端应用** | Next.js (App Router), React, TypeScript | 现代全栈 Web 架构 |
| **样式与组件** | Tailwind CSS, Radix UI, Lucide Icons | 统一采用矢量图标，禁止 Emoji |
| **排版核心** | Unified, Remark, Rehype, Juice (CSS Inline) | 保证微信环境 100% 样式兼容 |
| **数据与存储** | Prisma ORM, PostgreSQL / SQLite | 稳健的数据持久化与迁移支持 |
| **任务与队列** | Redis / BullMQ (可选) | 异步发布与长任务调度 |

---

## 🚀 快速上手

### 1. 环境准备
确保本机已安装以下环境：
- Node.js >= 18.18.0 (推荐 20.x+)
- pnpm >= 8.x 或 npm >= 9.x
- Git

### 2. 克隆项目与安装依赖

```bash
# 进入项目目录
cd WePost

# 安装依赖 (待 package.json 就绪后)
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模版
cp .env.example .env

# 编辑 .env 填入你的数据库连接、微信公众号密钥及 AI API Key
vim .env
```

### 4. 启动开发服务

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可进入 WePost 工作台。

---

## 📂 目录结构

```
WePost/
├── .claude/                # AI Agent 角色与提示词
├── docs/                   # 架构、贡献与路线图文档
│   ├── ARCHITECTURE.md     # 系统架构设计
│   ├── CONTRIBUTING.md     # 贡献与协作规范
│   └── ROADMAP.md          # 迭代路线图
├── src/                    # 源代码
│   ├── app/                # 路由与页面视图
│   ├── components/         # UI 基础组件 (全矢量图标)
│   ├── core/               # 排版解析、样式内联与发布驱动
│   ├── lib/                # 工具库与客户端实例
│   ├── server/             # 后端 API 路由与业务服务
│   └── types/              # TypeScript 类型定义
├── .editorconfig           # 代码风格配置
├── .env.example            # 环境变量模版
├── .gitignore              # Git 忽略配置
├── AGENTS.md               # 智能体协作与硬性约束指南
├── LICENSE                 # 开源许可证
├── README.md               # 中文主文档
└── README.en.md            # 英文说明
```

---

## 🤖 智能体与开发者规范 (AGENTS.md)

本项目深度支持 AI 智能体协作开发。所有开发者及智能体请严格遵守 [AGENTS.md](AGENTS.md) 中定义的铁律：
1. **统一语言**：计划与沟通回复全流程采用中文。
2. **矢量图标**：前端 UI 严禁使用 Emoji，统一采用 `Lucide React` 矢量图标。
3. **Admin 闭环**：修改 admin 模块后必须完成测试并推送/部署到生产环境。

---

## 🗺️ 路线图 (Roadmap)

- [x] 项目基础脚手架与规范初始化
- [ ] 核心 Markdown 解析器与微信样式内联器
- [ ] 多主题预设（经典黑白、文艺青绿、科技幽蓝等）
- [ ] 微信公众平台草稿箱 API 对接
- [ ] AI 辅助排版与封面图生成模块
- [ ] 知乎、头条等多平台发布适配器

详见 [docs/ROADMAP.md](docs/ROADMAP.md)。

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。
