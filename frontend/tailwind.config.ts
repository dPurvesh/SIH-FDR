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
        aicte: {
          navy: "#0D3B66",
          dark: "#08233D",
          gold: "#F4A261",
          goldDark: "#E76F51",
          light: "#F0F4F8",
        },
      },
      keyframes: {
        pulseGlowRed: {
          "0%, 100%": {
            boxShadow: "0 0 15px 3px rgba(239, 68, 68, 0.7)",
            borderColor: "rgba(239, 68, 68, 1)",
          },
          "50%": {
            boxShadow: "0 0 4px 1px rgba(239, 68, 68, 0.3)",
            borderColor: "rgba(239, 68, 68, 0.5)",
          },
        },
        pulseGlowGreen: {
          "0%, 100%": {
            boxShadow: "0 0 12px 2px rgba(16, 185, 129, 0.6)",
            borderColor: "rgba(16, 185, 129, 0.9)",
          },
          "50%": {
            boxShadow: "0 0 3px 1px rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 0.4)",
          },
        },
      },
      animation: {
        "pulse-glow-red": "pulseGlowRed 1.8s infinite",
        "pulse-glow-green": "pulseGlowGreen 2.2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;

