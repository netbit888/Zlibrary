/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
      },
    },
    extend: {
      colors: {
        paper: "#F6F4EF",
        ink: "#1E3A5F",
        brick: "#C75B39",
        "brick-hover": "#A84A2D",
        "ink-light": "#2A4A73",
        "paper-dark": "#E8E4DB",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Source Sans 3'", "sans-serif"],
      },
      boxShadow: {
        book: "0 4px 20px rgba(30, 58, 95, 0.12)",
        "book-hover": "0 12px 32px rgba(30, 58, 95, 0.18)",
      },
    },
  },
  plugins: [],
};
