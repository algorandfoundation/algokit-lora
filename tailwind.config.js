import * as tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        payment: {
          DEFAULT: 'rgb(var(--payment) / <alpha-value>)',
          foreground: 'rgb(var(--payment-foreground) / <alpha-value>)',
        },
        ['asset-transfer']: {
          DEFAULT: 'rgb(var(--asset-transfer) / <alpha-value>)',
          foreground: 'rgb(var(--asset-transfer-foreground) / <alpha-value>)',
        },
        ['application-call']: {
          DEFAULT: 'rgb(var(--application-call) / <alpha-value>)',
          foreground: 'rgb(var(--application-call-foreground) / <alpha-value>)',
        },
        ['asset-config']: {
          DEFAULT: 'rgb(var(--asset-config) / <alpha-value>)',
          foreground: 'rgb(var(--asset-config-foreground) / <alpha-value>)',
        },
        ['asset-freeze']: {
          DEFAULT: 'rgb(var(--asset-freeze) / <alpha-value>)',
          foreground: 'rgb(var(--asset-freeze-foreground) / <alpha-value>)',
        },
        ['state-proof']: {
          DEFAULT: 'rgb(var(--state-proof) / <alpha-value>)',
          foreground: 'rgb(var(--state-proof-foreground) / <alpha-value>)',
        },
        ['key-registration']: {
          DEFAULT: 'rgb(var(--key-registration) / <alpha-value>)',
          foreground: 'rgb(var(--key-registration-foreground) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--error) / <alpha-value>)',
          foreground: 'rgb(var(--error-foreground) / <alpha-value>)',
        },
        ['abi-string']: {
          DEFAULT: 'rgb(var(--payment) / <alpha-value>)',
          foreground: 'rgb(var(--payment-foreground) / <alpha-value>)',
        },
        ['abi-number']: {
          DEFAULT: 'rgb(var(--state-proof) / <alpha-value>)',
          foreground: 'rgb(var(--state-proof-foreground) / <alpha-value>)',
        },
        ['abi-bool']: {
          DEFAULT: 'rgb(var(--asset-freeze) / <alpha-value>)',
          foreground: 'rgb(var(--asset-freeze-foreground) / <alpha-value>)',
        },
        ['abi-keys']: {
          DEFAULT: 'rgb(var(--application-call) / <alpha-value>)',
          foreground: 'rgb(var(--application-call-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
