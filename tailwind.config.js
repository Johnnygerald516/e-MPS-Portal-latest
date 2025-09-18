/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Governmental color palette
        government: {
          blue: {
            50: "#e6f0f9",
            100: "#cce0f3",
            200: "#99c2e6",
            300: "#66a3da",
            400: "#3385cd",
            500: "#0066c1", // Primary government blue
            600: "#0052a3",
            700: "#003d7a",
            800: "#002952",
            900: "#001429",
          },
          red: {
            50: "#f9e6e6",
            100: "#f3cccc",
            200: "#e69999",
            300: "#da6666",
            400: "#cd3333",
            500: "#c10000", // Official government red
            600: "#a30000",
            700: "#7a0000",
            800: "#520000",
            900: "#290000",
          },
          gold: {
            50: "#faf6e6",
            100: "#f5edcc",
            200: "#ebdb99",
            300: "#e1c966",
            400: "#d7b733",
            500: "#cda500", // Government gold/yellow
            600: "#a98800",
            700: "#7f6600",
            800: "#554400",
            900: "#2a2200",
          },
          neutral: {
            50: "#f0f1f3",
            100: "#e1e3e7",
            200: "#c3c7cf",
            300: "#a5abb7",
            400: "#878f9f",
            500: "#697387", // Government neutral
            600: "#545c6c",
            700: "#3f4551",
            800: "#2a2e36",
            900: "#15171b",
          },
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss/plugin")(({
    addUtilities,
    addComponents,
    addBase,
    theme
  }) => {
    // Add animation utilities
    addUtilities({
      '.animate-accordion-down': {
        animation: 'accordion-down 0.2s ease-out',
      },
      '.animate-accordion-up': {
        animation: 'accordion-up 0.2s ease-out',
      },
    });
  }),],
}
