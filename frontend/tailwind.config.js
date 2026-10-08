/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Hind Siliguri', 'sans-serif']
      },
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcd0',
          500: '#3c7558',
          600: '#2d5a43',
          700: '#234935',
          800: '#1c392b',
          900: '#14291f'
        }
      }
    }
  },
  plugins: []
};
