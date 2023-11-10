const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./**/*.{html,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Nunito", "sans-serif"]
    },
    colors: {
      primary: {
        light:'#3b82f6',
        DEFAULT:'#2563eb',
        dark:'#1d4ed8',
      },
      logo: '#237',
      secondary: '#7795d6',
      teal: '#f0f9ff',
      white: '#ffffff',
      black: '#000',
      none: 'transparent',
      gray: colors.gray,
      green: colors.green,
      red: colors.red,
      blue: colors.blue,
    },
    extend: {
      animation: {
        transient: 'transient 3s ease-in-out both paused',
      },
      keyframes: {
        transient: {
          '0%, 100%': {opacity:0},
          '10%': {opacity:1},
        },
      },
    },
  },
  plugins: [],
}

