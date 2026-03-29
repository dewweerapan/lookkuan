import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans Text', 'Google Sans', 'Sarabun', 'sans-serif'],
        mali: ['var(--font-mali)', 'Mali', 'cursive'],
      },
      fontSize: {
        // ฟอนต์ขนาดใหญ่สำหรับผู้สูงอายุ
        'pos-sm': ['16px', '24px'],
        'pos-base': ['18px', '28px'],
        'pos-lg': ['20px', '30px'],
        'pos-xl': ['24px', '34px'],
        'pos-2xl': ['28px', '38px'],
        'pos-3xl': ['32px', '42px'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        // สีสำหรับ High Contrast
        success: { DEFAULT: '#16A34A', light: '#BBF7D0' },
        danger: { DEFAULT: '#DC2626', light: '#FECACA' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        info: { DEFAULT: '#2563EB', light: '#DBEAFE' },
      },
      spacing: {
        // ขนาดปุ่มใหญ่สำหรับ POS
        'pos-btn': '56px',
        'pos-btn-lg': '72px',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
