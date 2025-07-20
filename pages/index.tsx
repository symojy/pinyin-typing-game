import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handleStart = (level: string) => {
    router.push(`/game?level=${level}`);
  };

  return (
<main className="min-h-screen bg-[#3ca968] px-4 py-8">
  {/* タイトル画像 */}
  <div className="flex flex-col items-center">
    <div className="mb-6">
      <Image
        src="/images/title.png"
        alt="Pinyin Master Title"
        width={400}
        height={200}
        priority
      />
    </div>

    {/* 難易度ボタン */}
    <div className="flex flex-col gap-4 w-full max-w-xs">
      {[
        { label: '入门 / Intro', level: 'intro' },
        { label: '初级 / Easy', level: 'easy' },
        { label: '中级 / Medium', level: 'medium' },
        { label: '高级 / Hard', level: 'hard' },
      ].map(({ label, level }) => (
        <button
          key={level}
          className="bg-white text-black py-3 px-4 border border-gray-400 rounded-2xl shadow hover:bg-gray-100 transition"
          onClick={() => handleStart(level)}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
</main>
  );
}
