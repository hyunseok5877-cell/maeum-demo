import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-[72px] flex items-center justify-between px-8 md:px-12">
        <Link href="/" aria-label="마음" className="flex items-center">
          <Image
            src="/logo.png"
            alt="마음"
            width={44}
            height={44}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <span className="caption text-ink-inverse opacity-80 hover:opacity-100 transition">
            Experiences
          </span>
          <span className="caption text-ink-inverse opacity-80 hover:opacity-100 transition">
            Regions
          </span>
          <span className="caption text-ink-inverse opacity-80 hover:opacity-100 transition">
            Stories
          </span>
        </nav>
      </header>

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
              style={{
                fontSize: "clamp(48px, 7vw, 72px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
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
              <button
                type="button"
                className="h-[52px] px-8 bg-ink-inverse text-ink font-medium transition hover:bg-white"
              >
                경험 둘러보기
              </button>
              <button
                type="button"
                className="h-[52px] px-8 border border-ink-inverse/30 text-ink-inverse font-medium transition hover:bg-white/10"
              >
                나만의 하루 설계 받기
              </button>
            </div>
          </div>
        </section>

        {/* Emotional Statement */}
        <section className="py-[120px] px-8 md:px-16">
          <p
            className="font-[family-name:var(--font-serif)] max-w-4xl mx-auto text-center text-ink"
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
            }}
          >
            모든 경험은
            <br />
            하나의 감정에서 시작됩니다.
          </p>
        </section>

        {/* API Health indicator (dev only) */}
        <section className="py-8 px-8 md:px-16 border-t border-line">
          <p className="caption">
            <span className="text-ink-muted">DEV · API</span>{" "}
            <a
              href="http://localhost:8000/api/health/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              localhost:8000/api/health
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-line py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="caption text-ink-muted mb-2">MAEUM</p>
            <p className="text-[14px] text-ink-muted max-w-md">
              당사는 통신판매 중개자로, 경험 계약의 당사자는 제휴 공급사입니다.
              상품 정보와 거래에 관한 의무와 책임은 판매자에게 있습니다.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[14px] text-ink-muted">
            <span>© 2026 MAEUM</span>
            <span>Private Beta</span>
          </div>
        </div>
      </footer>
    </>
  );
}
