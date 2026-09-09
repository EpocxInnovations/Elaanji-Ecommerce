/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14120F',
        'ink-deep': '#0B0906',
        paper: '#FAF9F6',
        'paper-warm': '#F6F2EA',
        beige: '#E8E1D3',
        'beige-deep': '#DCD2BE',
        stone: '#8A8578',
        'stone-light': '#A8A296',
        oxblood: '#6E2430',
        'oxblood-deep': '#521A24',
        'oxblood-soft': '#8A3440',
        gold: '#A16207',
        'gold-light': '#D4A853',
        'gold-soft': '#E5C88F',
        'gold-deep': '#7A4B05',
        champagne: '#F2E8D2',
        rose: '#9F1239',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
      boxShadow: {
        card: '0 1px 3px rgba(20, 18, 15, 0.06), 0 1px 2px rgba(20, 18, 15, 0.04)',
        'card-hover': '0 12px 32px rgba(20, 18, 15, 0.10), 0 3px 8px rgba(20, 18, 15, 0.05)',
        luxury: '0 20px 60px rgba(20, 18, 15, 0.12), 0 4px 12px rgba(20, 18, 15, 0.06)',
        'gold-glow': '0 10px 30px rgba(162, 98, 7, 0.28), 0 2px 8px rgba(162, 98, 7, 0.18)',
        'gold-glow-lg': '0 18px 50px rgba(212, 168, 83, 0.35), 0 4px 16px rgba(162, 98, 7, 0.20)',
        overlay: '0 24px 80px rgba(11, 9, 6, 0.28)',
        'glass': '0 8px 32px rgba(20, 18, 15, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E5C88F 0%, #D4A853 38%, #A16207 100%)',
        'gold-gradient-soft': 'linear-gradient(120deg, #F2E8D2 0%, #E5C88F 100%)',
        'oxblood-gradient': 'linear-gradient(140deg, #8A3440 0%, #6E2430 55%, #521A24 100%)',
        'ink-gradient': 'linear-gradient(160deg, #2A2620 0%, #14120F 60%, #0B0906 100%)',
        'paper-gradient': 'radial-gradient(120% 120% at 80% 0%, #F6F2EA 0%, #FAF9F6 55%, #F0EAE0 100%)',
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
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'marquee': 'marquee 28s linear infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        'zoom-in': 'zoom-in 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
