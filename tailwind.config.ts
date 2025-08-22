import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0EA5E9',
          50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC',
          400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1',
          800: '#075985', 900: '#0C4A6E'
        }
      },
      boxShadow: { card: '0 4px 24px rgba(0,0,0,0.08)' },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' }
    }
  },
  plugins: [],
} satisfies Config;
