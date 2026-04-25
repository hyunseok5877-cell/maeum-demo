"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IS_DEMO, loginDemo } from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type Provider = "google" | "naver";

export function LoginPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string>("");

  async function handleLogin(provider: Provider) {
    setError("");
    setLoading(provider);
    try {
      if (IS_DEMO) {
        loginDemo(`demo-${provider}@maeum.local`, provider === "google" ? "Google 데모" : "Naver 데모");
        router.push("/my");
        router.refresh();
        return;
      }
      // TODO: 실제 OAuth 흐름 교체 포인트
      const seed = Math.random().toString(36).slice(2, 8);
      const email = `demo-${provider}-${seed}@maeum.local`;
      const name = provider === "google" ? "Google 사용자" : "Naver 사용자";

      const res = await fetch(`${API_BASE}/auth/social/mock/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider,
          email,
          name,
          provider_uid: `${provider}:${seed}`,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `로그인 실패 (${res.status})`);
      }
      const data = (await res.json()) as {
        user: { has_intake: boolean; needs_nickname: boolean };
        is_new: boolean;
      };

      if (data.user.needs_nickname) router.push("/welcome");
      else if (!data.user.has_intake) router.push("/onboarding");
      else router.push("/my");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setLoading(null);
    }
  }

  async function demoLoginAsPeter() {
    setError("");
    setLoading("mock" as Provider);
    try {
      if (IS_DEMO) {
        loginDemo("peter@maeum.local", "Peter Lee");
        router.push("/my");
        router.refresh();
        return;
      }
      const res = await fetch(`${API_BASE}/auth/social/mock/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: "mock",
          email: "peter@maeum.local",
          name: "Peter Lee",
          provider_uid: "mock:peter",
        }),
      });
      if (!res.ok) throw new Error(`로그인 실패 (${res.status})`);
      const data = await res.json();
      if (data.user?.needs_nickname) router.push("/welcome");
      else if (!data.user?.has_intake) router.push("/onboarding");
      else router.push("/my");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 개발·데모 원클릭 로그인 */}
      <button
        type="button"
        disabled={loading !== null}
        onClick={demoLoginAsPeter}
        className="social-btn social-btn--demo"
        aria-label="Peter 데모 계정으로 로그인"
      >
        <span style={{ fontSize: 16 }}>👑</span>
        <span>
          {loading === ("mock" as Provider)
            ? "로그인 중…"
            : "Peter 로 즉시 로그인 (데모)"}
        </span>
      </button>

      <div className="flex items-center gap-3 my-2">
        <span className="flex-1 h-px bg-[color:var(--color-line)]" />
        <span className="text-[11px] tracking-[0.18em] uppercase text-ink-muted">
          또는
        </span>
        <span className="flex-1 h-px bg-[color:var(--color-line)]" />
      </div>

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleLogin("google")}
        className="social-btn social-btn--google"
        aria-label="Google 로그인"
      >
        <GoogleLogo />
        <span>{loading === "google" ? "연결 중…" : "Google 로 시작하기"}</span>
      </button>

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleLogin("naver")}
        className="social-btn social-btn--naver"
        aria-label="Naver 로그인"
      >
        <NaverLogo />
        <span>{loading === "naver" ? "연결 중…" : "Naver 로 시작하기"}</span>
      </button>

      {error && (
        <p className="text-[13px] text-[color:var(--color-error)] text-center mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function NaverLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="#FFFFFF"
        d="M9.3 8.57 6.54 4.5H4v7h2.7V7.43l2.76 4.07H12v-7H9.3z"
      />
    </svg>
  );
}
