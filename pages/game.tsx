import { useEffect, useState } from 'react';

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
  const [inputs, setInputs] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<(1 | 2 | 3 | 4 | null)[]>([]);
  const [started, setStarted] = useState(false);

  const current = questions[currentIndex % questions.length];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setStarted(true);
      setSelectedTones(Array(current.hanzi.length).fill(null));
    }
  }, [countdown]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const splitted = value.match(/[a-z]+/g) || [];
    setInputs(splitted);
  };

  const selectTone = (index: number, tone: 1 | 2 | 3 | 4) => {
    const newTones = [...selectedTones];
    newTones[index] = tone;
    setSelectedTones(newTones);
  };

  const checkAnswer = () => {
    const pinyinMatch = JSON.stringify(inputs) === JSON.stringify(current.pinyin);
    const toneMatch = JSON.stringify(selectedTones) === JSON.stringify(current.tones);

    if (pinyinMatch && toneMatch) setScore((s) => s + 10);

    setInputs([]);
    setSelectedTones(Array(current.hanzi.length).fill(null));
    setCurrentIndex((i) => i + 1);
  };

  useEffect(() => {
    if (inputs.length === current.hanzi.length &&
        selectedTones.every((t) => t !== null)) {
      checkAnswer();
    }
  }, [inputs, selectedTones]);

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

      <div className="flex justify-center gap-6 mb-4">
        {current.hanzi.map((char, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-sm text-gray-500 h-5">
              {selectedTones[i] ? `第${selectedTones[i]}声` : ''}
            </div>
            <div className="text-3xl mb-2">{char}</div>
            <input
              inputMode="latin"
              className="w-20 p-1 border rounded text-center"
              value={inputs[i] || ''}
              onChange={handleInput}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4].map((tone) => (
          <button
            key={tone}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => {
              const targetIndex = selectedTones.findIndex((t) => t === null);
              if (targetIndex !== -1) selectTone(targetIndex, tone as 1 | 2 | 3 | 4);
            }}
          >
            第{tone}声
          </button>
        ))}
      </div>
    </main>
  );
}
