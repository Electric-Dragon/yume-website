const { width } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./html/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    fontFamily:{
      'sans': 'DM Sans',
      'poppins': 'Poppins, sans-serif',
      'pro': ['Inter, sans-serif'],
    },
    extend: {
      height: {
        'comic': '800px',
      },
      width: {
        'comic': '1280px',
      }
    }
  },
  plugins: [require('@tailwindcss/forms'),],
}
