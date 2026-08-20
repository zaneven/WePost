import React from 'react';

interface CardLayoutProps {
  /**
   * 外壳差异化样式：背景、文字、内边距、字体、边框、阴影等。
   * 不包含 w-full h-full / flex 结构 / relative overflow / select-none，
   * 这些由 CardLayout 统一提供，避免 6 个模板重复声明。
   */
  className: string;
  children: React.ReactNode;
}

/**
 * 卡片模板统一外壳骨架。
 * 提供纵向 flex + justify-between + relative overflow-hidden + select-none 结构，
 * 各模板仅传入差异化的 bg / text / font / border / shadow 等，内部 header / main / footer
 * 与装饰元素保持原样。
 */
export const CardLayout: React.FC<CardLayoutProps> = ({ className, children }) => (
  <div
    className={`w-full h-full flex flex-col justify-between select-none relative overflow-hidden ${className}`}
  >
    {children}
  </div>
);
