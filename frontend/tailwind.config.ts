import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#08090b",
          900: "#0d0e11",
          800: "#15171c",
          700: "#1d2027",
          600: "#2a2e38",
          500: "#414752",
          400: "#6b7280",
          300: "#9ba1ac",
          200: "#c8ccd4",
          100: "#e7e9ee",
        },
        accent: {
          DEFAULT: "#ff5d5d",
          soft: "#ffd5d5",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
