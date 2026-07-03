/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: "#f3f6fb",
          ink: "#162033",
          muted: "#8a97aa",
          line: "#dce4ee",
          blue: "#2563eb",
          teal: "#0f9d8a",
          orange: "#f59e0b",
          red: "#ef4444",
        },
      },
      boxShadow: {
        card: "0 8px 20px rgba(18, 34, 66, 0.08), 0 1px 3px rgba(18, 34, 66, 0.08)",
      },
    },
  },
  plugins: [],
};
