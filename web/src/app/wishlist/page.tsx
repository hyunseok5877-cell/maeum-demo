import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WishlistClient } from "./WishlistClient";

export const metadata = {
  title: "위시리스트 · 마음 (Maeum)",
};

export default function WishlistPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-12 pb-24 max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="caption text-brass">— Favoris</p>
              <h1
                className="mt-4 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(36px, 4.5vw, 60px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                위시리스트.
              </h1>
              <p className="mt-3 text-[14px] text-ink-muted">
                담아둔 경험들을 모아 한 번에 큐레이터에게 의뢰하실 수 있습니다.
              </p>
            </div>
            <Link href="/my" className="caption text-ink-muted hover:text-brass">
              ← 마이페이지
            </Link>
          </div>
          <WishlistClient />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
