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
    <div className="relative w-full h-[90px] mb-6 overflow-hidden flex justify-center items-center">

      <AnimatePresence mode="wait">
        <motion.div
          key={wordKey}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute flex gap-2 z-10 bg-white" // ← debug強調
        >
          {hanzi.map((char, i) => {
            const isCurrent = i === currentCharIndex;
            const isSolved = solvedIndices.includes(i);

            return (
<span
  key={i}
  className={clsx(
  "flex items-center justify-center rounded-xl transition-all duration-300",
  "w-17 h-17 text-4xl",
  isSolved
    ? "bg-green-100 border-green-400"
    : isCurrent
    ? "font-bold border-blue-300"
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
