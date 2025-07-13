import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

const questions = [
  { hanzi: ['熊', '猫'], pinyin: ['xiong', 'mao'], tones: [3, 1] },
  { hanzi: ['强'], pinyin: ['qiang'], tones: [2] },
  { hanzi: ['手', '机'], pinyin: ['shou', 'ji'], tones: [3, 1] },
];

export default function Game() {
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [showCorrectIcon, setShowCorrectIcon] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [started, setStarted] = useState(false);
  const current = questions[currentIndex % questions.length];
  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

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
        e.preventDefault(); // 入力欄に文字が入らないようにする
        handleToneSelect(tone);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showToneButtons]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setStarted(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  useEffect(() => {
    if (input.length >= expectedPinyin.length && !showToneButtons) {
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
  }, [input, expectedPinyin, showToneButtons]);

  const handleToneSelect = (tone: 1 | 2 | 3 | 4) => {
    if (tone === expectedTone) {
      setShowCorrectIcon(true);
      setTimeout(() => setShowCorrectIcon(false), 500);

      if (charIndex + 1 < current.hanzi.length) {
        setCharIndex((i) => i + 1);
        setInput('');
        setShowToneButtons(false);
        inputRef.current?.focus();
      } else {
        setScore((s) => s + 10);
        setCurrentIndex((i) => i + 1);
        setCharIndex(0);
        setInput('');
        setShowToneButtons(false);
        inputRef.current?.focus();
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl">{countdown > 0 ? countdown : 'Start!'}</p>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <div className="flex justify-between text-lg font-bold mb-4">
        <div>得点: {score}</div>
        <div>残り: {timeLeft}s</div>
      </div>

      <div className="flex justify-center gap-4 text-3xl mb-6">
        {current.hanzi.map((char, i) => (
          <span
            key={i}
            className={clsx(
              i === charIndex ? 'underline decoration-2 underline-offset-8' : ''
            )}
          >
            {char}
          </span>
        ))}
        {showCorrectIcon && <span className="ml-2">👍️</span>}
      </div>

      <div className="flex justify-center mb-4">
        <input
          ref={inputRef}
          type="text"
          className={clsx(
            "w-40 p-2 border rounded text-center text-lg",
            shake && "animate-shake"
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          disabled={false}
        />
      </div>

      {showToneButtons && (
        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4].map((tone) => (
            <button
              key={tone}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => handleToneSelect(tone as 1 | 2 | 3 | 4)}
            >
              第{tone}声
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
