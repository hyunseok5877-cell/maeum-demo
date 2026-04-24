import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { InfiniteLoopHero } from "@/components/InfiniteLoopHero";

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <SiteHeader variant="overlay" />

      <main className="flex-1">
        <InfiniteLoopHero />
      </main>

      <SiteFooter />
    </>
  );
}
