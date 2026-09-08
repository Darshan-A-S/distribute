/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f4f9ed',
          100: '#e6f2d5',
          200: '#cde5ac',
          300: '#a8d37d',
          400: '#81c14b',
          500: '#57aa43',
          600: '#2e933c',
          700: '#297045',
          800: '#204e4a',
          900: '#17393a',
          950: '#0e2527',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
