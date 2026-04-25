import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MyProfileClient } from "@/components/MyProfileClient";

export const metadata = {
  title: "나의 마음 · Maeum",
};

export default function MyPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-12 pb-24">
          <div className="my-wrap">
            <MyProfileClient />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
