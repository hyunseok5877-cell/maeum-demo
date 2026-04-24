import Link from "next/link";
import { getRegions, getAllExperiences } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 60;

export const metadata = {
  title: "지역 · 마음 (Maeum)",
  description: "지도 기반 지역 탐색 — 한국 전역의 큐레이션 경험",
};

export default async function RegionsPage() {
  const [regions, experiences] = await Promise.all([getRegions(), getAllExperiences()]);

  // 지역별 경험 개수
  const countByRegion = experiences.reduce<Record<string, number>>((acc, e) => {
    acc[e.region.code] = (acc[e.region.code] ?? 0) + 1;
    return acc;
  }, {});

  const activeRegions = regions.filter((r) => countByRegion[r.code] && countByRegion[r.code] > 0);
  const comingSoonRegions = regions.filter((r) => !countByRegion[r.code]);

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 pt-[72px]">
        <section className="pt-24 pb-16 px-8 md:px-16 border-b border-line">
          <div className="max-w-7xl mx-auto">
            <p className="caption text-ink-muted mb-4">REGIONS · KOREA</p>
            <h1
              className="font-[family-name:var(--font-serif)] text-ink"
              style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              어디에서
              <br />
              머물고 싶으신가요.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] text-ink-muted leading-[1.6]">
              지역마다 공급 가능한 경험이 다릅니다.
              당신의 하루가 닿을 장소를 먼저 고르세요.
            </p>
          </div>
        </section>

        {/* Interactive regions */}
        <section className="py-[96px] px-8 md:px-16 border-b border-line">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <h2
                className="font-[family-name:var(--font-serif)] text-ink"
                style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.12 }}
              >
                운영 중
              </h2>
              <span className="caption text-ink-muted">
                {activeRegions.length} ACTIVE REGIONS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeRegions.map((r) => (
                <Link
                  key={r.id}
                  href={`/experiences?region=${r.code}`}
                  className="group flex flex-col border border-line hover:border-ink transition bg-surface"
                >
                  <div className="aspect-[4/3] bg-muted-bg flex items-center justify-center">
                    <span
                      className="font-[family-name:var(--font-serif)] text-ink-muted/40 group-hover:text-ink/60 transition"
                      style={{ fontSize: "clamp(64px, 9vw, 120px)", letterSpacing: "-0.03em" }}
                    >
                      {r.name_ko}
                    </span>
                  </div>
                  <div className="p-6 flex justify-between items-end">
                    <div>
                      <p className="caption text-ink-muted mb-2">
                        {r.country.name_ko} · {r.code.toUpperCase()}
                      </p>
                      <h3
                        className="font-[family-name:var(--font-serif)] text-ink"
                        style={{ fontSize: "28px", letterSpacing: "-0.01em" }}
                      >
                        {r.name_ko}
                      </h3>
                    </div>
                    <span className="caption text-ink-muted">
                      {countByRegion[r.code]} 경험
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Coming soon regions */}
        {comingSoonRegions.length > 0 && (
          <section className="py-[96px] px-8 md:px-16 border-b border-line">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <h2
                  className="font-[family-name:var(--font-serif)] text-ink"
                  style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.12 }}
                >
                  곧 만날 곳
                </h2>
                <span className="caption text-ink-muted">
                  {comingSoonRegions.length} REGIONS · COMING SOON
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {comingSoonRegions.map((r) => (
                  <span
                    key={r.id}
                    className="px-6 py-3 border border-line text-ink-muted caption"
                  >
                    {r.name_ko} · COMING SOON
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-[120px] px-8 md:px-16 text-center">
          <p
            className="font-[family-name:var(--font-serif)] text-ink mb-10 max-w-3xl mx-auto"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            원하시는 지역이 없나요?
          </p>
          <Link
            href="/request-curation"
            className="h-[60px] px-12 inline-flex items-center bg-ink text-ink-inverse font-medium hover:bg-black transition"
          >
            큐레이션 요청하기
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
