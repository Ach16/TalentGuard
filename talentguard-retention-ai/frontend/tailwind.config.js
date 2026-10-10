/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1020',
          sidebar: '#11182B',
          surface: '#161F35',
          card: '#131C35',
          cardHover: '#1A2645',
          border: '#1E2D52',
          borderLight: '#2A3C6B',
        },
        brand: {
          500: '#695CFF',
          600: '#5648ED',
          400: '#8176FF',
          glow: 'rgba(105, 92, 255, 0.25)',
        },
        accent: {
          cyan: '#00F2FE',
          teal: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(105, 92, 255, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
