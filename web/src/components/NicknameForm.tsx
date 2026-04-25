"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok" }
  | { status: "ng"; reason: string };

export function NicknameForm() {
  const router = useRouter();
  const [nick, setNick] = useState("");
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스 중복 검사
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const raw = nick.trim();
    if (!raw) {
      setCheck({ status: "idle" });
      return;
    }
    setCheck({ status: "checking" });
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/auth/nickname/check/?nickname=${encodeURIComponent(raw)}`,
          { credentials: "include" }
        );
        const data = (await res.json()) as {
          available: boolean;
          reason: string;
        };
        if (data.available) setCheck({ status: "ok" });
        else setCheck({ status: "ng", reason: data.reason });
      } catch {
        setCheck({ status: "ng", reason: "검증 실패. 다시 시도해 주세요." });
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [nick]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (check.status !== "ok") {
      setError("사용 가능한 닉네임을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/nickname/set/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nickname: nick.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || "닉네임 저장 실패");
      }
      // 인테이크 미작성 이면 온보딩, 완료면 마이페이지
      if (data.user?.has_intake) router.push("/my");
      else router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="nickname"
        className="block caption text-ink mb-3"
      >
        닉네임
      </label>
      <div className="relative">
        <input
          id="nickname"
          type="text"
          value={nick}
          maxLength={24}
          onChange={(e) => setNick(e.target.value)}
          className="field-input"
          placeholder="예: 피터리, peterlee.maeum"
          autoComplete="off"
          autoFocus
        />
        {nick.trim() && (
          <span
            aria-live="polite"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] tracking-[0.08em]"
            style={{
              color:
                check.status === "ok"
                  ? "var(--color-success)"
                  : check.status === "ng"
                  ? "var(--color-error)"
                  : "var(--color-ink-muted)",
            }}
          >
            {check.status === "checking" && "확인 중…"}
            {check.status === "ok" && "사용 가능 ✓"}
            {check.status === "ng" && "사용 불가"}
          </span>
        )}
      </div>

      {check.status === "ng" && (
        <p className="mt-2 text-[12px] text-[color:var(--color-error)]">
          {check.reason}
        </p>
      )}
      {check.status !== "ng" && (
        <p className="mt-2 text-[12px] text-ink-muted leading-[1.6]">
          영문·한글·숫자·밑줄(_)·마침표(.) 만 사용, 2~24자. 확정 후에도
          마이페이지에서 변경할 수 있습니다.
        </p>
      )}

      {error && (
        <p className="mt-4 text-[13px] text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || check.status !== "ok"}
        className="intake-submit mt-10"
      >
        {submitting ? "저장 중…" : "이 이름으로 시작하기"}
      </button>
    </form>
  );
}
