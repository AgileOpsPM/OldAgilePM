const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    important: true, // This ensures Tailwind's styles take precedence over other styles
    theme: { 
      ...defaultTheme,//default theme is light mode
      light:{
        ...defaultTheme.light,
        primary: '',
        white: '#ffffff',
        black: '',
        gray: '',
        text: {
          primary: '#000000',
          secondary: '#4B5563',
          muted: '#6B7280',
          red: '#EF4444'
        },
      },
      extend: {
        fontFamily: {
          sans: ['var(--font-geist-sans)'],
          mono: ['var(--font-geist-mono)'],
        },
      },
    },
    plugins: [],
  }