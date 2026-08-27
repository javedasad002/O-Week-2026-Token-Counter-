export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6B46C1',
          'purple-dark': '#553C9A',
          'purple-light': '#9F7AEA',
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#60A5FA',
          pink: '#F472B6',
          'pink-light': '#FCE7F3',
          'light-blue': '#E0F2FE',
          grey: '#F3F4F6',
          'dark-grey': '#374151'
        }
      },
      animation: {
        'pop': 'pop 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      }
    },
  },
  plugins: [],
}
