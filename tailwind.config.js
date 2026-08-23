/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg, #060608)',
        ink: {
          DEFAULT: 'var(--ink, #F5F5F7)',
          2: 'var(--ink-2, rgba(245, 245, 247, 0.55))',
          3: 'var(--ink-3, rgba(245, 245, 247, 0.38))',
        },
        warn: 'var(--warn, #FF7A6E)',
        accent: {
          DEFAULT: 'var(--accent, #EFA55C)',
          light: 'var(--accent-light, #F1B57A)',
          dark: 'var(--accent-dark, #D39251)',
          glow: 'var(--accent-glow, rgba(239, 165, 92, 0.25))',
          subtle: 'var(--accent-subtle, rgba(239, 165, 92, 0.13))',
          border: 'var(--accent-border, rgba(239, 165, 92, 0.28))',
          ink: 'var(--accent-ink, #1C1207)',
        },
        glass: {
          a: 'var(--glass-a, rgba(255, 255, 255, 0.072))',
          b: 'var(--glass-b, rgba(255, 255, 255, 0.030))',
        },
        line: 'var(--line, rgba(255, 255, 255, 0.085))',
        spec: 'var(--spec, rgba(255, 255, 255, 0.16))',
      },
      borderRadius: {
        'card': '26px',
        'small': '20px',
        'pill': '17px',
      },
      fontFamily: {
        sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'apple': '420ms',
      },
      boxShadow: {
        'glass-card': '0 18px 40px rgba(0, 0, 0, 0.55)',
        'glass-sheet': '0 10px 30px rgba(0, 0, 0, 0.6)',
        'accent-glow': '0 10px 26px var(--accent-glow, rgba(239, 165, 92, 0.25))',
        'accent-sm-glow': '0 4px 14px var(--accent-glow, rgba(239, 165, 92, 0.3))',
      },
    },
  },
  plugins: [],
};
