import { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import questions from '../data/questions-beginner.json';

const toneSymbols = ['—', '／', '∨', '＼'];
const toneKeys = ['u', 'i', 'o', 'p'];
const toneLabels = ['第一声', '第二声', '第三声', '第四声'];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Game() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [remainingQuestions, setRemainingQuestions] = useState(() =>
    shuffleArray(questions)
  );
  const [current, setCurrent] = useState(() => remainingQuestions[0]);

  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

  const handleFocus = () => {
    if (!started) setStarted(true);
  };

  const handleSkip = () => {
  setCharIndex(0);
  setInput('');
  setShowToneButtons(false);
  goToNextQuestion();
  inputRef.current?.focus();
};

  const goToNextQuestion = () => {
    setRemainingQuestions((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        setCurrent(next[0]);
      } else {
        setTimeLeft(0);
      }
      return next;
    });
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
        if (expectedTone === 0) {
          const isLastChar = charIndex + 1 >= current.hanzi.length;
          if (isLastChar) {
            setScore((s) => s + 10);
            setCharIndex(0);
            setInput('');
            goToNextQuestion();
          } else {
            setCharIndex((i) => i + 1);
            setInput('');
          }
          inputRef.current?.focus();
        } else {
          setShowToneButtons(true);
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setInput('');
        inputRef.current?.focus();
      }
    }
  }, [input, expectedPinyin, expectedTone, charIndex, current.hanzi.length, showToneButtons, timeLeft]);

  const handleToneSelect = useCallback((tone: 1 | 2 | 3 | 4) => {
    if (tone === expectedTone) {
      const isLastChar = charIndex + 1 >= current.hanzi.length;
      if (isLastChar) {
        setScore((s) => s + 10);
        setCharIndex(0);
        setInput('');
        setShowToneButtons(false);
        goToNextQuestion();
        inputRef.current?.focus();
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
  }, [expectedTone, charIndex, current.hanzi.length]);

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
      } else {
        e.preventDefault();
      }
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showToneButtons, handleToneSelect]);

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen flex flex-col items-center justify-start pt-6">
      {started && (
        <>
          {/* スコア表示 */}
          <div className="flex justify-between w-full text-lg font-bold mb-4">
            <div>得点: {score}</div>
            <div>残り: {timeLeft}s</div>
          </div>

          {/* 漢字表示：高さ固定 */}
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
          </div>
        </>
      )}

{/* ピンイン入力欄 + スキップボタン */}
<div className="relative mb-4 h-14 flex justify-center items-center">
  {/* 入力欄 */}
<input
  ref={inputRef}
  type="text"
  className={clsx(
    "w-40 px-4 py-3 text-center rounded-2xl transition-all duration-300 border-4 outline-none",
    shake && "animate-shake",
    showToneButtons ? "text-gray-400" : "text-black", // ← 文字色切替
    !started
      ? "bg-blue-600 text-white text-lg font-bold cursor-pointer shadow"
      : [
          "bg-white",
          "text-xl", // ← サイズUP
          showToneButtons ? "border-gray-300" : "border-green-500"
        ]
  )}
  placeholder={!started ? "▶Tap to start" : "Type Pinyin"}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onFocus={handleFocus}
  spellCheck={false}
  autoCorrect="off"
  autoCapitalize="off"
  disabled={timeLeft === 0}
/>


  {/* スキップボタン（絶対位置で右側に） */}
<button
  onClick={handleSkip}
  className="absolute right-[calc(50%-6rem)] translate-x-15 border-4 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold"
  disabled={timeLeft === 0}
>
  ⏩
</button>

</div>


{/* 声調ボタン（常に表示） */}
<div className="flex justify-center gap-4 h-24">
  <div
    className={clsx(
      "flex gap-4 transition-opacity duration-300",
      showToneButtons ? "opacity-100" : "opacity-30 pointer-events-none"
    )}
  >
{toneSymbols.map((symbol, index) => (
  <div key={index} className="flex flex-col items-center">
    {/* 上ラベル */}
    <div
      className={clsx(
        "text-xs mb-1 transition-colors",
        showToneButtons ? "text-black" : "text-gray-400"
      )}
    >
      {toneLabels[index]}
    </div>

    {/* ボタン本体 */}
    <button
      className={clsx(
        "px-4 py-2 text-3xl font-bold rounded-2xl transition-all duration-300 border-4",
        showToneButtons
          ? "border-green-500 bg-white text-black"
          : "border-gray-300 bg-gray-100 text-gray-400"
      )}
      onClick={() => handleToneSelect((index + 1) as 1 | 2 | 3 | 4)}
    >
      {symbol}
    </button>

    {/* キー表示 */}
    <div
      className={clsx(
        "text-xs mt-1 transition-colors",
        showToneButtons ? "text-black" : "text-gray-400"
      )}
    >
      ({toneKeys[index]})
    </div>
  </div>
))}

  </div>
</div>


      {/* 終了メッセージ */}
      {timeLeft === 0 && (
        <div className="text-center mt-6">
          <p className="text-2xl font-bold">⌛ 時間切れ！</p>
          <p className="text-lg mt-2">合計得点：{score} 点</p>
        </div>
      )}
    </main>
  );
}