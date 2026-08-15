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
        bg: {
          DEFAULT: '#060608',
          card: '#0C0C0F',
          sheet: '#17171B',
          toast: '#1C1C21',
        },
        ink: {
          DEFAULT: '#F5F5F7',
          2: 'rgba(245, 245, 247, 0.55)',
          3: 'rgba(245, 245, 247, 0.38)',
        },
        emberInk: '#1C1207',
        warn: '#FF7A6E',
        glass: {
          a: 'rgba(255, 255, 255, 0.072)',
          b: 'rgba(255, 255, 255, 0.030)',
          line: 'rgba(255, 255, 255, 0.085)',
          spec: 'rgba(255, 255, 255, 0.16)',
        },
        // Dynamic Accent mapping to CSS custom properties
        accent: {
          DEFAULT: 'var(--color-accent, #EFA55C)',
          light: 'var(--color-accent-light, #F4B87E)',
          dark: 'var(--color-accent-dark, #D38E4B)',
          soft: 'var(--color-accent-soft, rgba(239, 165, 92, 0.13))',
        },
        // 6 Preset accents for static utilities
        palette: {
          ember: '#EFA55C',
          pine: '#4EAF7B',
          indigo: '#5486EB',
          mulberry: '#D65B6E',
          slate: '#A2ADC0',
          iris: '#9F7AEA',
        }
      },
      borderRadius: {
        'card': '26px',
        'small': '20px',
        'pill': '17px',
        'sheet': '32px',
      },
      transitionTimingFunction: {
        'liquid': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'liquid': '420ms',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 18px 40px rgba(0, 0, 0, 0.55)',
        'accent-glow': '0 10px 26px var(--color-accent-glow, rgba(239, 165, 92, 0.25))',
        'check-glow': '0 4px 14px var(--color-accent-glow, rgba(239, 165, 92, 0.3))',
        'toast': '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
