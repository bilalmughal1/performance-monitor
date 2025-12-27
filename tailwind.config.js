/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        card: "#18181b",
        "card-foreground": "#fafafa",
        popover: "#09090b",
        "popover-foreground": "#fafafa",
        primary: "#fafafa",
        "primary-foreground": "#18181b",
        secondary: "#27272a",
        "secondary-foreground": "#fafafa",
        muted: "#27272a",
        "muted-foreground": "#a1a1aa",
        accent: "#27272a",
        "accent-foreground": "#fafafa",
        destructive: "#7f1d1d",
        "destructive-foreground": "#fafafa",
        border: "#27272a",
        input: "#27272a",
        ring: "#d4d4d8",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
