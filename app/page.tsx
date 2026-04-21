"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Phase = "setup" | "playing" | "result";

type Question = {
  a: number;
  b: number;
};

type Attempt = {
  question: Question;
  userAnswer: number;
  correct: boolean;
  elapsedMs: number;
};

const ALL_MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9] as const;
const QUESTION_COUNT_OPTIONS = [10, 20, 30] as const;

function makeQuestion(multipliers: number[]): Question {
  const a = multipliers[Math.floor(Math.random() * multipliers.length)];
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b };
}

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selected, setSelected] = useState<number[]>([...ALL_MULTIPLIERS]);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [current, setCurrent] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    question: Question;
    userAnswer: number;
  }>(null);
  const [questionStart, setQuestionStart] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMultiplier = (n: number) => {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b),
    );
  };

  const startGame = () => {
    if (selected.length === 0) return;
    setAttempts([]);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    const q = makeQuestion(selected);
    setCurrent(q);
    const t = Date.now();
    setStartTime(t);
    setQuestionStart(t);
    setNow(t);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && !feedback) {
      inputRef.current?.focus();
    }
  }, [phase, feedback, currentIndex]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const submit = useCallback(() => {
    if (!current || feedback) return;
    const num = Number(answer);
    if (answer.trim() === "" || Number.isNaN(num)) return;

    const correct = num === current.a * current.b;
    const elapsed = Date.now() - questionStart;
    const attempt: Attempt = {
      question: current,
      userAnswer: num,
      correct,
      elapsedMs: elapsed,
    };
    const nextAttempts = [...attempts, attempt];
    setAttempts(nextAttempts);
    setFeedback({ correct, question: current, userAnswer: num });

    feedbackTimer.current = setTimeout(
      () => {
        setFeedback(null);
        if (nextAttempts.length >= totalQuestions) {
          setPhase("result");
          return;
        }
        setCurrentIndex((i) => i + 1);
        setCurrent(makeQuestion(selected));
        setAnswer("");
        setQuestionStart(Date.now());
      },
      correct ? 600 : 1400,
    );
  }, [answer, attempts, current, feedback, questionStart, selected, totalQuestions]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const summary = useMemo(() => {
    const correctCount = attempts.filter((a) => a.correct).length;
    const totalMs = attempts.reduce((s, a) => s + a.elapsedMs, 0);
    const wrong = attempts.filter((a) => !a.correct);
    return {
      correctCount,
      totalMs,
      wrong,
      accuracy: attempts.length ? Math.round((correctCount / attempts.length) * 100) : 0,
    };
  }, [attempts]);

  const elapsedAll = phase === "playing" ? now - startTime : 0;

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950">
      <main className="w-full max-w-xl">
        {phase === "setup" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              九九乘法練習
            </h1>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              選擇要練習的乘數和題數，按下開始即可。
            </p>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  練習乘數
                </h2>
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => setSelected([...ALL_MULTIPLIERS])}
                  >
                    全選
                  </button>
                  <button
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => setSelected([])}
                  >
                    清除
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ALL_MULTIPLIERS.map((n) => {
                  const active = selected.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleMultiplier(n)}
                      className={
                        "rounded-xl border-2 py-3 text-xl font-bold transition " +
                        (active
                          ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400")
                      }
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                題數
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNT_OPTIONS.map((n) => {
                  const active = totalQuestions === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setTotalQuestions(n)}
                      className={
                        "rounded-xl border-2 py-3 text-lg font-semibold transition " +
                        (active
                          ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400")
                      }
                    >
                      {n} 題
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={selected.length === 0}
              className="w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:shadow-indigo-950 dark:disabled:bg-slate-700"
            >
              開始練習
            </button>
          </section>
        )}

        {phase === "playing" && current && (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                第 <b className="text-slate-900 dark:text-slate-100">{currentIndex + 1}</b> /{" "}
                {totalQuestions} 題
              </span>
              <span>計時：{formatSeconds(elapsedAll)} 秒</span>
            </div>

            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
              />
            </div>

            <div className="my-12 text-center">
              <div className="text-6xl font-bold tracking-wider text-slate-900 sm:text-7xl dark:text-slate-50">
                {current.a} × {current.b} = ?
              </div>
            </div>

            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKey}
              disabled={!!feedback}
              placeholder="輸入答案"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-center text-3xl font-semibold text-slate-900 outline-none transition focus:border-indigo-500 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:disabled:bg-slate-900"
            />

            <button
              onClick={submit}
              disabled={!!feedback || answer.trim() === ""}
              className="mt-4 w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              送出（Enter）
            </button>

            {feedback && (
              <div
                className={
                  "mt-6 rounded-2xl p-4 text-center text-lg font-semibold " +
                  (feedback.correct
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200")
                }
              >
                {feedback.correct ? (
                  <>答對了！ 🎉</>
                ) : (
                  <>
                    答錯囉，正確答案是{" "}
                    <b>
                      {feedback.question.a} × {feedback.question.b} ={" "}
                      {feedback.question.a * feedback.question.b}
                    </b>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {phase === "result" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
              練習結果
            </h1>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {summary.accuracy === 100
                ? "太厲害了，全部答對！"
                : summary.accuracy >= 80
                  ? "表現很棒，再接再厲！"
                  : "多練幾次就會進步喔！"}
            </p>

            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950">
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {summary.correctCount}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400">答對</div>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4 text-center dark:bg-rose-950">
                <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                  {attempts.length - summary.correctCount}
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-400">答錯</div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-4 text-center dark:bg-indigo-950">
                <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                  {summary.accuracy}%
                </div>
                <div className="text-xs text-indigo-700 dark:text-indigo-400">正確率</div>
              </div>
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400">總用時</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {formatSeconds(summary.totalMs)} 秒
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                平均每題 {formatSeconds(summary.totalMs / Math.max(attempts.length, 1))} 秒
              </div>
            </div>

            {summary.wrong.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  錯誤的題目
                </h2>
                <ul className="space-y-2">
                  {summary.wrong.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm dark:bg-rose-950/40"
                    >
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {a.question.a} × {a.question.b}
                      </span>
                      <span className="text-rose-700 dark:text-rose-300">
                        你：{a.userAnswer}　正確：
                        <b>{a.question.a * a.question.b}</b>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-indigo-950"
              >
                再玩一次
              </button>
              <button
                onClick={() => setPhase("setup")}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                回設定
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
