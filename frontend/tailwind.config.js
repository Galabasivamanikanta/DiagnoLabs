/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1e46',
          deep: '#081736',
          darker: '#050f24',
        },
        'royal-blue': '#1e3a8a',
        gold: {
          DEFAULT: '#cc9a3d',
          light: '#e0b667',
        },
        'text-muted': '#6b7280',
        muted: '#6b7280',
        'card-bg': '#ffffff',
        'page-bg': '#eef1f6',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
