import Link from "next/link";
import Image from "next/image";

export function SiteHeader({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const linkTone = variant === "overlay" ? "text-ink-inverse" : "text-ink";
  const headerBg =
    variant === "overlay" ? "" : "bg-bg/90 backdrop-blur-md border-b border-line";
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-[88px] flex items-center justify-between px-8 md:px-16 ${headerBg}`}
    >
      <Link href="/" aria-label="마음" className="flex items-center gap-3">
        <Image src="/logo.png" alt="마음" width={40} height={40} priority />
        <span
          className={`hidden md:inline font-[family-name:var(--font-playfair)] italic text-[20px] tracking-[0.02em] ${linkTone}`}
        >
          Maeum
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-12">
        <Link
          href="/experiences"
          className={`caption ${linkTone} opacity-80 hover:text-brass hover:opacity-100 transition`}
        >
          Experiences
        </Link>
        <Link
          href="/regions"
          className={`caption ${linkTone} opacity-80 hover:text-brass hover:opacity-100 transition`}
        >
          Territoire
        </Link>
        <Link
          href="/quiz"
          className={`caption ${linkTone} opacity-80 hover:text-brass hover:opacity-100 transition`}
        >
          Sentiment
        </Link>
        <Link
          href="/request-curation"
          className={`caption ${linkTone} opacity-80 hover:text-brass hover:opacity-100 transition`}
        >
          Curation
        </Link>
      </nav>
    </header>
  );
}
