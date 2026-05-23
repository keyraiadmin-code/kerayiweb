import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0e8a5b",
          dark: "#0a6b46",
          light: "#10a86e",
        },
        gold: {
          DEFAULT: "#c79949",
          dark: "#a07a35",
          light: "#d4aa62",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Ethiopic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
