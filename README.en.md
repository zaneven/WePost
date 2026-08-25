# WePost

<div align="center">

**All-in-One Social Media Card Generator: turn text into beautiful, exportable card images**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](docs/CONTRIBUTING.md)

[中文文档](README.md) | [English](README.en.md) | [Architecture](docs/ARCHITECTURE.md) | [Contributing](docs/CONTRIBUTING.md)

</div>

---

## 📖 Introduction

**WePost** is a high-performance card generation workbench for content creators, media operators, and developers. It structures any text—quotes, daily briefings, essays, dev notes, opinions—into `CardData`, auto-matches a template and aspect ratio, renders it as a beautiful card in real time, and exports high-resolution images ready for Xiaohongshu, WeChat Moments, and Official Account covers.

---

## 🌟 Key Features

- 🎨 **Card Rendering Engine**
  - In-card Markdown / rich text rendering (headings, paragraphs, quotes, lists, code blocks)
  - 10 hand-crafted card templates (Minimal Magazine, Dark Glass, Vintage Press, Warm Memo, Zen Aesthetic, Acid Bold, Ink Wash, Terminal Code, Editorial Bold, Neon Cyber)
  - 5 aspect ratios (3:4 / 1:1 / 9:16 / 2.35:1 / 4:3) covering Xiaohongshu, Moments, video covers, and Official Account headers
  - Single source of truth for dimensions—no hardcoded ratios

- 🛠️ **Content Editor Workbench**
  - Content form + style toolbar + export panel + header + bottom action bar
  - 9 content presets for instant inspiration
  - Undo / redo history with `localStorage` persistence and keyboard shortcuts
  - Real-time overflow warning to avoid cropped exports

- 🖼️ **High-Res Export & Automation**
  - In-browser export via `html-to-image`, supporting 2x / 3x scale, PNG / JPEG
  - Puppeteer automation scripts for batch export and daily-briefing pipelines
  - URL hash prefill protocol (`#card=base64url-json`) for one-click content injection from external skills or share links

- 🚀 **Static Deployment**
  - Pure frontend architecture, statically exported via `next build`, one-click deploy to Cloudflare Pages
  - No backend, zero ops overhead

---

## 🛠️ Tech Stack

| Layer | Stack | Notes |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript | Static export, no server runtime |
| **UI** | Tailwind CSS, Lucide Icons | Vector icons only, no Emoji |
| **Card Rendering** | In-house engine + template components | Stage, renderer, template registry |
| **Image Export** | html-to-image, Puppeteer | In-browser + headless automation |
| **Deploy** | Cloudflare Pages (wrangler) | Static hosting, edge delivery |

> Data layer (Prisma + PostgreSQL), cache/queue (Redis + BullMQ), object storage, and multi-platform publishing APIs are **far-future optional** capabilities not used by the current static card generator. See [Roadmap Phase 5](docs/ROADMAP.md).

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18.18.0 (20.x+ recommended)
- npm >= 9.x
- Git

### 2. Setup

```bash
cd WePost
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open the WePost card workbench.

### 3. Build & Deploy

```bash
# Production build (static export to out/)
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

---

## 🗺️ Roadmap

- [x] **Phase 1**: Card generation core (engine, 10 templates, 5 ratios, editor, export, history, prefill, deploy)
- [ ] **Phase 2**: Rendering & export quality (Shiki highlighting, KaTeX formulas, font subsetting, export stability)
- [ ] **Phase 3**: Content input & automation (smart matching, AI assist, batch pipeline)
- [ ] **Phase 4**: Sharing & distribution (share links, lightweight analytics)
- [ ] **Phase 5 (far-future optional)**: Multi-platform publishing matrix (Official Account / Zhihu / Toutiao / Xiaohongshu)

See [docs/ROADMAP.md](docs/ROADMAP.md).

---

## 📄 License

Licensed under the [MIT License](LICENSE).
