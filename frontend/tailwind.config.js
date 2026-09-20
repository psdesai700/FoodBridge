/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryGreen: '#16A34A',
        secondaryGreen: '#22C55E',
        accentOrange: '#F97316',
        bgLight: '#F8FAFC',
        cardWhite: '#FFFFFF',
        textDark: '#1F2937',
        textMuted: '#6B7280',
        borderLight: '#E5E7EB',
        statusSuccess: '#22C55E',
        statusWarning: '#F59E0B',
        statusError: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
