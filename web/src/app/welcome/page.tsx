import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NicknameForm } from "@/components/NicknameForm";

export const metadata = {
  title: "닉네임 설정 · 마음 (Maeum)",
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-[480px]">
            <div className="text-center mb-10">
              <p className="caption text-brass">— Bienvenue</p>
              <h1
                className="mt-5 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(30px, 4vw, 48px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                어떻게 불러드릴까요?
              </h1>
              <p className="mt-6 text-[15px] leading-[1.75] text-ink-muted">
                담당 큐레이터와 메시지를 주고받을 때, 그리고
                <br />
                다른 회원의 시선에도 보여질 이름입니다.
              </p>
            </div>
            <NicknameForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
