import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
      },
      fontFamily: {
        // 跨平台 CJK 兜底：macOS（PingFang/Songti/STKaiti）、Windows（Microsoft YaHei/SimSun/KaiTi）、
        // Linux（Noto Serif SC / Source Han Serif SC），无需打包 web 字体即可在导出图获得合理字形。
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Microsoft YaHei",
          "Hiragino Sans GB",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Songti SC",
          "Noto Serif SC",
          "Source Han Serif SC",
          "SimSun",
          "宋体",
          "serif",
        ],
        mono: [
          "var(--font-mono)",
          "Menlo",
          "Monaco",
          "Consolas",
          "Courier New",
          "monospace",
        ],
        kaiti: [
          "STKaiti",
          "KaiTi",
          "楷体",
          "Noto Serif SC",
          "Songti SC",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 30px 60px -12px rgba(0, 0, 0, 0.15)",
        "inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
        glow: "0 0 25px rgba(59, 130, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
