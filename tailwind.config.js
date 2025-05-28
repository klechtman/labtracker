/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'group-a': 'violet',
        'group-b': '#10b981',
        'group-c': '#f59e0b',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        arimo: ['Arimo', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 