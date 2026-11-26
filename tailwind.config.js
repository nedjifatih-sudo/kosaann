/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#203C32',
          hover: '#172D25',
          light: '#2D5245',
          50: '#F0F5F2',
          100: '#E1EBE6',
          900: '#0F1E19',
        },
        ivory: {
          DEFAULT: '#F5F1E8',
          dark: '#EBE5D8',
          light: '#FAF8F4',
        },
        sand: {
          DEFAULT: '#C59A68',
          hover: '#B48855',
          light: '#F2E8DC',
        },
        charcoal: {
          DEFAULT: '#292C29',
          light: '#4A4E49',
          muted: '#71776E',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
