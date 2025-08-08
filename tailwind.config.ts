import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        slateglass: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0b1220',
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.15)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
} satisfies Config