import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { WordCard } from '../components/WordCard';
import { AnimatePresence } from 'framer-motion';
import beginnerQuestions from '../data/questions-beginner.json';

const toneSymbols = ['—', '／', '∨', '＼'];
const toneKeys = ['u', 'i', 'o', 'p'];
const toneLabels = ['第一声', '第二声', '第三声', '第四声'];

export default function Game() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [showCorrectIcon, setShowCorrectIcon] = useState(false);
  const [shake, setShake] = useState(false);
  const [pinyinSolvedIndices, setPinyinSolvedIndices] = useState<number[]>([]);
  const [glowingCharIndex, setGlowingCharIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState(beginnerQuestions[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedToneIndex, setSelectedToneIndex] = useState<number | null>(null);
  const [isToneCorrect, setIsToneCorrect] = useState<boolean | null>(null);

  const getRandomQuestion = () => {
    const index = Math.floor(Math.random() * beginnerQuestions.length);
    return beginnerQuestions[index];
  };

  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

  useEffect(() => {
    setCurrent(getRandomQuestion());
  }, []);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  const checkPinyin = (value: string) => {

    if (value.length < expectedPinyin.length) return;

    if (value.toLowerCase() === expectedPinyin) {
      const tone = expectedTone;
      setPinyinSolvedIndices((prev) =>
        prev.includes(charIndex) ? prev : [...prev, charIndex]
      );
      setGlowingCharIndex(charIndex);
      setShowCorrectIcon(true);
      setTimeout(() => {
        setGlowingCharIndex(null);
        setShowCorrectIcon(false);
      }, 300);

      if (tone === 0) {
        const isLastChar = charIndex + 1 >= current.hanzi.length;
        if (isLastChar) {
          setScore((s) => s + 10);
          setCurrent(getRandomQuestion());
          setCharIndex(0);
          setPinyinSolvedIndices([]);
        } else {
          setCharIndex((i) => i + 1);
        }
        setInput('');
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
  };

  const handleToneSelect = (tone: 1 | 2 | 3 | 4) => {
    const index = tone - 1;
    setSelectedToneIndex(index);
    inputRef.current?.blur();

    if (tone === expectedTone) {
      setIsToneCorrect(true);
      setShowCorrectIcon(true);

      setTimeout(() => {
        setShowCorrectIcon(false);
        const isLastChar = charIndex + 1 >= current.hanzi.length;
        if (isLastChar) {
          setScore((s) => s + 10);
          setCurrent(getRandomQuestion());
          setCharIndex(0);
          setPinyinSolvedIndices([]);
        } else {
          setCharIndex((i) => i + 1);
        }
        setInput('');
        setShowToneButtons(false);
        inputRef.current?.focus();
        setSelectedToneIndex(null);
        setIsToneCorrect(null);
      }, 300);
    } else {
      setIsToneCorrect(false);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelectedToneIndex(null);
        setIsToneCorrect(null);
      }, 500);
      inputRef.current?.focus();
    }
  };

const handleRestart = () => {
  setScore(0);
  setCharIndex(0);
  setInput('');
  setShowToneButtons(false);
  setShowCorrectIcon(false);
  setShake(false);
  setPinyinSolvedIndices([]);
  setGlowingCharIndex(null);
  setSelectedToneIndex(null);
  setIsToneCorrect(null);
  setTimeLeft(60);
  setCurrent(getRandomQuestion());
  setStarted(false); // ← ここがポイント！
  // inputRef.current?.focus(); ← これもしない（Tap to Start 待ち）
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

  const handleFocus = () => {
    if (!started) setStarted(true);
  };

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen flex flex-col items-center justify-start">
      {started && (
        <div className="flex justify-between w-full text-lg font-bold mb-4">
          <div>得点: {score}</div>
          <div>残り: {timeLeft}s</div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <WordCard
          key={`q-${score}`}
          keyId={`q-${score}`}
          hanzi={current.hanzi}
          currentCharIndex={charIndex}
          showIcon={showCorrectIcon}
          pinyinSolvedIndices={pinyinSolvedIndices}
          glowingCharIndex={glowingCharIndex}
        />
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        className={clsx(
          'w-48 px-4 py-3 text-lg text-center rounded transition-all duration-300 mt-0',
          shake && 'animate-shake',
          showToneButtons && 'text-green-600 font-bold',
          !started
            ? 'bg-blue-600 text-white font-bold cursor-pointer shadow'
            : 'bg-white border border-gray-400 text-black'
        )}
        placeholder={!started ? '▶Tap to start' : 'type pinyin'}
        value={input}
        onChange={(e) => {
          const value = e.target.value;
          setInput(value);
          checkPinyin(value);
        }}
        onFocus={handleFocus}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        disabled={timeLeft === 0}
        readOnly={showToneButtons}
      />

      {showToneButtons && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          声調を選んでください（上のボタン or u/i/o/p キー）
        </div>
      )}

      {showToneButtons && started && timeLeft > 0 && (
        <div className="flex justify-center gap-4 mt-4">
          {toneSymbols.map((symbol, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">
                {toneLabels[index]}
              </div>
              <button
                onClick={() =>
                  handleToneSelect((index + 1) as 1 | 2 | 3 | 4)
                }
                className={clsx(
                  'px-4 py-2 rounded text-3xl font-bold transition-colors duration-300',
                  'hover:bg-gray-300',
                  selectedToneIndex === index &&
                    isToneCorrect === true &&
                    'bg-green-100 border-2 border-green-500 animate-pulse',
                  selectedToneIndex === index &&
                    isToneCorrect === false &&
                    'border-2 border-red-500 animate-shake',
                  !(selectedToneIndex === index) && 'bg-gray-200'
                )}
              >
                {symbol}
              </button>
              <div className="text-xs text-gray-500 mt-1">
                ({toneKeys[index]})
              </div>
            </div>
          ))}
        </div>
      )}

      {timeLeft === 0 && (
  <div className="text-center mt-6">
    <p className="text-2xl font-bold">⌛ 時間切れ！</p>
    <p className="text-lg mt-2">合計得点：{score} 点</p>
    <button
      onClick={handleRestart}
      className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
    >
      🔁 もう一度初級を開始
    </button>
  </div>
)}

    </main>
  );
}
