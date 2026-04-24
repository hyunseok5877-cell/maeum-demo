import Link from "next/link";
import Image from "next/image";

export function SiteHeader({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const linkTone = variant === "overlay" ? "text-ink-inverse" : "text-ink";
  const headerBg = variant === "overlay" ? "" : "bg-bg border-b border-line";
  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center justify-between px-8 md:px-12 ${headerBg}`}>
      <Link href="/" aria-label="마음" className="flex items-center">
        <Image src="/logo.png" alt="마음" width={44} height={44} priority />
      </Link>
      <nav className="hidden md:flex items-center gap-10">
        <Link href="/experiences" className={`caption ${linkTone} opacity-80 hover:opacity-100 transition`}>
          Experiences
        </Link>
        <Link href="/regions" className={`caption ${linkTone} opacity-80 hover:opacity-100 transition`}>
          Regions
        </Link>
        <Link href="/stories" className={`caption ${linkTone} opacity-80 hover:opacity-100 transition`}>
          Stories
        </Link>
      </nav>
    </header>
  );
}
