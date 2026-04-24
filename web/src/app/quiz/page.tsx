"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

interface QOption {
  code: string;
  label: string;
}
interface Q {
  code: string;
  text: string;
  options: QOption[];
}

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/curation/quiz/questions/`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []))
      .catch(() => setError("문항을 불러오지 못했습니다."));
  }, []);

  const progress = questions.length ? ((idx) / questions.length) * 100 : 0;
  const current = questions[idx];

  async function handleChoose(optCode: string) {
    if (!current) return;
    const next = { ...answers, [current.code]: optCode };
    setAnswers(next);
    if (idx < questions.length - 1) {
      setTimeout(() => setIdx(idx + 1), 180);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/curation/quiz/submit/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: next, opt_in: false }),
        });
        if (!res.ok) throw new Error("submit failed");
        const data = await res.json();
        router.push(`/quiz/result/${data.session_token}`);
      } catch {
        setError("결과 전송에 실패했습니다. 다시 시도해주세요.");
        setSubmitting(false);
      }
    }
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px] min-h-screen flex flex-col">
        {!started ? (
          <section className="flex-1 flex flex-col justify-center px-8 md:px-16 py-24 max-w-3xl mx-auto">
            <p className="caption text-ink-muted mb-6">MAEUM · EXPERIENCE TEST</p>
            <h1
              className="font-[family-name:var(--font-serif)] text-ink mb-8"
              style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              당신이 원하는 건
              <br />
              어떤 하루인가요?
            </h1>
            <p className="text-[18px] text-ink-muted leading-[1.8] mb-12">
              6개의 질문으로 당신만의 경험 유형을 찾고,
              <br />
              큐레이터의 맞춤 제안을 받아보세요.
              <br />
              대략 1분이면 충분합니다.
            </p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              disabled={questions.length === 0}
              className="self-start h-[60px] px-12 bg-ink text-ink-inverse font-medium hover:bg-black transition disabled:opacity-50"
            >
              {questions.length === 0 ? "불러오는 중..." : "테스트 시작"}
            </button>
            {error && <p className="caption text-[color:var(--color-error)] mt-6">{error}</p>}
          </section>
        ) : current ? (
          <section className="flex-1 flex flex-col">
            <div className="h-[2px] bg-line">
              <div
                className="h-full bg-ink transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-24 max-w-3xl mx-auto w-full">
              <p className="caption text-ink-muted mb-6">
                {idx + 1} / {questions.length}
              </p>
              <h2
                className="font-[family-name:var(--font-serif)] text-ink mb-16"
                style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1.15, letterSpacing: "-0.02em" }}
              >
                {current.text}
              </h2>
              <ul className="flex flex-col gap-3">
                {current.options.map((o) => {
                  const selected = answers[current.code] === o.code;
                  return (
                    <li key={o.code}>
                      <button
                        type="button"
                        onClick={() => handleChoose(o.code)}
                        disabled={submitting}
                        className={`w-full text-left px-6 py-5 border transition ${
                          selected
                            ? "border-ink bg-ink text-ink-inverse"
                            : "border-line hover:border-ink"
                        }`}
                      >
                        <span className="text-[17px] leading-relaxed">{o.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-12 flex justify-between text-[14px]">
                <button
                  type="button"
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0 || submitting}
                  className="caption text-ink-muted hover:text-ink transition disabled:opacity-30"
                >
                  ← 이전
                </button>
                <Link href="/" className="caption text-ink-muted hover:text-ink transition">
                  나가기
                </Link>
              </div>
              {submitting && (
                <p className="caption text-ink-muted mt-8">결과 계산 중...</p>
              )}
              {error && <p className="caption text-[color:var(--color-error)] mt-6">{error}</p>}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
