/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'seafoam': {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
        'sigma': {
          50:  '#FAFAFA',
          100: '#F0F0F0',
          200: '#D9D9D9',
          300: '#BFBFBF',
          400: '#808080',
          500: '#333333',
          600: '#1A1A1A'
        }
      }
    },
  },
  plugins: [],
} 