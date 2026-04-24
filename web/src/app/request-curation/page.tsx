"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

interface RegionLite {
  id: number;
  code: string;
  name_ko: string;
}

const OCCASIONS = [
  { code: "birthday", label: "생일" },
  { code: "anniversary", label: "기념일" },
  { code: "proposal", label: "프로포즈" },
  { code: "business", label: "비즈니스 · 접대" },
  { code: "self_reward", label: "자기 보상" },
  { code: "other", label: "기타" },
] as const;

function FormInner() {
  const params = useSearchParams();
  const typeCode = params.get("type") ?? "";

  const [step, setStep] = useState(1);
  const [regions, setRegions] = useState<RegionLite[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    preferred_date_start: "",
    preferred_date_end: "",
    region_id: "",
    budget_min: "",
    budget_max: "",
    pax_count: 2,
    occasion: "self_reward",
    free_text: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/experiences/regions/`)
      .then((r) => r.json())
      .then((d) => setRegions(d.results ?? d ?? []))
      .catch(() => {});
  }, []);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        guest_name: form.guest_name,
        guest_phone: form.guest_phone,
        guest_email: form.guest_email,
        pax_count: Number(form.pax_count) || 2,
        occasion: form.occasion,
        free_text: form.free_text,
        source: "web_form",
      };
      if (form.preferred_date_start) body.preferred_date_start = form.preferred_date_start;
      if (form.preferred_date_end) body.preferred_date_end = form.preferred_date_end;
      if (form.region_id) body.region = Number(form.region_id);
      if (form.budget_min) body.budget_min = Number(form.budget_min);
      if (form.budget_max) body.budget_max = Number(form.budget_max);

      const res = await fetch(`${API_BASE}/curation/requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "submission failed");
      }
      const data = await res.json();
      setDone({ id: data.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="flex-1 flex flex-col justify-center items-center px-8 py-32 text-center">
        <p className="caption text-ink-muted mb-6">REQUEST · RECEIVED</p>
        <h1
          className="font-[family-name:var(--font-serif)] text-ink mb-8 max-w-2xl"
          style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}
        >
          문의가 접수되었습니다.
        </h1>
        <p className="text-[18px] text-ink-muted mb-3">문의 번호 #{done.id}</p>
        <p className="text-[16px] text-ink-muted max-w-xl leading-relaxed mb-12">
          담당 큐레이터가 24~48시간 내에 3안의 제안서를 준비해
          입력해주신 연락처로 회신드립니다.
        </p>
        <div className="flex gap-4">
          <Link
            href="/experiences"
            className="h-[52px] px-8 inline-flex items-center bg-ink text-ink-inverse font-medium hover:bg-black transition"
          >
            다른 경험 둘러보기
          </Link>
          <Link
            href="/"
            className="h-[52px] px-8 inline-flex items-center border border-line text-ink hover:bg-muted-bg transition"
          >
            홈으로
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex-1 px-8 md:px-16 py-16 max-w-3xl mx-auto w-full">
      <p className="caption text-ink-muted mb-4">CURATION · REQUEST</p>
      <h1
        className="font-[family-name:var(--font-serif)] text-ink mb-6"
        style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
      >
        나만의 하루를
        <br />
        함께 설계합니다.
      </h1>
      <p className="text-[18px] text-ink-muted mb-16 leading-relaxed">
        세 단계의 짧은 질문에 답해주시면, 담당 큐레이터가 3가지 제안서를 드립니다.
      </p>

      {typeCode && (
        <p className="caption text-ink-muted mb-10">YOUR TYPE · {typeCode}</p>
      )}

      {/* Step indicator */}
      <div className="flex gap-4 mb-12">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`flex-1 h-[3px] ${
              n <= step ? "bg-ink" : "bg-line"
            } transition`}
          />
        ))}
      </div>

      {step === 1 && (
        <section className="flex flex-col gap-8">
          <h2 className="font-[family-name:var(--font-serif)] text-[28px] text-ink">
            1. 무엇을 원하시나요?
          </h2>

          <Field label="희망 날짜 범위">
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={form.preferred_date_start}
                onChange={(e) => setField("preferred_date_start", e.target.value)}
                className="flex-1 border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
              />
              <span className="text-ink-muted">~</span>
              <input
                type="date"
                value={form.preferred_date_end}
                onChange={(e) => setField("preferred_date_end", e.target.value)}
                className="flex-1 border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
              />
            </div>
          </Field>

          <Field label="지역 선호">
            <select
              value={form.region_id}
              onChange={(e) => setField("region_id", e.target.value)}
              className="w-full border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
            >
              <option value="">지역 상관 없음</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name_ko}
                </option>
              ))}
            </select>
          </Field>

          <Field label="인원">
            <input
              type="number"
              min={1}
              max={20}
              value={form.pax_count}
              onChange={(e) => setField("pax_count", Number(e.target.value) || 1)}
              className="w-32 border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
            />
          </Field>

          <Field label="예산 범위 (KRW)">
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="최소"
                value={form.budget_min}
                onChange={(e) => setField("budget_min", e.target.value)}
                className="flex-1 border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
              />
              <span className="text-ink-muted">~</span>
              <input
                type="number"
                placeholder="최대"
                value={form.budget_max}
                onChange={(e) => setField("budget_max", e.target.value)}
                className="flex-1 border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
              />
            </div>
          </Field>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-[52px] px-8 bg-ink text-ink-inverse font-medium hover:bg-black transition"
            >
              다음 →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-8">
          <h2 className="font-[family-name:var(--font-serif)] text-[28px] text-ink">
            2. 어떤 맥락인가요?
          </h2>
          <Field label="경험의 맥락">
            <div className="grid grid-cols-2 gap-3">
              {OCCASIONS.map((o) => {
                const selected = form.occasion === o.code;
                return (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => setField("occasion", o.code)}
                    className={`h-[52px] border transition ${
                      selected
                        ? "border-ink bg-ink text-ink-inverse"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="caption text-ink-muted hover:text-ink transition"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-[52px] px-8 bg-ink text-ink-inverse font-medium hover:bg-black transition"
            >
              다음 →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-8">
          <h2 className="font-[family-name:var(--font-serif)] text-[28px] text-ink">
            3. 자유롭게 들려주세요.
          </h2>
          <Field label="꿈꾸는 하루를 자유롭게 서술해주세요">
            <textarea
              rows={7}
              value={form.free_text}
              onChange={(e) => setField("free_text", e.target.value)}
              placeholder="어떤 순간을 그리고 계신지, 피하고 싶은 것이 있는지, 참고 이미지·레퍼런스 등"
              className="w-full border border-line p-4 bg-transparent focus:outline-none focus:border-ink leading-[1.7]"
            />
          </Field>

          <div className="border-t border-line pt-8">
            <p className="caption text-ink-muted mb-6">CONTACT · GUEST FRIENDLY</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="성함 *">
                <input
                  required
                  value={form.guest_name}
                  onChange={(e) => setField("guest_name", e.target.value)}
                  className="w-full border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
                />
              </Field>
              <Field label="전화">
                <input
                  type="tel"
                  value={form.guest_phone}
                  onChange={(e) => setField("guest_phone", e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
                />
              </Field>
              <Field label="이메일">
                <input
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => setField("guest_email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-b border-line py-3 bg-transparent focus:outline-none focus:border-ink"
                />
              </Field>
            </div>
            <p className="caption text-ink-muted mt-4">
              * 전화 또는 이메일 중 하나는 필수입니다.
            </p>
          </div>

          {error && (
            <p className="caption text-[color:var(--color-error)]">{error}</p>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="caption text-ink-muted hover:text-ink transition"
            >
              ← 이전
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-[52px] px-10 bg-ink text-ink-inverse font-medium hover:bg-black transition disabled:opacity-50"
            >
              {submitting ? "전송 중..." : "큐레이션 요청하기"}
            </button>
          </div>
        </section>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="caption text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

export default function RequestCurationPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px] min-h-screen flex flex-col">
        <Suspense fallback={<div className="py-24 text-center text-ink-muted">Loading...</div>}>
          <FormInner />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
