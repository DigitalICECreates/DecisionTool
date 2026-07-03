import type { Config } from "tailwindcss";

/**
 * ICE Creates brand tokens.
 * Dark navy + yellow accent + the 7-colour spectrum palette, exactly as the
 * prototype and the developer brief (§3.1) specify.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ice: {
          dark: "#1A1130",
          yellow: "#F5C832",
          green: "#9DD13A",
          teal: "#2EC4B4",
          blue: "#59C4F0",
          purple: "#A88FD8",
          pink: "#F040A0",
          coral: "#EF5656",
          white: "#FFFFFF",
          offwhite: "#F7F6FA",
          light: "#EEECF5",
          mid: "#C4BED8",
          muted: "#7A7290",
        },
      },
      fontFamily: {
        // Poppins is loaded via next/font and exposed as a CSS variable.
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(26,17,48,0.10)",
        auth: "0 30px 80px rgba(0,0,0,0.4)",
        sheet: "0 -16px 60px rgba(26,17,48,0.25)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(239,86,86,0.31)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 0 6px rgba(239,86,86,0)" },
        },
      },
      animation: {
        "mic-pulse": "pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
