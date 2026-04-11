/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IBM Plex Sans'", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        ibm: {
          black:  "#161616",
          white:  "#ffffff",
          g10:    "#f4f4f4",
          g20:    "#e0e0e0",
          g30:    "#c6c6c6",
          g50:    "#8d8d8d",
          g60:    "#6f6f6f",
          g70:    "#525252",
          g80:    "#393939",
          g90:    "#262626",
          blue:   "#0f62fe",
          blueh:  "#0353e9",
          red:    "#da1e28",
          green:  "#198038",
        },
      },
      fontSize: {
        "display": ["clamp(3rem, 6.5vw, 5.5rem)", { lineHeight: "1.04", letterSpacing: "-0.022em", fontWeight: "600" }],
        "h2": ["clamp(1.875rem, 3.5vw, 2.875rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
