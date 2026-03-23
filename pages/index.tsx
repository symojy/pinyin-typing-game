import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const ogTitle = 'Pinyin Master';
  const ogDescription =
    '30秒拼音快闪，你也来挑战一下？ / 30s pinyin sprint — can you beat my score?';
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pinyin-typing-game.vercel.app';
  const ogImage = `${baseUrl}/images/title.png`;
  const ogUrl = `${baseUrl}/`;

  const handleStart = (level: string) => {
    router.push(`/game?level=${level}`);
  };

  return (
    <>
      <Head>
        <title>{ogTitle}</title>
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1536" />
        <meta property="og:image:height" content="1024" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

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
              { label: '入门 / Intro（100 词）', level: 'intro' },
              { label: '中级 / Medium（200 词）', level: 'medium' },
              { label: '高级 / Hard（开发中）', level: 'hard' },
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
    </>
  );
}
