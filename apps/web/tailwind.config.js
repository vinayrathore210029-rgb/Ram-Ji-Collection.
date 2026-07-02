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
        brand: {
          light: '#fcfbf7', // Premium parchment background
          dark: '#0f0f0f',  // Deep pitch black
          charcoal: '#1a1a1a', // Soft charcoal gray
          gold: '#c5a880',  // Premium dull gold
          goldHover: '#b5976f',
          bronze: '#8c6d4f',
          red: '#a34848'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px rgba(0, 0, 0, 0.05)',
        premiumDark: '0 4px 20px rgba(0, 0, 0, 0.4)',
        glow: '0 0 15px rgba(197, 168, 128, 0.3)'
      }
    },
  },
  plugins: [],
}
