import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

const questions = [
  { hanzi: ['熊', '猫'], pinyin: ['xiong', 'mao'], tones: [2, 1] },
  { hanzi: ['手', '机'], pinyin: ['shou', 'ji'], tones: [3, 1] },
  { hanzi: ['你', '好'], pinyin: ['ni', 'hao'], tones: [3, 3] },
  { hanzi: ['朋', '友'], pinyin: ['peng', 'you'], tones: [2, 3] },
  { hanzi: ['老', '师'], pinyin: ['lao', 'shi'], tones: [3, 1] },
  { hanzi: ['学', '生'], pinyin: ['xue', 'sheng'], tones: [2, 1] },
  { hanzi: ['电', '脑'], pinyin: ['dian', 'nao'], tones: [4, 3] },
  { hanzi: ['天', '气'], pinyin: ['tian', 'qi'], tones: [1, 4] },
  { hanzi: ['喜', '欢'], pinyin: ['xi', 'huan'], tones: [3, 1] },
  { hanzi: ['汉', '语'], pinyin: ['han', 'yu'], tones: [4, 3] },
  { hanzi: ['苹', '果'], pinyin: ['ping', 'guo'], tones: [2, 3] },
  { hanzi: ['谢', '谢'], pinyin: ['xie', 'xie'], tones: [4, 4] },
  { hanzi: ['再', '见'], pinyin: ['zai', 'jian'], tones: [4, 4] },
  { hanzi: ['三', '明', '治'], pinyin: ['san', 'ming', 'zhi'], tones: [1, 2, 4] },
  { hanzi: ['图', '书', '馆'], pinyin: ['tu', 'shu', 'guan'], tones: [2, 1, 3] },
  { hanzi: ['美', '国'], pinyin: ['mei', 'guo'], tones: [3, 2] },
  { hanzi: ['中', '国'], pinyin: ['zhong', 'guo'], tones: [1, 2] },
  { hanzi: ['上', '海'], pinyin: ['shang', 'hai'], tones: [4, 3] },
  { hanzi: ['北', '京'], pinyin: ['bei', 'jing'], tones: [3, 1] },
];

const toneSymbols = ['—', '／', '∨', '＼'];
const toneKeys = ['u', 'i', 'o', 'p'];
const toneLabels = ['第一声', '第二声', '第三声', '第四声'];

export default function Game() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [showCorrectIcon, setShowCorrectIcon] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[currentIndex % questions.length];
  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

  const handleFocus = () => {
    if (!started) {
      setStarted(true);
    }
  };

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  useEffect(() => {
    if (
      input.length >= expectedPinyin.length &&
      !showToneButtons &&
      timeLeft > 0
    ) {
      if (input.toLowerCase() === expectedPinyin) {
        setShowToneButtons(true);
        setShowCorrectIcon(true);
        setTimeout(() => setShowCorrectIcon(false), 500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setInput('');
        inputRef.current?.focus();
      }
    }
  }, [input, expectedPinyin, showToneButtons, timeLeft]);

  const handleToneSelect = (tone: 1 | 2 | 3 | 4) => {
    if (tone === expectedTone) {
      setShowCorrectIcon(true);
      setTimeout(() => setShowCorrectIcon(false), 500);

      const isLastChar = charIndex + 1 >= current.hanzi.length;

      if (isLastChar) {
        setScore((s) => s + 10);
        setCurrentIndex((i) => i + 1);
        setCharIndex(0);
      } else {
        setCharIndex((i) => i + 1);
      }

      setInput('');
      setShowToneButtons(false);
      inputRef.current?.focus();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!showToneButtons) return;
      const key = e.key.toLowerCase();
      let tone: 1 | 2 | 3 | 4 | null = null;
      if (key === 'u') tone = 1;
      else if (key === 'i') tone = 2;
      else if (key === 'o') tone = 3;
      else if (key === 'p') tone = 4;

      if (tone) {
        e.preventDefault();
        handleToneSelect(tone);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showToneButtons]);

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen flex flex-col items-center justify-center">
      {started && (
        <>
          <div className="flex justify-between w-full text-lg font-bold mb-4">
            <div>得点: {score}</div>
            <div>残り: {timeLeft}s</div>
          </div>

          <div className="flex justify-center gap-4 text-3xl mb-6 min-h-[48px]">
            {timeLeft > 0 &&
              current.hanzi.map((char, i) => (
                <span
                  key={i}
                  className={clsx(
                    i === charIndex
                      ? 'underline decoration-2 underline-offset-8'
                      : ''
                  )}
                >
                  {char}
                </span>
              ))}
            {showCorrectIcon && <span className="ml-2">👍️</span>}
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="text"
        className={clsx(
          "w-48 px-4 py-3 text-lg text-center rounded transition-all duration-300",
          shake && "animate-shake",
          !started
            ? "bg-blue-600 text-white font-bold cursor-pointer shadow"
            : "bg-white border border-gray-400 text-black"
        )}
        placeholder={!started ? "▶Tap to start" : "type pinyin"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={handleFocus}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        disabled={timeLeft === 0}
      />

{showToneButtons && started && timeLeft > 0 && (
  <div className="flex justify-center gap-4 mt-4">
    {toneSymbols.map((symbol, index) => (
      <div key={index} className="flex flex-col items-center">
        {/* 上部ラベル */}
        <div className="text-xs text-gray-500 mb-1">{toneLabels[index]}</div>

        {/* 声調ボタン */}
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-3xl font-bold"
          onClick={() => handleToneSelect((index + 1) as 1 | 2 | 3 | 4)}
        >
          {symbol}
        </button>

        {/* 下部キー補足 */}
        <div className="text-xs text-gray-500 mt-1">({toneKeys[index]})</div>
      </div>
    ))}
  </div>
)}
      {timeLeft === 0 && (
        <div className="text-center mt-6">
          <p className="text-2xl font-bold">⌛ 時間切れ！</p>
          <p className="text-lg mt-2">合計得点：{score} 点</p>
        </div>
      )}
    </main>
  );
}
