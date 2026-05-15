import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        drift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(30px,40px) scale(1.08)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite alternate",
        "drift-slow": "drift 24s ease-in-out infinite alternate",
        "drift-mid": "drift 22s ease-in-out infinite alternate",
      },
      fontFamily: {
        sans: ["var(--font-space)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      colors: {
        ink: "#0c0916",
        mist: "#f0ecff",
        pm: "#623edd",
        pp: "#d551c9",
        pa: "#f7b334",
        pg: "#4ade80",
      },
    },
  },
  plugins: [],
} satisfies Config;
