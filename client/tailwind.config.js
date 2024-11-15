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
          cell: 'var(--white-cell-color)',
          piece: 'var(--white-piece-color)',
        },
        black: {
          cell: 'var(--black-cell-color)',
          piece: 'var(--black-piece-color)',
          background: 'var(--dark-background-color)',
        },
      }
    },
  },
  plugins: [],
};