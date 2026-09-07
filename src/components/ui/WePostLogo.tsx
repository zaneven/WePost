import React from 'react';

interface WePostLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showShadow?: boolean;
}

/**
 * WePost 官方应用 Logo 矢量组件。
 *
 * 核心设计寓意：
 * 1. 渐变 Squircle 底座：象征现代、活力与设计感（Emerald - Teal - Cyan）
 * 2. 双层卡片叠加：体现社交媒体多卡连载、排版层次与深度留白
 * 3. 顶层卡片与 W 符印：融合经典 3:4 社交卡片比例与动感双 V 笔画，一眼识别品牌
 */
export const WePostLogo: React.FC<WePostLogoProps> = ({
  size = 32,
  className = '',
  showShadow = true,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
      aria-label="WePost Logo"
      {...props}
    >
      <defs>
        <linearGradient id="wp-logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="48%" stop-color="#0D9488" />
          <stop offset="100%" stop-color="#0891B2" />
        </linearGradient>
        <linearGradient id="wp-logo-card" x1="6.5" y1="7" x2="21.5" y2="26.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#F1F5F9" />
        </linearGradient>
        {showShadow && (
          <filter id="wp-logo-shadow" x="3" y="5" width="22" height="26" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#022c22" flood-opacity="0.25" />
          </filter>
        )}
      </defs>

      {/* 外层 Squircle 圆角底座 */}
      <rect width="32" height="32" rx="8" fill="url(#wp-logo-bg)" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7.5"
        stroke="rgba(255,255,255,0.25)"
        stroke-width="1"
      />

      {/* 后置叠层卡片 */}
      <rect
        x="9.5"
        y="5.5"
        width="13.5"
        height="18"
        rx="2.5"
        transform="rotate(8 9.5 5.5)"
        fill="white"
        fillOpacity="0.32"
      />

      {/* 前置主卡片（3:4 比例社交卡片） */}
      <rect
        x="6.5"
        y="7"
        width="15"
        height="19.5"
        rx="3"
        fill="url(#wp-logo-card)"
        filter={showShadow ? 'url(#wp-logo-shadow)' : undefined}
      />

      {/* 卡片排版元素（类别标签与原点） */}
      <rect x="9.5" y="9.5" width="4.5" height="1.5" rx="0.75" fill="#0D9488" />
      <circle cx="16.5" cy="10.25" r="0.75" fill="#94A3B8" />
      <circle cx="18.5" cy="10.25" r="0.75" fill="#CBD5E1" />

      {/* 核心 W 符印 */}
      <path
        d="M9.5 13.5L12 21.5L14 16.5L16 21.5L18.5 13.5"
        stroke="#0F172A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
