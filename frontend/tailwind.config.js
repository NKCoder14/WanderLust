/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wander: {
          base: "#080D1A",
          card: "#1E3A5F",
          primary: "#2E86C1",
          secondary: "#1A5276",
          accent: "#17A589",
          textMain: "#EAF0F6",
          textMuted: "#AEB6BF",
        }
      },
      boxShadow: {
        'clay-card': '12px 12px 24px #0a121e, -12px -12px 24px #14243c, inset 2px 2px 10px rgba(46, 134, 193, 0.15), inset -2px -2px 10px rgba(0, 0, 0, 0.4)',
        'clay-btn': '6px 6px 12px #0a121e, -6px -6px 12px #14243c, inset 1px 1px 4px rgba(255, 255, 255, 0.2), inset -1px -1px 4px rgba(0, 0, 0, 0.3)',
        'clay-btn-pressed': 'inset 6px 6px 12px #0a121e, inset -6px -6px 12px #14243c',
        'clay-badge': '3px 3px 6px #0a121e, -3px -3px 6px #14243c, inset 1px 1px 2px rgba(255,255,255,0.1)',
      },
      borderRadius: {
        'clay': '24px',
        'clay-lg': '32px',
        'clay-full': '9999px',
      },
      fontFamily: {
        syne: ['Inter', 'sans-serif'],
        outfit: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
