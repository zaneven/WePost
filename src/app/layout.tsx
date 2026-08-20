import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WePost - 现代微信贴图号图片生成器 & 高审美排版工作台',
  description:
    '专为自媒体创作者打造的高设计感文字贴图与图片生成器，支持 6 款风格模版、Markdown 语法排版、多比例适配与 Retina 超清一键导出。',
  applicationName: 'WePost',
  authors: [{ name: 'WePost' }],
  keywords: [
    '微信贴图',
    '公众号图片',
    '小红书配图',
    '文字转图片',
    'Markdown 排版',
    '卡片生成器',
  ],
  openGraph: {
    title: 'WePost - 高审美排版工作台',
    description: '现代微信贴图号图片生成器，6 款风格模版、Retina 超清一键导出。',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WePost - 高审美排版工作台',
    description: '现代微信贴图号图片生成器，6 款风格模版、Retina 超清一键导出。',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-[100dvh] bg-neutral-950 text-neutral-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
