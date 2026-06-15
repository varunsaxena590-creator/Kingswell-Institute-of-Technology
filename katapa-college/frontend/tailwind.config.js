/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        dark: {
          DEFAULT: '#0a0a0f',
          100: '#0f0f1a',
          200: '#141420',
          300: '#1a1a2e',
          400: '#16213e',
        },
        // Gold palette
        gold: {
          DEFAULT: '#d4af37',
          light: '#f0d060',
          dark: '#a0821a',
          muted: '#c9a227',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #a0821a 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px #d4af37, 0 0 20px #d4af37' },
          to: { boxShadow: '0 0 20px #d4af37, 0 0 40px #d4af37, 0 0 60px #d4af37' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        gold: '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.5)',
      },
    },
  },
  plugins: [],
};
