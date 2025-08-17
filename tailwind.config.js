/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode
        primary: "var(--background-primary)",
        secondary: "var(--background-secondary)",
        card: "var(--background-card)",
        heading: "var(--text-heading)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        accent: "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        cta: "var(--accent-cta)",
        "cta-hover": "var(--accent-cta-hover)",
        separator: "var(--separator)",
        highlight: "var(--highlight)",
      },
      backgroundColor: {
        primary: "var(--background-primary)",
        secondary: "var(--background-secondary)",
        card: "var(--background-card)",
        accent: "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        cta: "var(--accent-cta)",
        "cta-hover": "var(--accent-cta-hover)",
        highlight: "var(--highlight)",
      },
      textColor: {
        heading: "var(--text-heading)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: "var(--accent-primary)",
      },
      borderColor: {
        separator: "var(--separator)",
      },
    },
  },
  plugins: [],
};
