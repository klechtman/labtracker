/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'group-green': '#10b981',
        'group-yellow': '#f59e0b',
        'group-indigo': '#6366f1',
        'group-pink': '#ec4899',
        'group-purple': '#8b5cf6',
        'group-a': 'violet',
        'group-b': '#10b981',
        'group-c': '#f59e0b',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        arimo: ['Arimo', 'sans-serif'],
        sans: ['Arimo', 'sans-serif'],
      },
      fontSize: {
        base: '14px',
      },
    },
  },
  plugins: [],
} 