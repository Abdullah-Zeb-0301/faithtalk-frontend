/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#6e8efb',
            DEFAULT: '#5a78ed',
            dark: '#4560d8',
          },
          secondary: {
            light: '#a777e3',
            DEFAULT: '#9361d1',
            dark: '#7d4bbf',
          },
          dark: {
            light: '#282c34',
            DEFAULT: '#1a1c22',
            dark: '#121212',
          },
          gray: {
            850: '#1f2937',
            950: '#0f172a',
          }
        },
        animation: {
          'fade-in': 'fadeIn 1s ease-in-out',
          'fade-up': 'fadeUp 0.8s ease-out forwards',
          'slide-in': 'slideIn 1.5s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          fadeUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideIn: {
            '0%': { transform: 'translateY(100px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
      },
    },
    plugins: [],
  }
  