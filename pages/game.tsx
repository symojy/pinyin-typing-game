import { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import questions from '../data/questions-beginner.json';

const toneSymbols = ['—', '／', '∨', '＼'];
const toneKeys = ['u', 'i', 'o', 'p'];
const toneLabels = ['第一声', '第二声', '第三声', '第四声'];
const MAX_TIME = 60; // 最大制限時間（秒）

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Game() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [showScoreUp, setShowScoreUp] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showToneButtons, setShowToneButtons] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
const positionMap = {
  1: ["left-1/2 -translate-x-1/2"],
  2: ["left-[17%]", "left-[56%]"],
  3: ["left-[0%]", "left-[38%]", "left-[77%]"],
};

  const [hoppingIndex, setHoppingIndex] = useState<number | null>(null);
 
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
        // ✅ 軽声ならジャンプ → 処理を遅らせる
        setHoppingIndex(charIndex);
        setTimeout(() => {
          setHoppingIndex(null);

          const isLastChar = charIndex + 1 >= current.hanzi.length;
          if (isLastChar) {
            setScore((s) => s + 10);
            setShowScoreUp(true);
            setTimeout(() => setShowScoreUp(false), 700);
            setCharIndex(0);
            setInput('');
            goToNextQuestion();
          } else {
            setCharIndex((i) => i + 1);
            setInput('');
          }
          inputRef.current?.focus();
        }, 400); // アニメーション終了後に進める
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
}, [
  input,
  expectedPinyin,
  expectedTone,
  charIndex,
  current.hanzi.length,
  showToneButtons,
  timeLeft,
]);


const handleToneSelect = useCallback((tone: 1 | 2 | 3 | 4) => {
  if (tone === expectedTone) {
    setHoppingIndex(charIndex); // ✅ 声調正解 → ジャンプ開始
    setTimeout(() => {
      setHoppingIndex(null);

      const isLastChar = charIndex + 1 >= current.hanzi.length;
      if (isLastChar) {
        setScore((s) => s + 10);
        setShowScoreUp(true);
        setTimeout(() => setShowScoreUp(false), 700);
        setCharIndex(0);
        setInput('');
        setShowToneButtons(false);
        goToNextQuestion();
        inputRef.current?.focus();
      } else {
        setCharIndex((i) => i + 1);
        setInput('');
        setShowToneButtons(false);
        inputRef.current?.focus();
      }
    }, 400); // ✅ アニメーション表示後に進行
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


useEffect(() => {
  console.log("showScoreUp", showScoreUp);
}, [showScoreUp]);

return (
  <main className="p-4 max-w-md mx-auto flex flex-col items-center justify-start pt-15 overflow-hidden">


    {/* 最上部の固定タイトル＆時間バー */}
    <div className="fixed top-0 left-0 w-full z-50 bg-white">
      {/* タイトル */}
      <div className="bg-white text-center font-bold text-lg py-2 border-b border-gray-300">
        拼音师傅🥋PINYIN MASTER
      </div>

      {/* タイムバー */}
      <div className="w-full h-2 bg-gray-300 mb-1">
        <div
          className={clsx(
            "h-full transition-all duration-100",
            timeLeft > 20
              ? "bg-green-300"
              : timeLeft > 10
              ? "bg-yellow-400"
              : "bg-red-500"
          )}
          style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
        ></div>
      </div>
    </div>

{/* 得点と残り時間（常に高さを確保） */}
<div className="w-full max-w-md mx-auto text-lg font-bold mt-1 mb-2 flex justify-between h-6">
  {started ? (
    <>
<div className="relative min-h-[2.5rem]">
  <div>{score} pt</div>
 <div
  className={clsx(
    "absolute left-full ml-2 top-0 text-green-500 text-m transition-opacity duration-100 whitespace-nowrap",
    showScoreUp ? "animate-score-left opacity-0" : "opacity-0"
  )}
>
  +10 pt
</div>
</div>

      <div>⏱️ {timeLeft}</div>
    </>
  ) : (
    <>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </>
  )}
</div>

    {/* 漢字表示エリア（常に高さを確保） */}
<div className="relative w-48 h-16 mb-6">
  {started && timeLeft > 0 &&
    current.hanzi.map((char, i) => {
      const isCurrent = i === charIndex;
      const isSolved = i < charIndex;

      const positionClass = positionMap[current.hanzi.length]?.[i] ?? "";

      return (
<span
  key={i}
  className={clsx(
    "absolute bottom-0 flex items-center justify-center rounded-xl transition-all duration-300", // ✅ items-center に修正
    isCurrent || isSolved ? "w-16 h-16 text-4xl" : "w-14 h-14 text-2xl",
    isCurrent
      ? "font-bold border-blue-300"
      : isSolved
      ? "bg-green-100 border-green-400"
      : "border-gray-300 text-gray-500",
    "border border-t-2 border-l-2 border-r-2 border-b-6",
    i === hoppingIndex && "animate-hop",
    positionClass
  )}
>
  {char}
</span>




      );
    })}
</div>




    {/* ピンイン入力欄 + スキップボタン（常に高さ固定） */}
    <div className="relative mb-4 h-14 flex justify-center items-center">
      <input
        ref={inputRef}
        type="text"
        className={clsx(
          "w-40 px-4 py-3 text-center rounded-2xl transition-all duration-300 border-4 outline-none",
          shake && "animate-shake",
          showToneButtons ? "text-gray-400" : "text-black",
          !started
            ? "bg-blue-600 text-white text-lg font-bold cursor-pointer shadow"
            : [
                "bg-gray-50",
                "text-xl",
                showToneButtons ? "border-gray-300" : "border-blue-300"
              ]
        )}
        placeholder={!started ? "Tap to start" : "Type pinyin"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={handleFocus}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        disabled={timeLeft === 0}
      />

      {/* スキップボタン */}
      <button
        onClick={handleSkip}
        className="absolute right-[calc(50%-6rem)] translate-x-15 border-4 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold"
        disabled={timeLeft === 0}
      >
        ⏩
      </button>
    </div>

    {/* 声調ボタン */}
    <div className="flex justify-center gap-4 h-24">
      <div
        className={clsx(
          "flex gap-4 transition-opacity duration-300",
          showToneButtons ? "opacity-100" : "opacity-30 pointer-events-none"
        )}
      >
        {toneSymbols.map((symbol, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* ラベル */}
            <div
              className={clsx(
                "text-xs mb-1 transition-colors",
                showToneButtons ? "text-black" : "text-gray-400"
              )}
            >
              {toneLabels[index]}
            </div>

            {/* ボタン */}
            <button
              className={clsx(
                "w-16 h-16 text-3xl font-bold rounded-2xl transition-all duration-300 border-4",
                "flex items-center justify-center",
                showToneButtons
                  ? "border-blue-300 bg-white text-black"
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