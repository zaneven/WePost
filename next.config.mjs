/** @type {import('next').NextConfig} */
const nextConfig = {
  // 严格模式：开发期双调用 effect / reducer 以暴露副作用。
  // useCardHistory 已规避嵌套 state updater，replace 与键盘 effect 均幂等，可安全开启。
  reactStrictMode: true,
  // 移除 X-Powered-By 响应头，减少技术栈暴露
  poweredByHeader: false,
  // 生产构建压缩（默认开启，显式声明以便后续统一调整）
  compress: true,
};

export default nextConfig;
