'use client';

type Props = {
  hanzi: string[];
  currentCharIndex: number;
};

export function WordCard({
  hanzi,
  currentCharIndex,
}: Props) {
  return (
    <div className="w-full max-w-xs flex justify-center items-center h-[100px] mb-6">
      <div className="flex gap-2 text-3xl font-bold">
        {hanzi.map((char, i) => (
          <span
            key={i}
            className={i === currentCharIndex ? 'underline' : ''}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
