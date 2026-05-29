/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        accent: {
          400: '#FDBA74',
          500: '#F97316',
          600: '#EA580C',
        },
        slateText: {
          dark: '#0F172A',
          muted: '#475569',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
        },
        indigoNight: '#172554',
        coral: {
          50: '#fff7ed',
          500: '#f9735b',
          600: '#ea5a43',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.12)',
        card: '0 14px 38px rgba(15, 23, 42, 0.10)',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
