import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(135deg, #6C4CF1 0%, #2B1660 100%)",
      },
      colors: {
        // Kept the old names so every existing component (buttons, table
        // stripes, cards) picks up the new palette automatically —
        // nothing needs to be touched file-by-file for this pass.
        lamaSky: "#CFE8FF",
        lamaSkyLight: "#F0F8FF",
        lamaPurple: "#E4DBFF",
        lamaPurpleLight: "#F6F3FF",
        lamaYellow: "#FFD6E8",
        lamaYellowLight: "#FFF3F8",

        // New brand tokens for primary actions, active nav state, and
        // the dark promo/gradient card seen in the reference design.
        brandPurple: "#6C4CF1",
        brandPurpleDark: "#2B1660",
        brandInk: "#29253D",
      },
    },
  },
  plugins: [],
};
export default config;