/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gojo: {
          blue: "#4A90D9",
          dark: "#1a1a2e",
          purple: "#6C3CE1",
          light: "#e8f0fe",
        },
      },
    },
  },
  plugins: [],
};
