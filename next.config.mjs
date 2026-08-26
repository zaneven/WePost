/** @type {import('next').NextConfig} */

// GitHub Pages 项目站点托管在子路径（https://<user>.github.io/<repo>/），
// 需为静态产物注入 basePath / assetPrefix，使 _next 等资源从子路径加载。
// 仅在 CI 设置 GITHUB_PAGES=true 时启用，避免影响 Cloudflare Pages 根路径部署。
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = isGitHubPages ? `/${repoName}` : '';
const assetPrefix = isGitHubPages ? `/${repoName}/` : undefined;

const nextConfig = {
  // 静态导出配置（构建产物输出至 out 文件夹，适配 Cloudflare Pages / GitHub Pages 静态托管）
  output: 'export',
  // GitHub Pages 子路径：basePath 指向 /<repo>，assetPrefix 带尾斜杠指向资源目录
  basePath,
  assetPrefix,
  images: {
    unoptimized: true,
  },
  // 严格模式：开发期双调用 effect / reducer 以暴露副作用。
  // useCardHistory 已规避嵌套 state updater，replace 与键盘 effect 均幂等，可安全开启。
  reactStrictMode: true,
  // 移除 X-Powered-By 响应头，减少技术栈暴露
  poweredByHeader: false,
  // 生产构建压缩（默认开启，显式声明以便后续统一调整）
  compress: true,
};

export default nextConfig;
