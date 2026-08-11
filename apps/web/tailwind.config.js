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
          light: '#FAF6F0', // Premium parchment background
          dark: '#1A080B',  // Royal dark maroon pitch
          charcoal: '#260B10', // Deep royal wine charcoal
          gold: '#C5A880',  // Premium dull gold
          goldHover: '#B5976F',
          goldAccent: '#D4AF37', // Royal Zari Gold
          goldGlow: '#F5D061',
          maroon: '#4A0E17', // Shahi Maroon
          wine: '#3B0910',   // Deep Silk Wine
          vermilion: '#990000', // Traditional Kumkum Red
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
