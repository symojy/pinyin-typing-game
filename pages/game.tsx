import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import beginnerQuestions from '../data/questions-beginner.json';
import intermediateQuestions from '../data/questions-intermediate.json';
import { WordCard } from '../components/WordCard';

type QuestionItem = (typeof beginnerQuestions)[number];

const MAX_TIME_SECONDS = 30;
const BASE_POINTS_PER_CHAR = 10; // 拼音が合っていれば基本点

/**
 * 共有テキスト末尾の「遊んでみたくなる一言」＋その直前の空行のあとに URL を付けます。
 * 文言を変えたいときはここだけ編集してください。
 */
const SHARE_VIRAL_HOOK =
  '30秒拼音快闪，你也来挑战一下？ / 30s pinyin sprint — can you beat my score?';

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function normalizePinyinInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function stripSpaces(value: string) {
  return value.replace(/\s+/g, '');
}

/**
 * 拼音比較用: ü（ウムラウト付き u）とキーボード入力の v を同一視する。
 * ǖ ǘ ǚ ǜ（ü + 声調）も v に寄せる。
 */
function normalizeUmlautUForCompare(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\u00fc/g, 'v') // ü
    .replace(/\u01d6|\u01d8|\u01da|\u01dc/g, 'v'); // ǖ ǘ ǚ ǜ
}

/**
 * 正解データが ü（正規化後は v）のとき、ウムラウトを打てず u だけ打った場合も正解にする。
 * 期待が本当の「lu」で入力が「lv」のときは不正解のまま（位置ごとに v のときだけ u を許容）。
 */
function matchesWithUmlautUFallback(expected: string, typed: string) {
  if (expected.length !== typed.length) return false;
  for (let i = 0; i < expected.length; i++) {
    const e = expected[i];
    const t = typed[i];
    if (e === t) continue;
    if (e === 'v' && t === 'u') continue;
    return false;
  }
  return true;
}

export default function Game() {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME_SECONDS);
  const [score, setScore] = useState(0);
  const [showScoreUp, setShowScoreUp] = useState(false);
  const [scoreUpText, setScoreUpText] = useState<string | null>(null);
  const [glowIndices, setGlowIndices] = useState<number[]>([]);
  const [isScoring, setIsScoring] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [maxComboAchieved, setMaxComboAchieved] = useState(0);
  const [wordsSolved, setWordsSolved] = useState(0);
  /** 终局理由：时间到 / 题目做完 */
  const [finishKind, setFinishKind] = useState<'time' | 'bank' | null>(null);
  const [scorePulseId, setScorePulseId] = useState(0);
  const [shake] = useState(false);
  const [wordShake, setWordShake] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scoringRunRef = useRef(0);

  // SSR と CSR の最初の描画を一致させるため、初期レンダーでは shuffle しない。
  // ランダム化はクライアント側のマウント後に行う。
  const [, setRemainingQuestions] = useState<QuestionItem[]>(
    () => beginnerQuestions
  );
  const [current, setCurrent] = useState<QuestionItem>(
    () => beginnerQuestions[0]
  );
  const [activeBank, setActiveBank] = useState<QuestionItem[]>(beginnerQuestions);

  const [pinyinInput, setPinyinInput] = useState('');

  const levelKey =
    router.isReady && router.query.level
      ? Array.isArray(router.query.level)
        ? router.query.level[0]
        : router.query.level
      : undefined;

  const isHardLevel = levelKey === 'hard';

  useEffect(() => {
    if (!router.isReady) return;
    if (isHardLevel) return;

    const bank: QuestionItem[] =
      levelKey === 'medium' ? intermediateQuestions : beginnerQuestions;

    setActiveBank(bank);
    const shuffled = shuffleArray(bank);
    setRemainingQuestions(shuffled);
    setCurrent(shuffled[0]);

    setStarted(false);
    setScore(0);
    setComboCount(0);
    setMaxComboAchieved(0);
    setWordsSolved(0);
    setFinishKind(null);
    setShareHint(null);
    setScorePulseId(0);
    setTimeLeft(MAX_TIME_SECONDS);
    setPinyinInput('');
    setGlowIndices([]);
    setIsScoring(false);
    setWordShake(false);
    scoringRunRef.current += 1;
  }, [router.isReady, levelKey, isHardLevel]);

  const expectedPinyinWithSpaces = useMemo(
    () => current.pinyin.join(' ').toLowerCase(),
    [current.pinyin]
  );
  const expectedPinyinNoSpaces = useMemo(
    () => stripSpaces(expectedPinyinWithSpaces),
    [expectedPinyinWithSpaces]
  );
  const expectedCompareWithSpaces = useMemo(
    () => normalizeUmlautUForCompare(expectedPinyinWithSpaces),
    [expectedPinyinWithSpaces]
  );
  const expectedCompareNoSpaces = useMemo(
    () => normalizeUmlautUForCompare(expectedPinyinNoSpaces),
    [expectedPinyinNoSpaces]
  );

  const handleFocus = () => {
    if (!started) setStarted(true);
  };

  const goToNextQuestion = useCallback(() => {
    setRemainingQuestions((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        setCurrent(next[0]);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        setFinishKind('bank');
        setTimeLeft(0);
      }
      return next;
    });
  }, []);

  const handleSkipWord = () => {
    scoringRunRef.current += 1; // 現在進行中の得点演出を無効化
    setIsScoring(false);
    setGlowIndices([]);
    setComboCount(0);
    setPinyinInput('');
    setWordShake(false);
    goToNextQuestion();
  };

  const showScorePopup = useCallback((text: string) => {
    setScoreUpText(text);
    setShowScoreUp(true);
    window.setTimeout(() => setShowScoreUp(false), 700);
  }, []);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = window.setInterval(
        () => setTimeLeft((prev) => prev - 1),
        1000
      );
      return () => window.clearInterval(timer);
    }
  }, [started, timeLeft]);

  /** 倒计时自然到 0 → 标记为时间到（题目先做完则已为 bank） */
  useEffect(() => {
    if (!started || timeLeft !== 0) return;
    setFinishKind((k) => (k == null ? 'time' : k));
  }, [started, timeLeft]);

  // 拼音だけ：正解したら基本点 → 次の問題へ（スマホでも入力テンポを切らない）
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    if (isScoring) return;
    const normalized = normalizePinyinInput(pinyinInput);
    if (normalized.length === 0) return;

    const typedCompareNoSpaces = normalizeUmlautUForCompare(
      stripSpaces(normalized)
    );
    const typedCompareWithSpaces = normalizeUmlautUForCompare(normalized);
    const expectedLen = expectedCompareNoSpaces.length;

    // スペースを除いた「拼音の文字数」が期待の全長に達するまで判定しない（途中は自由に打てる）
    if (typedCompareNoSpaces.length < expectedLen) return;

    const isCorrect =
      typedCompareWithSpaces === expectedCompareWithSpaces ||
      typedCompareNoSpaces === expectedCompareNoSpaces ||
      matchesWithUmlautUFallback(
        expectedCompareWithSpaces,
        typedCompareWithSpaces
      ) ||
      matchesWithUmlautUFallback(
        expectedCompareNoSpaces,
        typedCompareNoSpaces
      );

    // 期待より長く打ったらミス扱い（ブルブル＆リセット）
    if (typedCompareNoSpaces.length > expectedLen || !isCorrect) {
      scoringRunRef.current += 1;
      setComboCount(0);
      setGlowIndices([]);
      setWordShake(true);
      window.setTimeout(() => setWordShake(false), 380);
      setPinyinInput('');
      return;
    }

    const hanziLen = current.hanzi.length;
    const nextCombo = comboCount + 1;
    const multiplier = 1 + Math.min(nextCombo - 1, 9) * 0.1;
    const pointsPerChar = Math.round(BASE_POINTS_PER_CHAR * multiplier);
    const baseTotal = hanziLen * pointsPerChar;

    setMaxComboAchieved((m) => Math.max(m, nextCombo));
    setWordsSolved((w) => w + 1);

    scoringRunRef.current += 1;
    const runId = scoringRunRef.current;

    setIsScoring(true);
    setGlowIndices([]);
    setComboCount(nextCombo);
    setPinyinInput('');
    showScorePopup(`+${baseTotal}pt  COMBO x${nextCombo} ✨`);

    // 1文字ごとに得点＆枠を光らせる
    for (let idx = 0; idx < hanziLen; idx++) {
      const t = idx * 140;
      window.setTimeout(() => {
        if (scoringRunRef.current !== runId) return;

        setGlowIndices((prev) =>
          prev.includes(idx) ? prev : [...prev, idx]
        );
        setScore((s) => s + pointsPerChar);
        setScorePulseId((v) => v + 1);

        if (idx === hanziLen - 1) {
          window.setTimeout(() => {
            if (scoringRunRef.current !== runId) return;
            setGlowIndices([]);
            setIsScoring(false);
            goToNextQuestion();
            inputRef.current?.focus();
          }, 80);
        }
      }, t);
    }
  }, [
    started,
    timeLeft,
    isScoring,
    comboCount,
    pinyinInput,
    expectedCompareWithSpaces,
    expectedCompareNoSpaces,
    current.hanzi.length,
    showScorePopup,
    goToNextQuestion,
  ]);

  const solvedIndicesForCard = glowIndices;

  /** 結果モーダル・共有文用（hard はゲーム外だが型のため） */
  const difficultyForResult = useMemo(() => {
    if (levelKey === 'medium') {
      return { zh: '中级', en: 'Medium', line: '中级 / Medium' };
    }
    return { zh: '入门', en: 'Intro', line: '入门 / Intro' };
  }, [levelKey]);

  const showEndModal = started && timeLeft === 0;

  const resetRound = useCallback(() => {
    const shuffled = shuffleArray(activeBank);
    setRemainingQuestions(shuffled);
    setCurrent(shuffled[0]);
    setStarted(false);
    setScore(0);
    setComboCount(0);
    setMaxComboAchieved(0);
    setWordsSolved(0);
    setFinishKind(null);
    setShareHint(null);
    setScorePulseId(0);
    setTimeLeft(MAX_TIME_SECONDS);
    setPinyinInput('');
    setGlowIndices([]);
    setIsScoring(false);
    setWordShake(false);
    scoringRunRef.current += 1;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [activeBank]);

  const handleShare = useCallback(async () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const homeUrl = origin ? `${origin}/` : '';
    const lines = [
      `【拼音师傅 Pinyin Master】${difficultyForResult.line}`,
      `得分/Score: ${score} pt`,
      `最高连击/Max combo: ×${maxComboAchieved}`,
      `答对题数/Words cleared: ${wordsSolved}`,
      '',
      SHARE_VIRAL_HOOK,
      '',
      homeUrl || '(open the site URL)',
    ];
    const text = lines.join('\n');
    const shareTitle = `Pinyin Master · ${difficultyForResult.zh}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: shareTitle, text });
        setShareHint('已分享 · Shared');
      } else if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(text);
        setShareHint('已复制到剪贴板 · Copied');
      } else {
        window.prompt('Copy:', text);
        setShareHint(null);
        return;
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareHint('已复制到剪贴板 · Copied');
      } catch {
        setShareHint('无法分享（请手动复制）');
      }
    }
    window.setTimeout(() => setShareHint(null), 3200);
  }, [difficultyForResult, score, maxComboAchieved, wordsSolved]);

  if (!router.isReady) {
    return (
      <div className="min-h-[100dvh] bg-[#3ca968] flex items-center justify-center text-white text-lg font-bold">
        Loading…
      </div>
    );
  }

  if (isHardLevel) {
    return (
      <div className="min-h-[100dvh] bg-[#3ca968] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-bold text-[#fada48] mb-2">高级模式</p>
        <p className="text-white text-lg mb-2">开发中 / Under construction</p>
        <p className="text-white/85 text-sm mb-8 max-w-sm">
          次のアップデートで追加予定です。
        </p>
        <button
          type="button"
          className="border-4 border-gray-200 bg-white text-black rounded-2xl px-8 py-3 font-bold shadow"
          onClick={() => router.push('/')}
        >
          回到标题 / Back to Title
        </button>
      </div>
    );
  }

  const endHeadline =
    finishKind === 'bank'
      ? { zh: '全部答完！', sub: 'All words in this round!' }
      : { zh: '时间到！', sub: "Time's up!" };

  return (
    <>
      {showEndModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px] animate-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-modal-title"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border-4 border-[#fada48] overflow-hidden animate-modal-card">
            <div className="bg-[#3ca968] px-5 py-4 text-center">
              <p
                id="result-modal-title"
                className="text-[#fada48] text-2xl font-black tracking-tight"
              >
                {endHeadline.zh}
              </p>
              <p className="text-white/90 text-sm mt-1">{endHeadline.sub}</p>
              <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/30">
                难度 / Level: {difficultyForResult.zh} · {difficultyForResult.en}
              </p>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 px-4 py-4 text-center">
                <p className="text-xs font-semibold text-amber-900/70 uppercase tracking-wider">
                  本局得分 / Score
                </p>
                <p className="text-5xl font-black text-[#3ca968] tabular-nums leading-tight mt-1">
                  {score}
                </p>
                <p className="text-sm text-gray-600 font-medium">pt</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-3 text-center">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">
                    最高连击
                  </p>
                  <p className="text-xs text-gray-400">Max combo</p>
                  <p className="text-2xl font-black text-orange-600 mt-1 tabular-nums">
                    ×{maxComboAchieved}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-3 text-center">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">
                    答对题数
                  </p>
                  <p className="text-xs text-gray-400">Words cleared</p>
                  <p className="text-2xl font-black text-[#3ca968] mt-1 tabular-nums">
                    {wordsSolved}
                  </p>
                </div>
              </div>

              {maxComboAchieved >= 5 && (
                <p className="text-center text-sm font-bold text-orange-700 bg-orange-100/80 rounded-xl py-2 px-3 border border-orange-200">
                  🔥 连击 {maxComboAchieved}！手感火热！
                </p>
              )}

              {shareHint ? (
                <p className="text-center text-xs text-gray-600">{shareHint}</p>
              ) : null}

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  className="w-full rounded-2xl bg-[#3ca968] text-white font-bold text-lg py-3.5 border-2 border-[#2d8a52] shadow-md active:scale-[0.98] transition-transform"
                  onClick={resetRound}
                >
                  再玩一次 / Play again
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white text-gray-800 font-bold text-lg py-3.5 border-4 border-gray-200 active:scale-[0.98] transition-transform"
                  onClick={() => router.push('/')}
                >
                  回到标题 / Title
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-[#fada48] text-black font-bold text-lg py-3.5 border-2 border-amber-400 shadow active:scale-[0.98] transition-transform"
                  onClick={() => void handleShare()}
                >
                  分享成绩 / Share
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* タイトルバー・上部プログレスは廃止（スマホキーボードで隠れるため）。残り時間は入力付近のバッジで表示 */}
      <div className="h-[100dvh] overflow-y-auto overscroll-contain">
        <main className="p-4 pt-[max(1rem,env(safe-area-inset-top))] max-w-md mx-auto flex flex-col items-center justify-start">
      <div
        className={clsx(
          'mt-5 h-[80px] mb-1 w-full flex justify-center items-center',
          wordShake && 'animate-shake'
        )}
      >
        {started && timeLeft > 0 ? (
          <WordCard
            hanzi={current.hanzi}
            currentCharIndex={-1}
            wordKey={current.hanzi.join('')}
            solvedIndices={solvedIndicesForCard}
          />
        ) : null}
      </div>

      {/* 拼音入力 */}
      <div className="w-full flex flex-col items-center gap-3 mb-4">
        <div className="w-full flex items-center justify-between text-sm text-gray-700 px-1">
          <div className="flex-1 text-left">
            Type the full pinyin. Spaces optional.
            <div className="text-xs text-gray-500 mt-1">
              e.g.{' '}
              <span className="font-sans tracking-wide">{expectedPinyinWithSpaces}</span>
            </div>
          </div>
          {/* 残り時間（秒） */}
          <div
            className={clsx(
              'ml-3 flex items-center px-2 py-1 rounded-full text-xs font-semibold border',
              timeLeft > 10
                ? 'bg-green-100 text-green-800 border-green-300'
                : timeLeft > 5
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-red-100 text-red-800 border-red-300'
            )}
          >
            <span className="mr-1">⏱</span>
            <span>{timeLeft}s</span>
          </div>
        </div>

        <div className="w-full flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            className={clsx(
              'flex-1 min-w-0 px-4 py-3 text-center rounded-2xl transition-all duration-300 border-4 outline-none font-sans',
              shake && 'animate-shake',
              !started
                ? 'bg-[#3ca968] text-white text-lg font-bold cursor-pointer shadow'
                : 'bg-gray-50 text-xl border-blue-300 text-black'
            )}
            placeholder={!started ? 'Tap to start' : 'Type pinyin'}
            value={pinyinInput}
            onChange={(e) => {
              if (isScoring) return;
              setPinyinInput(e.target.value);
            }}
            onFocus={handleFocus}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            disabled={timeLeft === 0}
            readOnly={isScoring}
          />

          <button
            onClick={handleSkipWord}
            className="shrink-0 border-4 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold"
            disabled={timeLeft === 0}
            aria-label="Skip"
          >
            ⏩
          </button>
        </div>
      </div>

      {/* スコアと手元タイマーが常にフォーム付近に来るよう、フォームのすぐ下に配置 */}
      <div className="w-full max-w-md mx-auto text-xl mt-1 mb-2 flex justify-start h-9">
        {started ? (
          <>
            <div className="flex items-baseline min-h-[2.5rem] relative space-x-2">
              <div key={scorePulseId} className="animate-hop">
                {score} pt
              </div>
              <div
                className={clsx(
                  'ml-2 text-green-500 text-m transition-opacity duration-100 whitespace-nowrap',
                  showScoreUp ? 'animate-score-left' : 'opacity-0'
                )}
              >
                {scoreUpText ?? ''}
              </div>
              {comboCount > 1 && (
                <div
                  className={clsx(
                    'ml-3 px-2 py-1 rounded-full text-xs font-bold border',
                    comboCount > 5
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  )}
                >
                  🔥 x{comboCount}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </>
        )}
      </div>

        </main>
      </div>
    </>
  );
}