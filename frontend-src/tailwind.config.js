/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#c0000c',
          dark:    '#8a0008',
          light:   '#ff1a24',
        },
        court: {
          green: '#166534',
          light: '#dcfce7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
