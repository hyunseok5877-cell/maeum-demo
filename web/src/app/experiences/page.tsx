import Link from "next/link";
import {
  getAllExperiences,
  getCategories,
  getFeaturedExperiences,
  getPopularExperiences,
  getNewArrivalExperiences,
} from "@/lib/api";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExperienceSearchBar } from "@/components/ExperienceSearchBar";
import { CyberExperienceStrip } from "@/components/CyberExperienceStrip";
import { Suspense } from "react";

export const revalidate = 60;

export const metadata = {
  title: "경험 · 마음 (Maeum)",
  description: "슈퍼카 · 요트 · 프라이빗 외승 — 전 지역 큐레이션 경험",
};

export default async function ExperiencesIndex() {
  // 각 풀(추천/인기/신상)은 백엔드에서 독립적으로 관리. 콘솔에서 따로따로 토글 가능.
  const [all, categories, maeumPick, monthlyHot, newArrivals] = await Promise.all([
    getAllExperiences(),
    getCategories(),
    getFeaturedExperiences(),
    getPopularExperiences(),
    getNewArrivalExperiences(),
  ]);

  const activeCategory: string = "";
  const regionFilter: string = "";
  const filtered: string = "";

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px] bg-bg">
        {/* 상단: 검색바 + 카테고리 칩 */}
        <section className="pt-14 pb-12 px-6 md:px-12 bg-bg border-b border-line">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <p className="caption text-ink-muted">EXPERIENCES · CURATED</p>
              <h1
                className="mt-5 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(28px, 4.5vw, 56px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                새로운 경험을 떠날 준비가 되셨나요?
              </h1>
            </div>

            <Suspense fallback={<div className="h-[80px]" />}>
              <ExperienceSearchBar />
            </Suspense>

            {(activeCategory || regionFilter) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {activeCategory && (
                  <span className="px-3 py-1 caption bg-white border border-line">
                    {categories.find((c) => c.code === activeCategory)
                      ?.name_ko ?? activeCategory.toUpperCase()}
                  </span>
                )}
                {regionFilter && (
                  <span className="px-3 py-1 caption bg-white border border-line">
                    {regionFilter.toUpperCase()}
                  </span>
                )}
                <Link
                  href="/experiences"
                  className="caption hover:text-brass transition"
                >
                  필터 해제 ×
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 검색바 바로 아래 — 사이버·게이밍 스트립 */}
        {!filtered && all.length > 0 && (
          <CyberExperienceStrip items={all.slice(0, 18)} />
        )}

        {filtered ? (
          <section className="py-[72px] px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
              <p className="caption text-ink-muted mb-10">
                {all.length} EXPERIENCES
                {activeCategory &&
                  ` · ${
                    categories.find((c) => c.code === activeCategory)?.name_ko ??
                    ""
                  }`}
              </p>
              {all.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-ink-muted">
                    현재 조건에 맞는 경험이 없습니다.
                  </p>
                  <Link
                    href="/experiences"
                    className="caption text-ink underline mt-4 inline-block"
                  >
                    필터 해제
                  </Link>
                </div>
              ) : (
                <div className="cat-grid">
                  {all.map((exp) => (
                    <ExperienceCard key={exp.id} exp={exp} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <CategoryRail
              tag="Maeum Recommended"
              title="마음 추천"
              subtitle="큐레이터가 직접 고른 이달의 시그니처."
              items={maeumPick}
            />
            <CategoryRail
              tag="Monthly Popular"
              title="월간 인기"
              subtitle="이번 달 가장 많이 예약된 경험."
              items={monthlyHot}
            />
            <CategoryRail
              tag="New Curators"
              title="신규 큐레이터"
              subtitle="최근 합류한 큐레이터의 첫 제안."
              items={newArrivals}
            />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function CategoryRail({
  tag,
  title,
  subtitle,
  items,
}: {
  tag: string;
  title: string;
  subtitle: string;
  items: Awaited<ReturnType<typeof getAllExperiences>>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="py-[72px] px-6 md:px-12 bg-white border-t border-line">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="caption text-brass">{tag}</p>
            <h2
              className="mt-3 font-[family-name:var(--font-display)] text-ink"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>
            <p className="mt-3 text-[15px] text-ink-muted">{subtitle}</p>
          </div>
          <Link
            href="/experiences"
            className="caption self-start md:self-end text-ink hover:text-brass transition"
          >
            일정 전체보기 →
          </Link>
        </div>
        <div className="cat-rail">
          {items.map((exp) => (
            <ExperienceCard key={exp.id} exp={exp} />
          ))}
        </div>
      </div>
    </section>
  );
}
