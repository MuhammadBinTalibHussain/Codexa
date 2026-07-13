/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f0ff", 100: "#ede1ff", 200: "#d9c2ff", 300: "#bd93ff",
          400: "#a05bff", 500: "#8b2fff", 600: "#7a1de8", 700: "#6516bd",
          800: "#521699", 900: "#44167c",
        },
        surface: { light: "#ffffff", DEFAULT: "#f7f6fb", dark: "#16171d" },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "Consolas", "monospace"],
      },
      spacing: { 18: "4.5rem" },
    },
  },
  plugins: [],
};