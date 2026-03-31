/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Verdana', 'Geneva', 'sans-serif'],
      },
      colors: {
        forest: {
          950: '#0a1f13',
          900: '#0f2918',
          800: '#1a3c2a',
          700: '#225033',
          600: '#2e6b42',
          500: '#3a8654',
          400: '#4aa368',
          300: '#6bbf85',
          200: '#9dd9b0',
          100: '#cceedd',
        },
        amber: {
          950: '#3d1a00',
          900: '#7a3400',
          800: '#a84800',
          700: '#c45f00',
          600: '#d97706',
          500: '#f5a623',
          400: '#f7bc52',
          300: '#fad180',
          200: '#fde5b0',
          100: '#fef3d8',
        },
      },
      backgroundImage: {
        'field-gradient': 'linear-gradient(135deg, #0a1f13 0%, #1a3c2a 40%, #2e6b42 70%, #1a3c2a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,60,42,0.8) 0%, rgba(10,31,19,0.9) 100%)',
        'amber-glow': 'radial-gradient(ellipse at top right, rgba(245,166,35,0.15) 0%, transparent 60%)',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
