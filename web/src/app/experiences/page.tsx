import { getAllExperiences } from "@/lib/api";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 60;

export const metadata = {
  title: "경험 · 마음 (Maeum)",
  description: "슈퍼카 · 요트 · 프라이빗 외승 — 전 지역 큐레이션 경험",
};

export default async function ExperiencesIndex() {
  const experiences = await getAllExperiences();

  const byCategory = experiences.reduce<Record<string, typeof experiences>>((acc, e) => {
    const key = e.category.name_ko;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

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
          </div>
        </section>

        {experiences.length === 0 ? (
          <section className="py-[120px] px-8 text-center">
            <p className="text-ink-muted">현재 공개된 경험이 없습니다.</p>
          </section>
        ) : (
          Object.entries(byCategory).map(([category, items]) => (
            <section key={category} className="py-[96px] px-8 md:px-16 border-b border-line">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                  <h2
                    className="font-[family-name:var(--font-serif)] text-ink"
                    style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.12, letterSpacing: "-0.01em" }}
                  >
                    {category}
                  </h2>
                  <span className="caption text-ink-muted">{items.length} EXPERIENCES</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((exp) => (
                    <ExperienceCard key={exp.id} exp={exp} />
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </main>
      <SiteFooter />
    </>
  );
}
