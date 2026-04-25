import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BookingsClient } from "./BookingsClient";

export const metadata = {
  title: "예약 내역 · 마음 (Maeum)",
};

export default function BookingsPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-12 pb-24 max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="caption text-brass">— Réservations</p>
              <h1
                className="mt-4 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(36px, 4.5vw, 60px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                예약 내역.
              </h1>
            </div>
            <Link href="/my" className="caption text-ink-muted hover:text-brass">
              ← 마이페이지
            </Link>
          </div>
          <BookingsClient />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
