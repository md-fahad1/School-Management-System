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
        "brand-gradient":
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
      },
     colors: {
        // Sidebar
        sidebarBg: "var(--color-sidebar-bg)",
        sidebarBgHover: "var(--color-sidebar-bg-hover)",
        sidebarText: "var(--color-sidebar-text)",
        sidebarTextActive: "var(--color-sidebar-text-active)",
        sidebarActiveBg: "var(--color-sidebar-active-bg)",
        sidebarBorder: "var(--color-sidebar-border)",
        sidebarSectionLabel: "var(--color-sidebar-section-label)",
        bg: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        // Brand / primary
        primary: "var(--color-primary)",
        primaryDark: "var(--color-primary-dark)",
        primaryLight: "var(--color-primary-light)",
        accent: "var(--color-accent)",
        accentLight: "var(--color-accent-light)",

        // Status
        success: "var(--color-success)",
        successLight: "var(--color-success-light)",
        danger: "var(--color-danger)",
        dangerLight: "var(--color-danger-light)",
        warning: "var(--color-warning)",
        warningLight: "var(--color-warning-light)",
        info: "var(--color-info)",
        infoLight: "var(--color-info-light)",

        // Surfaces / text
        cardBg: "var(--color-card-bg)",
        border: "var(--color-border)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textMuted: "var(--color-text-muted)",

        // Backward-compat aliases (old components using these still work)
        lamaSky: "var(--color-accent-light)",
        lamaSkyLight: "var(--color-accent-light)",
        lamaPurple: "var(--color-primary-light)",
        lamaPurpleLight: "var(--color-accent-light)",
        lamaYellow: "var(--color-warning-light)",
        lamaYellowLight: "var(--color-warning-light)",
        brandPurple: "var(--color-accent)",
        brandPurpleDark: "var(--color-primary-dark)",
        brandInk: "var(--color-text-primary)",
      },
    },
  },
  plugins: [],
};
export default config;