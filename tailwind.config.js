module.exports = {
  content: ["./html/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    fontFamily:{
      'sans': 'DM Sans',
      'poppins': 'Poppins, sans-serif',
      'pro': ['Inter, sans-serif'],
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'),],
}
