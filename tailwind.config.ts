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
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Songti SC", "SimSun", "serif"],
        mono: ["var(--font-mono)", "Menlo", "Monaco", "monospace"],
        kaiti: ["STKaiti", "KaiTi", "楷体", "serif"],
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
