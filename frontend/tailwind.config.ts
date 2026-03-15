import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f5f8f5",
          100: "#e4efe5",
          200: "#c3dcc6",
          300: "#9ac1a0",
          400: "#74a57f",
          500: "#5a8b65",
          600: "#476e50",
          700: "#395642",
          800: "#2f4536",
          900: "#283a2f"
        }
      },
      backgroundImage: {
        "sage-gradient":
          "linear-gradient(135deg, #5a8b65, #c3dcc6, #ffffff)"
      },
      boxShadow: {
        glass: "0 18px 45px rgba(15, 23, 42, 0.25)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;

