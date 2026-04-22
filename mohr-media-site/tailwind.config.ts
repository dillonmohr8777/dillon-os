import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        electric: "#2F6BFF",
        fog: "#F5F7FA",
        ink: "#1E293B",
        mist: "#E6EEFF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(47, 107, 255, 0.35)",
        lift: "0 24px 48px -12px rgba(11, 31, 58, 0.25)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(47,107,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(47,107,255,0.06) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at top, rgba(47,107,255,0.25), transparent 60%)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2.8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(47,107,255,0.45)" },
          "50%": { boxShadow: "0 0 40px 8px rgba(47,107,255,0.35)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
