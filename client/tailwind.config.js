/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: {
          cell: '#A89E91',
          piece: '#F9F1E4'
        },
        black: {
          cell: '#8F867B',
          piece: '#000000',
          background: '#222222',
        },
      }
    },
  },
  plugins: [],
};