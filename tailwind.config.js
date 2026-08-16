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
        canvas: '#060608',
        ink: {
          DEFAULT: '#F5F5F7',
          2: 'rgba(245, 245, 247, 0.55)',
          3: 'rgba(245, 245, 247, 0.38)',
        },
        warn: '#FF7A6E',
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
          soft: 'var(--accent-soft)',
          hover: 'var(--accent-hover)',
          glow: 'var(--accent-glow)',
          border: 'var(--accent-border)',
          ink: 'var(--accent-ink)',
        },
        glass: {
          a: 'rgba(255, 255, 255, 0.072)',
          b: 'rgba(255, 255, 255, 0.030)',
          line: 'rgba(255, 255, 255, 0.085)',
          spec: 'rgba(255, 255, 255, 0.16)',
        },
      },
      borderRadius: {
        'card': '26px',
        'small': '20px',
        'pill': '17px',
      },
      fontFamily: {
        sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'breath-slow': 'breath 7s ease-in-out infinite',
        'breath-fast': 'breath 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'glass-card': '0 18px 40px rgba(0, 0, 0, 0.55)',
        'glass-pill': '0 10px 26px var(--accent-glow)',
        'glass-toast': '0 10px 30px rgba(0, 0, 0, 0.5)',
        'accent-ring': '0 0 0 1.5px var(--accent-border)',
      },
    },
  },
  plugins: [],
}
