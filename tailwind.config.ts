import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.25), transparent 70%)',
        'hero-diagonal': 'linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, transparent 60%)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': { '0%': { transform: 'scale(.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'slide-up-fade': { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in .6s ease-out both',
        'scale-in': 'scale-in .4s cubic-bezier(.21,1.02,.73,1) both',
        'slide-up-fade': 'slide-up-fade .5s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        "input-background": "hsl(var(--input-background))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '2rem',
          sm: '2.5rem',
          lg: '3rem',
          xl: '4rem'
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px',
          '2xl': '1320px'
        }
      },
    },
  },
  plugins: [animate],
} satisfies Config;


