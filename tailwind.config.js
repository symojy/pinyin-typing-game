module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Duolingo っぽい丸み優先（英字は Nunito、漢字などは Noto Sans）
        sans: ['var(--font-nunito)', 'var(--font-noto)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};