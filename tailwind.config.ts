import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(210 18% 90%)",
        input: "hsl(210 18% 90%)",
        ring: "hsl(220 80% 56%)",
        background: "hsl(210 33% 99%)",
        foreground: "hsl(222 38% 11%)",
        primary: {
          DEFAULT: "hsl(222 47% 11%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222 47% 11%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(215 16% 47%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222 47% 11%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222 47% 11%)",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(15, 23, 42, 0.22)",
        card: "0 14px 28px -18px rgba(15, 23, 42, 0.24)",
      },
      backgroundImage: {
        "workflow-thumb":
          "radial-gradient(circle at top left, rgba(255,255,255,0.42), transparent 28%), linear-gradient(135deg, #1f2937 0%, #475569 32%, #0f172a 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
