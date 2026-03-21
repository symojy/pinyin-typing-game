'use client';

import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type Props = {
  hanzi: string[];
  currentCharIndex: number;
  wordKey: string;
  solvedIndices: number[]; // ← ✅ ここを追加！
};

export function WordCard({ hanzi, currentCharIndex, wordKey, solvedIndices }: Props) {
  return (
    <div className="relative w-full h-[90px] mb-6 overflow-hidden flex justify-center items-center bg-gray-100 rounded-2xl">

      <AnimatePresence mode="wait">
        <motion.div
          key={wordKey}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          // 背景色は各文字の枠（span）にだけ持たせる：文字間は親の背景色が見えるようにする
          className="absolute flex gap-2 z-10 bg-transparent" // ← debug強調
        >
          {hanzi.map((char, i) => {
            const isCurrent = currentCharIndex >= 0 && i === currentCharIndex;
            const isSolved = solvedIndices.includes(i);

            return (
<span
  key={i}
  className={clsx(
  "flex items-center justify-center rounded-xl transition-all duration-300",
  "w-17 h-17 text-4xl bg-white font-hanzi",
  isSolved
    ? "bg-gradient-to-b from-yellow-200 to-yellow-100 border-yellow-500 text-yellow-950 ring-4 ring-yellow-200 shadow-[0_0_0.75rem_rgba(250,218,72,0.95),0_0_2.5rem_rgba(250,218,72,0.35)] animate-char-glow"
    : isCurrent
    ? "font-bold border-blue-300 text-gray-900"
    : "border-gray-300 text-gray-500",
  "border border-t-2 border-l-2 border-r-2 border-b-6"
)}

>
  {char}
</span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
