import { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import questions from '../data/questions-beginner.json';
import { WordCard } from '../components/WordCard';

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
  const [toneLocked, setToneLocked] = useState(false);

  const [pinyinSolvedIndices, setPinyinSolvedIndices] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
 
  const [remainingQuestions, setRemainingQuestions] = useState(() =>
    shuffleArray(questions)
  );
  const [current, setCurrent] = useState(() => remainingQuestions[0]);

  const expectedPinyin = current.pinyin[charIndex];
  const expectedTone = current.tones[charIndex];

  const [showPerfectBonus, setShowPerfectBonus] = useState(false);
  const [mistakeOccurred, setMistakeOccurred] = useState(false);

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
      setTimeout(() => {
        inputRef.current?.focus(); // ← スマホ対策
      }, 10);
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
  console.log("✅ solved indices:", pinyinSolvedIndices);
}, [pinyinSolvedIndices]);

useEffect(() => {
  if (
    input.length >= expectedPinyin.length &&
    !showToneButtons &&
    timeLeft > 0
  ) {
    if (input.toLowerCase() === expectedPinyin) {
  if (expectedTone === 0) {
    if (toneLocked) return;
    setToneLocked(true);
    setPinyinSolvedIndices((prev) =>
      prev.includes(charIndex) ? prev : [...prev, charIndex]
    );

    setScore((s) => s + 10); // ✅ 各文字で10点加算
    setShowScoreUp(true);
    setTimeout(() => setShowScoreUp(false), 700);

    const isLastChar = charIndex + 1 >= current.hanzi.length;
    if (isLastChar) {
      const bonus = mistakeOccurred ? 0 : 5; // ✅ パーフェクトボーナス
      if (bonus > 0) {
        setScore((s) => s + bonus);
        setShowPerfectBonus(true);
        setTimeout(() => setShowPerfectBonus(false), 700);
      }

      setShowScoreUp(true);
      setTimeout(() => setShowScoreUp(false), 700);

      setTimeout(() => {
        setCharIndex(0);
        setPinyinSolvedIndices([]);
        setInput('');
        goToNextQuestion();
        inputRef.current?.focus();
        setMistakeOccurred(false); // ✅ 次の問題に備えてリセット
      }, 500);
    } else {
      setCharIndex((i) => i + 1);
      setInput('');
    }

    setTimeout(() => setToneLocked(false), 500);
  } else {
    setShowToneButtons(true);
  }
} else {
  setShake(true);
  setTimeout(() => setShake(false), 500);
  setInput('');
  inputRef.current?.focus();
  setMistakeOccurred(true); // ✅ ミス記録
}
  }
}, [
  input,
  expectedPinyin,
  expectedTone,
  charIndex,
  showToneButtons,
  timeLeft,
  toneLocked,
  current.hanzi.length
]);



const handleToneSelect = useCallback((tone: 1 | 2 | 3 | 4) => {
  if (toneLocked) return;
  setToneLocked(true);

if (tone === expectedTone) {
  setPinyinSolvedIndices((prev) =>
    prev.includes(charIndex) ? prev : [...prev, charIndex]
  );

  setScore((s) => s + 10); // ✅ 各文字で10点加算

  setShowScoreUp(true);
  setTimeout(() => setShowScoreUp(false), 700);

  const isLastChar = charIndex + 1 >= current.hanzi.length;

  if (isLastChar) {
    const bonus = mistakeOccurred ? 0 : 5;
    if (bonus > 0) {
      setScore((s) => s + bonus);
      setShowPerfectBonus(true);
      setTimeout(() => setShowPerfectBonus(false), 700);
    }

    setShowScoreUp(true);
    setTimeout(() => setShowScoreUp(false), 700);

    setTimeout(() => {
      setCharIndex(0);
      setPinyinSolvedIndices([]);
      setInput('');
      setShowToneButtons(false);
      goToNextQuestion();
      inputRef.current?.focus();
      setMistakeOccurred(false); // ✅ リセット
    }, 500);
  } else {
    setCharIndex((i) => i + 1);
    setInput('');
    setShowToneButtons(false);
    inputRef.current?.focus();
  }
} else {
  setShake(true);
  setTimeout(() => setShake(false), 500);
  inputRef.current?.focus();
  setMistakeOccurred(true); // ✅ ミス記録
}


  setTimeout(() => setToneLocked(false), 500);
}, [expectedTone, charIndex, current.hanzi.length, toneLocked]);



useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (!showToneButtons) return;

    const key = e.key.toLowerCase();
    let tone: 1 | 2 | 3 | 4 | null = null;

    if (key === 'u') tone = 1;
    else if (key === 'i') tone = 2;
    else if (key === 'o') tone = 3;
    else if (key === 'p') tone = 4;

    e.preventDefault(); // ✅ キーが tone でもそうでなくても、文字入力をブロック！

    if (tone !== null && !toneLocked) {
      handleToneSelect(tone);
    }

    // ❌ tone以外なら何もしないが、preventDefault でブロックはする！
  };

  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [showToneButtons, handleToneSelect, toneLocked]);




useEffect(() => {
  console.log("showScoreUp", showScoreUp);
}, [showScoreUp]);

return (
  <main className="p-4 max-w-md mx-auto flex flex-col items-center justify-start pt-15 overflow-hidden">

    {/* 最上部の固定タイトル＆時間バー */}
    <div className="fixed top-0 left-0 w-full z-50">
      {/* タイトル */}
<div className="w-full text-center py-2 bg-[#3ca968]">
  <div className="relative inline-block">
    <h1 className="relative text-xl font-bold text-[#fada48] z-10">
      拼音师傅🥋PINYIN MASTER
    </h1>
  </div>
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
<div className="flex items-baseline min-h-[2.5rem] relative space-x-2">
  <div>{score} pt</div>
{/* +10pt アニメーション */}
<div
  className={clsx(
    "ml-2 text-green-500 text-m transition-opacity duration-100 whitespace-nowrap",
    showScoreUp ? "animate-score-left opacity-0" : "opacity-0"
  )}
>
  +10pt
</div>

{/* +5pt パーフェクトボーナス */}
<div
  className={clsx(
    "ml-2 text-yellow-500 text-m transition-opacity duration-100 whitespace-nowrap",
    showPerfectBonus ? "animate-score-left opacity-0" : "opacity-0"
  )}
>
   +5pt✨️
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
<div className="h-[90px] mb-1 w-full flex justify-center items-center">
  {started && timeLeft > 0 ? (
<WordCard
  hanzi={current.hanzi}
  currentCharIndex={charIndex}
  wordKey={current.hanzi.join('')}
  solvedIndices={pinyinSolvedIndices} // ← NEW!
/>

  ) : null}
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
            ? "bg-[#3ca968] text-white text-white text-lg font-bold cursor-pointer shadow"
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

{timeLeft === 0 && (
  <div className="text-center mt-6">
    <p className="text-2xl font-bold">⌛ 时间到！/ Time is up!</p>
    <p className="text-lg mt-2">合计得分 / Total Score: {score} pt</p>

    {/* ボタンエリア */}
<div className="mt-6 flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
  <button
    className="w-full border-4 border-green-400 text-black text-2xl py-2 px-6 rounded-xl shadow"
    onClick={() => {
      const shuffled = shuffleArray(questions);
      setRemainingQuestions(shuffled);
      setCurrent(shuffled[0]);

      setStarted(false);
      setScore(0);
      setInput('');
      setTimeLeft(60);
      setShowToneButtons(false);
      setCharIndex(0);
      setPinyinSolvedIndices([]);
    }}
  >
    再玩一次 / Play Again
  </button>

  <button
    className="w-full border-4 border-gray-400 text-gray-700  text-2xl py-2 px-6 rounded-xl shadow"
    onClick={() => {
      window.location.href = '/';
    }}
  >
    回到标题 / Back to Title
  </button>
</div>

  </div>
)}

  </main>
);

 



}