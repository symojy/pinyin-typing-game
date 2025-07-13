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

  const [charIndex, setCharIndex] = useState(0); // 今の文字（熊 or 猫）
  const [input, setInput] = useState('');
  const [selectedTone, setSelectedTone] = useState<1 | 2 | 3 | 4 | null>(null);
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [showCorrectIcon, setShowCorrectIcon] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [started, setStarted] = useState(false);
  const current = questions[currentIndex % questions.length];
  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

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
  }, [started]);

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
      }
    }
  }, [input]);

  const handleToneSelect = (tone: 1 | 2 | 3 | 4) => {
    if (tone === expectedTone) {
      if (charIndex + 1 < current.hanzi.length) {
        // 次の文字へ
        setCharIndex((i) => i + 1);
        setInput('');
        setSelectedTone(null);
        setShowToneButtons(false);
      } else {
        // 問題終了
        setScore((s) => s + 10);
        setCurrentIndex((i) => i + 1);
        setCharIndex(0);
        setInput('');
        setSelectedTone(null);
        setShowToneButtons(false);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
          disabled={showToneButtons}
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
