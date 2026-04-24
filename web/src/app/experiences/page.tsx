import Link from "next/link";
import { getAllExperiences, getCategories } from "@/lib/api";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 60;

export const metadata = {
  title: "경험 · 마음 (Maeum)",
  description: "슈퍼카 · 요트 · 프라이빗 외승 — 전 지역 큐레이션 경험",
};

export default async function ExperiencesIndex({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [experiences, categories] = await Promise.all([
    getAllExperiences({ region: params.region, category: params.category }),
    getCategories(),
  ]);

  const activeCategory = params.category ?? "";
  const regionFilter = params.region ?? "";

  function chipHref(code?: string) {
    const qs = new URLSearchParams();
    if (regionFilter) qs.set("region", regionFilter);
    if (code) qs.set("category", code);
    const s = qs.toString();
    return s ? `/experiences?${s}` : "/experiences";
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px]">
        <section className="pt-24 pb-16 px-8 md:px-16 border-b border-line">
          <div className="max-w-7xl mx-auto">
            <p className="caption text-ink-muted mb-4">EXPERIENCES · CURATED</p>
            <h1
              className="font-[family-name:var(--font-serif)] text-ink"
              style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              꿈꾸던 하루를
              <br />
              골라주세요.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] text-ink-muted leading-[1.6]">
              모든 경험은 큐레이터의 손을 거쳐 소개됩니다.
              한 번에 한 순간만 제공하기에, 예약은 조용히 이뤄집니다.
            </p>

            {/* 카테고리 탭 */}
            <div className="mt-14 flex flex-wrap gap-3">
              <Link
                href={chipHref()}
                className={`px-6 h-[44px] inline-flex items-center border transition ${
                  !activeCategory
                    ? "bg-ink text-ink-inverse border-ink"
                    : "border-line text-ink hover:border-ink"
                }`}
              >
                전체
              </Link>
              {categories.map((c) => {
                const selected = activeCategory === c.code;
                return (
                  <Link
                    key={c.id}
                    href={chipHref(c.code)}
                    className={`px-6 h-[44px] inline-flex items-center border transition ${
                      selected
                        ? "bg-ink text-ink-inverse border-ink"
                        : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {c.name_ko}
                  </Link>
                );
              })}
            </div>

            {regionFilter && (
              <div className="mt-6 flex items-center gap-4">
                <span className="caption text-ink-muted">REGION</span>
                <span className="px-3 py-1 bg-muted-bg caption">{regionFilter.toUpperCase()}</span>
                <Link href={chipHref(activeCategory)} className="caption text-ink-muted hover:text-ink">
                  지역 해제 ×
                </Link>
              </div>
            )}
          </div>
        </section>

        {experiences.length === 0 ? (
          <section className="py-[120px] px-8 text-center">
            <p className="text-ink-muted">현재 조건에 맞는 경험이 없습니다.</p>
            <Link href="/experiences" className="caption text-ink underline mt-4 inline-block">
              필터 해제
            </Link>
          </section>
        ) : (
          <section className="py-[96px] px-8 md:px-16">
            <div className="max-w-7xl mx-auto">
              <p className="caption text-ink-muted mb-10">
                {experiences.length} EXPERIENCES
                {activeCategory && ` · ${categories.find((c) => c.code === activeCategory)?.name_ko ?? ""}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
