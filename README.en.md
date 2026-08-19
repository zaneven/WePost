# WePost

<div align="center">

**Modern All-in-One Content Typography, AI Creation & Multi-Platform Publishing Engine**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[中文文档](README.md) | [English](README.en.md) | [Architecture](docs/ARCHITECTURE.md) | [Contributing](docs/CONTRIBUTING.md)

</div>

---

## 📖 Introduction

**WePost** is a high-performance content creation and distribution workbench designed for content creators, developers, and media operation teams. It combines modern Markdown writing experience, highly customizable rich-text typography styling, and automated multi-channel publishing to eliminate the friction of traditional multi-platform content publishing.

---

## 🌟 Key Features

- 🎨 **Professional Typography Engine**
  - Real-time Markdown / Rich Text bidirectional rendering
  - WeChat Official Account compatible CSS inlining and sanitization
  - Rich typography presets, code syntax highlighting, and LaTeX math formulas
  - Beautiful quote cards, automated footnotes, dividers, and copyright badges

- 🚀 **Multi-Platform Publishing Center**
  - **WeChat Official Platform**: One-click push to draft box, permanent material library, and broadcast
  - **Extensible Channels**: Modular `IPublisher` architecture supporting Zhihu, Toutiao, Xiaohongshu, etc.
  - **Task Queue**: Asynchronous job handling, automatic retries, and real-time status callbacks

- 🤖 **AI-Powered Creation Suite**
  - Topic recommendation, outline expansion, and text polishing
  - AI cover image and illustration generation
  - Smart summary extraction and compliance checks

- 🖼️ **Media Asset Manager**
  - Anti-hotlinking image mirroring and local caching
  - Intelligent image compression, resizing, and WebP conversion
  - Multi-storage drivers: Local, Volcengine TOS, Aliyun OSS, and AWS S3

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI, Lucide Icons (Emoji prohibited in UI)
- **Core Engine**: Unified, Remark, Rehype, Juice
- **Backend / ORM**: Node.js, Prisma ORM, PostgreSQL / SQLite
- **Queue / Async**: Redis / BullMQ

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18.18.0 (20.x+ recommended)
- npm / pnpm / yarn
- Git

### 2. Setup

```bash
# Clone repository
git clone <repo-url> WePost
cd WePost

# Copy environment config
cp .env.example .env

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start creating.

---

## 📄 License

Licensed under the [MIT License](LICENSE).
