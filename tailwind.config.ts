import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: {
          950: "#0b0b10",
        },
        solar: {
          50: "#fff4e5",
          400: "#ff8a3d",
          500: "#ff6a2d",
          600: "#e7531f",
        },
        tide: {
          200: "#b6f0ff",
          400: "#4fd3ff",
          600: "#1aa9d9",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(6, 8, 22, 0.3)",
        card: "0 18px 40px rgba(6, 8, 22, 0.35)",
      },
      backgroundImage: {
        "grid-glow": "radial-gradient(circle at top left, rgba(79, 211, 255, 0.28), transparent 60%), radial-gradient(circle at bottom right, rgba(255, 106, 45, 0.22), transparent 55%), linear-gradient(180deg, #0b0b10 0%, #121826 65%, #0b0b10 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
