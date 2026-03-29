import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4CAF82',
          dark: '#3D8F6A',
          light: '#E8F5EE',
        },
        secondary: {
          DEFAULT: '#9B7FD4',
          dark: '#7E62B3',
          light: '#F0EBF8',
        },
        accent: {
          DEFAULT: '#E8C547',
          dark: '#D4AD2B',
          light: '#FDF6E0',
        },
        surface: {
          DEFAULT: '#F8F7F4',
          card: '#FFFFFF',
        },
        'text-primary': '#2D2D2D',
        'text-secondary': '#6B7280',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
