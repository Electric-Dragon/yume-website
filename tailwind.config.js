const { width } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./html/**/*.{html,js}",
  "./node_modules/flowbite/**/*.js"
],
  darkMode: 'class',
  theme: {
    fontFamily:{
      'sans': 'DM Sans',
      'poppins': 'Poppins, sans-serif',
      'pro': ['Inter, sans-serif'],
    },
    extend: {
      height: {
        'comic': '1280px',
        'lol':'603px'
      },
      width: {
        'comic': '800px',
      },

      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        background: '#121212'
      },
    },

  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/forms'),
  ],
}
