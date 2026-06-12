/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          DEFAULT: '#006847',
          dark: '#004d35',
          light: '#008f63',
        },
        amarelo: {
          DEFAULT: '#FFD700',
          dark: '#e6c200',
          light: '#ffdf33',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          border: '#1f1f1f',
          hover: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-verde': 'linear-gradient(135deg, #006847 0%, #004d35 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #e6a800 100%)',
        'gradient-silver': 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
        'gradient-bronze': 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-verde': 'pulseVerde 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseVerde: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 104, 71, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 104, 71, 0)' },
        },
      },
    },
  },
  plugins: [],
}
