module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // 英数字: Nunito、それ以外の本文: Noto（WordCard の漢字は font-hanzi）
        sans: ['var(--font-nunito)', 'var(--font-noto)', 'sans-serif'],
        hanzi: [
          'var(--font-zcool-kuaile)',
          'var(--font-noto)',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};