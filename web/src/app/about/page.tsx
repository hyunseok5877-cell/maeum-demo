import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "About · 마음 (Maeum)",
  description:
    "마음을 만든 사람 · Peter Lee. 경험이 무엇인지 오랜 시간 고민한 이야기.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        {/* Intro */}
        <section className="py-[72px] md:py-[160px] px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            {/* 좌: 프로필 사진 자리 */}
            <div className="md:col-span-5">
              <div className="sticky top-[120px]">
                <div className="relative aspect-[4/5] border border-line overflow-hidden">
                  <Image
                    src="/peter-profile.jpg"
                    alt="Peter Lee — Founder, Maeum"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-6 caption text-ink-muted">
                  Peter Lee · Founder & Curator
                </p>
              </div>
            </div>

            {/* 우: 인사·소개 */}
            <div className="md:col-span-7">
              <p className="caption text-brass mb-8">— Lettre de l&apos;éditeur</p>
              <h1
                className="font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(36px, 5.5vw, 72px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                안녕하세요,
                <br />
                <em className="italic font-normal text-brass">Peter Lee</em>입니다.
              </h1>

              <div className="mt-12 space-y-8 text-[18px] leading-[1.85] text-ink">
                <p>
                  오랜 시간 동안 저는 하나의 질문을 붙잡고 있었습니다.
                  &ldquo;경험이란 무엇인가?&rdquo;
                </p>

                <p>
                  좋은 장소, 좋은 차, 좋은 사람이 모인다고 해서
                  자동으로 좋은 경험이 되지는 않는다는 걸 알게 됐습니다.
                  경험은 장면과 장면 사이의 간격에서, 예상하지 못했던 순간에서,
                  그리고 그 하루를 설계한 사람의 태도에서 완성됩니다.
                </p>

                <p>
                  저는 AI 자동화 에이전시를 운영하며 수많은 비효율을 걷어내는
                  일을 해왔습니다. 그 과정에서 역설적으로 배운 것은
                  &mdash; 사람에게 정말 남는 건 효율이 아니라
                  &lsquo;머문 기억&rsquo;이라는 사실이었습니다.
                </p>

                <p>
                  마음(Maeum)은 그 머문 기억을 설계하는 공간입니다.
                  슈퍼카 한 대, 요트 한 척, 승마 한 시간이 아니라,
                  당신이 누구와, 어떤 계절에, 어떤 감정을 들고 그 장면에
                  들어서는지를 먼저 묻습니다.
                </p>

                <p>
                  저는 약속합니다. 마음을 거쳐 간 하루는
                  당신이 오래 지나서도 다시 꺼내 볼 수 있는 장면이 될 것이라고.
                  <br />
                  <span className="text-ink-muted">
                    잊지 못할 경험을, 조용히 설계해 드립니다.
                  </span>
                </p>
              </div>

              {/* 서명 — 텍스트 왼쪽, 서명 오른쪽 */}
              <div className="mt-16 border-t border-line pt-10 flex items-center justify-between flex-wrap gap-8">
                <div>
                  <p
                    className="font-[family-name:var(--font-display)] italic text-[26px] text-ink"
                    style={{ letterSpacing: "0.01em" }}
                  >
                    Peter Lee
                  </p>
                  <p className="mt-2 caption text-ink-muted">
                    Founder · Maeum — Curated Experiences
                  </p>
                </div>

                {/* 필기체 서명 — Allura (Google Fonts) 기반, 살짝 기울임 + 밑줄 flourish */}
                <div
                  aria-label="서명"
                  style={{
                    position: "relative",
                    transform: "rotate(-4deg)",
                    paddingBottom: "8px",
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-signature)]"
                    style={{
                      fontSize: "84px",
                      lineHeight: 1,
                      color: "#1A1A1A",
                      letterSpacing: "0.01em",
                      display: "inline-block",
                    }}
                  >
                    Peter Lee
                  </span>
                  {/* 우아한 밑줄 꼬리 */}
                  <svg
                    width="260"
                    height="20"
                    viewBox="0 0 260 20"
                    style={{
                      position: "absolute",
                      left: "4px",
                      bottom: "-6px",
                      color: "#1A1A1A",
                    }}
                    aria-hidden
                  >
                    <path
                      d="M 2 10 C 60 18, 150 16, 230 8 C 240 7, 248 5, 256 2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-14 flex flex-wrap gap-4">
                <Link
                  href="/request-curation"
                  className="inline-flex items-center justify-center h-[56px] px-10 bg-ink text-ink-inverse caption hover:bg-black transition"
                >
                  나만의 하루 설계 받기 →
                </Link>
                <Link
                  href="/experiences"
                  className="inline-flex items-center justify-center h-[56px] px-10 border border-line text-ink caption hover:border-ink transition"
                >
                  경험 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
