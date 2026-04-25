import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0E0E0E',
          secondary: '#1A1A1A',
          tertiary: '#242424',
        },
        border: {
          DEFAULT: '#2A2A2A',
          light: '#3A3A3A',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#B5B5B5',
          muted: '#6B6B6B',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C47A',
          dark: '#A07832',
        },
        success: '#22C55E',
        danger: '#EF4444',
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
