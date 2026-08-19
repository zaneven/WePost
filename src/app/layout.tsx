import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WePost - 现代微信贴图号图片生成器 & 高审美排版工作台',
  description: '专为自媒体创作者打造的高设计感文字贴图与图片生成器，支持 6 款风格模版、Markdown 语法排版、多比例适配与 Retina 超清一键导出。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-neutral-950 text-neutral-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
