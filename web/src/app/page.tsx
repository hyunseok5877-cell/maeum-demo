import Link from "next/link";
import { getFeaturedExperiences, getCountries } from "@/lib/api";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 60;

export default async function Home() {
  const [featured, countries] = await Promise.all([getFeaturedExperiences(), getCountries()]);

  return (
    <>
      <SiteHeader variant="overlay" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-screen w-full overflow-hidden bg-obsidian">
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/30 to-obsidian/70" />
          <div className="relative z-10 flex min-h-screen flex-col justify-end px-8 md:px-16 pb-24 md:pb-32">
            <p className="caption text-ink-inverse/80 mb-6">
              BY MAEUM · CURATED EXPERIENCES
            </p>
            <h1
              className="font-[family-name:var(--font-serif)] text-ink-inverse"
              style={{ fontSize: "clamp(48px, 7vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              꿈꾸던 하루를
              <br />
              설계합니다.
            </h1>
            <p className="mt-8 max-w-xl text-ink-inverse/85 text-[18px] leading-[1.6]">
              당신의 마음이 향하는 단 한 번의 경험.
              <br />
              슈퍼카 · 요트 · 프라이빗 외승.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                href="/experiences"
                className="h-[52px] px-8 inline-flex items-center justify-center bg-ink-inverse text-ink font-medium transition hover:bg-white"
              >
                경험 둘러보기
              </Link>
              <Link
                href="/request-curation"
                className="h-[52px] px-8 inline-flex items-center justify-center border border-ink-inverse/30 text-ink-inverse font-medium transition hover:bg-white/10"
              >
                나만의 하루 설계 받기
              </Link>
            </div>
          </div>
        </section>

        {/* Emotional Statement */}
        <section className="py-[120px] px-8 md:px-16">
          <p
            className="font-[family-name:var(--font-serif)] max-w-4xl mx-auto text-center text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.12, letterSpacing: "-0.01em" }}
          >
            모든 경험은
            <br />
            하나의 감정에서 시작됩니다.
          </p>
        </section>

        {/* Countries */}
        <section className="py-[120px] px-8 md:px-16 border-t border-line bg-muted-bg/40">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <p className="caption text-ink-muted mb-4">BY COUNTRY · WORLDWIDE</p>
              <h2
                className="font-[family-name:var(--font-serif)] text-ink"
                style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
              >
                국가를 먼저 고르세요.
              </h2>
              <p className="mt-6 max-w-2xl text-[16px] text-ink-muted leading-[1.6]">
                마음은 한국에서 시작해 전 세계로 확장됩니다.
                지금은 대한민국만 열려 있습니다.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {countries.map((c) => {
                const content = (
                  <div
                    className={`flex flex-col items-center justify-center aspect-[3/4] border transition ${
                      c.is_active
                        ? "border-ink bg-surface hover:bg-ink hover:text-ink-inverse cursor-pointer"
                        : "border-line bg-transparent text-ink-muted/60 cursor-not-allowed"
                    }`}
                  >
                    <span
                      className="font-[family-name:var(--font-serif)]"
                      style={{ fontSize: "40px", letterSpacing: "-0.02em" }}
                    >
                      {c.name_ko}
                    </span>
                    <span className="caption mt-3 opacity-70">{c.code}</span>
                    <span className={`caption mt-6 ${c.is_active ? "" : "opacity-50"}`}>
                      {c.is_active ? "OPEN" : "COMING SOON"}
                    </span>
                  </div>
                );
                return c.is_active ? (
                  <Link key={c.code} href="/regions" aria-label={c.name_ko}>
                    {content}
                  </Link>
                ) : (
                  <div key={c.code} aria-label={c.name_ko}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="py-[120px] px-8 md:px-16 border-t border-line">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <p className="caption text-ink-muted mb-4">THIS WEEK · CURATED</p>
                <h2
                  className="font-[family-name:var(--font-serif)] text-ink"
                  style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
                >
                  이 주의 큐레이션
                </h2>
              </div>
              <Link href="/experiences" className="caption text-ink hover:opacity-70 transition">
                전체 보기 →
              </Link>
            </div>
            {featured.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-ink-muted">현재 공개된 경험이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
