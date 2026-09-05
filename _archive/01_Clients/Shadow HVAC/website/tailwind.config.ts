import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shadow: {
          950: "#05070c",
          900: "#0a0e16",
          850: "#0e131d",
          800: "#121826",
          700: "#1a2233",
          600: "#26314a",
          500: "#3a4767",
        },
        ember: {
          DEFAULT: "#ff5a1f",
          light: "#ff8a3d",
          dark: "#e23c00",
          glow: "#ff6b35",
        },
        ice: {
          DEFAULT: "#38bdf8",
          light: "#7dd3fc",
          dark: "#0ea5e9",
          glow: "#22d3ee",
        },
        gold: {
          DEFAULT: "#f4b740",
          light: "#fbd06b",
          dark: "#d99a1f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ember: "0 0 40px -8px rgba(255,90,31,0.55)",
        ice: "0 0 40px -8px rgba(56,189,248,0.55)",
        card: "0 20px 60px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
