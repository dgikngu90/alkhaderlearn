import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        purple: {
          DEFAULT: "hsl(var(--purple))",
          50: "hsl(263 70% 95%)",
          100: "hsl(263 70% 90%)",
          200: "hsl(263 70% 80%)",
          300: "hsl(263 70% 70%)",
          400: "hsl(263 70% 60%)",
          500: "hsl(263 70% 50%)",
          600: "hsl(263 70% 40%)",
          700: "hsl(263 70% 30%)",
          800: "hsl(263 70% 20%)",
          900: "hsl(263 70% 10%)",
        },
        pink: {
          DEFAULT: "hsl(var(--pink))",
          50: "hsl(330 80% 95%)",
          100: "hsl(330 80% 90%)",
          200: "hsl(330 80% 80%)",
          300: "hsl(330 80% 70%)",
          400: "hsl(330 80% 60%)",
          500: "hsl(330 80% 50%)",
          600: "hsl(330 80% 40%)",
          700: "hsl(330 80% 30%)",
          800: "hsl(330 80% 20%)",
          900: "hsl(330 80% 10%)",
        },
        orange: {
          DEFAULT: "hsl(var(--orange))",
          50: "hsl(25 95% 95%)",
          100: "hsl(25 95% 90%)",
          200: "hsl(25 95% 80%)",
          300: "hsl(25 95% 70%)",
          400: "hsl(25 95% 60%)",
          500: "hsl(25 95% 50%)",
          600: "hsl(25 95% 40%)",
          700: "hsl(25 95% 30%)",
          800: "hsl(25 95% 20%)",
          900: "hsl(25 95% 10%)",
        },
        green: {
          DEFAULT: "hsl(var(--green))",
        },
        cyan: {
          DEFAULT: "hsl(var(--cyan))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.6)" },
        },
        "blob-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "blob-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 10px) scale(1.05)" },
          "66%": { transform: "translate(20px, -20px) scale(0.95)" },
        },
        "rainbow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "shimmer-gradient": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "blob-1": "blob-1 8s ease-in-out infinite",
        "blob-2": "blob-2 10s ease-in-out infinite",
        rainbow: "rainbow 3s linear infinite",
      },
      boxShadow: {
        "glow": "0 0 40px -10px hsl(var(--primary) / 0.3)",
        "glow-sm": "0 0 20px -5px hsl(var(--primary) / 0.2)",
        "elevated": "0 20px 40px -15px hsl(var(--foreground) / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
