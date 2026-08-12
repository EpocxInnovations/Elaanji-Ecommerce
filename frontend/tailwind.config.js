/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14120F',
        paper: '#FAF9F6',
        beige: '#E8E1D3',
        stone: '#8A8578',
        oxblood: '#6E2430',
        gold: '#A16207',
        'gold-light': '#D4A853',
        rose: '#9F1239',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"General Sans"', '"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(20, 18, 15, 0.06), 0 1px 2px rgba(20, 18, 15, 0.04)',
        'card-hover': '0 4px 12px rgba(20, 18, 15, 0.08), 0 2px 4px rgba(20, 18, 15, 0.04)',
        'luxury': '0 8px 30px rgba(20, 18, 15, 0.08)',
        'overlay': '0 16px 48px rgba(20, 18, 15, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
