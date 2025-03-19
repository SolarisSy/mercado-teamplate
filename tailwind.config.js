/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#102F70",
        secondary: "#e12428",
        dark: "#333",
        light: "#ffffff",
        success: "#28a745",
        danger: "#e12428",
        warning: "#ffc107",
        info: "#102F70",
      },
    },
  },
  plugins: ["@tailwindcss/forms"],
};
