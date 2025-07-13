'use client';
import { motion } from "framer-motion";
import clsx from "clsx";

type Props = {
  hanzi: string[];
  currentCharIndex: number;
  pinyinSolvedIndices: number[];
  keyId: string;
  glowingCharIndex: number | null;
};

export function WordCard({
  hanzi,
  currentCharIndex,
  pinyinSolvedIndices,
  keyId,
  glowingCharIndex,
}: Props) {
  return (
  <motion.div
    key={keyId}
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -300 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="w-full max-w-xs bg-white border rounded-2xl shadow-lg flex justify-center items-center h-[100px] mb-6"
  >
    <div className="flex gap-2 items-center min-h-[64px]">
{hanzi.map((char, i) => (
  <div key={i} className="relative inline-block">
    <span
      className={clsx(
        "transition-all duration-300",
        i === currentCharIndex &&
          "text-5xl font-bold bg-blue-100 rounded px-2 py-1 shadow-inner",
        pinyinSolvedIndices.includes(i) &&
          "text-green-600 text-3xl font-bold",
        glowingCharIndex === i && "animate-pulse bg-green-300",
        !(i === currentCharIndex || pinyinSolvedIndices.includes(i)) &&
          "text-3xl"
      )}
    >
      {char}
    </span>

    {/* ✅アイコン表示：正解時だけ出す */}
    {pinyinSolvedIndices.includes(i) && (
      <span className="absolute bottom-0 right-0 text-xs text-green-500">
        ✅
      </span>
    )}
  </div>
))}

    </div>
  </motion.div>
);
}
