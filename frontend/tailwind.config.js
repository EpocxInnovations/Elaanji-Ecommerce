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
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"General Sans"', '"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
}
