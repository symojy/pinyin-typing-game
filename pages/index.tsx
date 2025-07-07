import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🐼 ピンインタイピングゲーム</h1>
      <button
        className="bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600"
        onClick={() => router.push('/game?level=easy')}
      >
        初級でスタート
      </button>
    </main>
  );
}
