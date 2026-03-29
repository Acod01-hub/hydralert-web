/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ocean: {
          50:  '#eefbff',
          100: '#d4f4ff',
          200: '#a8ecff',
          300: '#6de0ff',
          400: '#2dcbff',
          500: '#00aaee',
          600: '#0086cc',
          700: '#006aa5',
          800: '#005a88',
          900: '#004b70',
        },
        risk: {
          low:      '#22c55e', // green-500
          moderate: '#f59e0b', // amber-500
          high:     '#ef4444', // red-500
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out both',
        'slide-up':   'slideUp 0.5s ease-out both',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseRing: { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.08)', opacity: 0.7 } },
      },
    },
  },
  plugins: [],
};
