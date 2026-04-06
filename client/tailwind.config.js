/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ncat-blue': '#0039A6',
        'ncat-gold': '#FFB81C',
      }
    },
  },
  plugins: [],
}