/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lightest: '#EEF1F2',
        ice: '#B6CDD8',
        slate: '#5C63A5',
        navy: '#0B3D5C',
        indigo: '#4A3A8C',
        deepPurple: '#471F73',
      },
    },
  },
  plugins: [],
};
