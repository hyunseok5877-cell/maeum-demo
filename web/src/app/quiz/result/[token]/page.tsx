import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExperienceCard } from "@/components/ExperienceCard";
import type { ExperienceCard as ExperienceCardData } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export const dynamicParams = false;
export async function generateStaticParams() {
  // 데모 모드: 결과 페이지를 사전생성하지 않음 — 클라이언트가 라우트 직접 진입 못 함
  return [{ token: "demo" }];
}

interface QuizResult {
  session_token: string;
  completed_at: string;
  result_type: {
    code: string;
    name_ko: string;
    name_en: string;
    description: string;
    image_url: string;
  } | null;
  recommended_experiences: ExperienceCardData[];
}

async function fetchResult(token: string): Promise<QuizResult | null> {
  if (IS_DEMO) {
    return {
      session_token: token,
      completed_at: new Date().toISOString(),
      result_type: {
        code: "DEMO",
        name_ko: "데모 결과",
        name_en: "Demo",
        description: "데모 빌드에서는 실제 결과가 계산되지 않습니다. 풀 백엔드 환경에서 정확한 성향이 표시됩니다.",
        image_url: "",
      },
      recommended_experiences: [],
    };
  }
  try {
    const res = await fetch(`${API_BASE}/curation/quiz/result/${token}/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await fetchResult(token);
  if (!result) notFound();

  const type = result.result_type;
  const recs = result.recommended_experiences ?? [];

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px]">
        {/* Type banner */}
        <section className="bg-obsidian text-ink-inverse py-[120px] px-8 md:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="caption text-ink-inverse/60 mb-6">YOUR TYPE</p>
            {type ? (
              <>
                <h1
                  className="font-[family-name:var(--font-serif)] mb-4"
                  style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
                >
                  {type.name_ko}
                </h1>
                <p className="caption text-ink-inverse/70 mb-10">{type.name_en}</p>
                <p className="text-[18px] leading-[1.8] text-ink-inverse/85 max-w-2xl mx-auto">
                  {type.description}
                </p>
              </>
            ) : (
              <h1 className="font-[family-name:var(--font-serif)] text-4xl">유형을 판정하지 못했습니다.</h1>
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section className="py-[120px] px-8 md:px-16 border-b border-line">
          <div className="max-w-7xl mx-auto">
            <p className="caption text-ink-muted mb-4">FOR YOU</p>
            <h2
              className="font-[family-name:var(--font-serif)] text-ink mb-16"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.12, letterSpacing: "-0.01em" }}
            >
              이 유형에게 어울리는 경험
            </h2>
            {recs.length === 0 ? (
              <p className="text-ink-muted">추천 경험이 아직 준비되지 않았습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recs.map((e) => (
                  <ExperienceCard key={e.id} exp={e} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-[120px] px-8 md:px-16 text-center">
          <p
            className="font-[family-name:var(--font-serif)] text-ink mb-10 max-w-3xl mx-auto"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            이 유형에 맞춘
            <br />
            단 한 번의 하루를 설계해드릴까요?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/request-curation?type=${type?.code ?? ""}`}
              className="h-[60px] px-12 inline-flex items-center justify-center bg-ink text-ink-inverse font-medium hover:bg-black transition"
            >
              맞춤 큐레이션 받기
            </Link>
            <Link
              href="/quiz"
              className="h-[60px] px-12 inline-flex items-center justify-center border border-line text-ink hover:bg-muted-bg transition"
            >
              다시 해보기
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
