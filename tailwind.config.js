/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        zambia: {
          orange: '#E85D04',
          copper: '#C45508',
          gold: '#F59E0B',
          forest: '#166534',
          sky: '#0EA5E9',
          earth: '#78350F',
        }
      }
    },
  },
  plugins: [],
}