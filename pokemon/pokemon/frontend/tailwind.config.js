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
        pokeRed:    '#CC0000',
        pokeRedLit: '#FF4444',
        pokeYellow: '#FFCB05',
        pokeBlue:   '#3B4CCA',
        pokeNavy:   '#0D1B3E',
        pokeDark:   '#0A1628',
        pokeGreen:  '#4CAF50',
        pokeGold:   '#B8860B',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
      animation: {
        shimmer: 'shimmer 4s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        float: 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
