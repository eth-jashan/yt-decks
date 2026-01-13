import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        bg: {
          dark: '#0F0F0F',
          card: '#1a1a1a',
          hover: '#252525',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 1s ease-in-out infinite',
        'blink': 'blink-border 0.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 10px var(--color-primary, #8B5CF6)',
          },
          '50%': {
            boxShadow: '0 0 25px var(--color-primary, #8B5CF6), 0 0 40px var(--color-primary, #8B5CF6)',
          },
        },
        'blink-border': {
          '0%, 100%': {
            borderColor: 'rgba(234, 179, 8, 0.7)',
          },
          '50%': {
            borderColor: 'rgba(234, 179, 8, 0.3)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
