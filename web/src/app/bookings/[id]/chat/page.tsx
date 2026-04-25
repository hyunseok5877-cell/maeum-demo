import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatRoomClient } from "./ChatRoomClient";

export const metadata = {
  title: "채팅 · 마음 (Maeum)",
};

// Demo: 정적 export 시 placeholder route만 생성. 실제 id는 클라이언트에서 동적 처리.
export const dynamicParams = false;
export async function generateStaticParams() {
  return [{ id: "demo" }];
}

export default async function BookingChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-12 pb-16 max-w-[920px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="caption text-brass">— Conversation</p>
              <h1
                className="mt-3 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                }}
              >
                채팅방.
              </h1>
            </div>
            <Link
              href="/bookings"
              className="caption text-ink-muted hover:text-brass"
            >
              ← 예약 내역
            </Link>
          </div>
          <Suspense fallback={<p className="text-ink-muted py-12 text-center">불러오는 중…</p>}>
            <ChatRoomClient bookingId={Number(id)} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
