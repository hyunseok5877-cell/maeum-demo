import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginPanel } from "@/components/LoginPanel";

export const metadata = {
  title: "로그인 · 마음 (Maeum)",
  description: "Google 또는 Naver 로 로그인하고 나만의 큐레이션을 받아보세요.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-[440px]">
            <div className="text-center mb-12">
              <p className="caption text-brass">— Adhésion</p>
              <h1
                className="mt-5 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(32px, 4.5vw, 52px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                마음에 오신 것을
                <br />
                환영합니다.
              </h1>
              <p className="mt-6 text-[15px] leading-[1.7] text-ink-muted">
                회원은 큐레이터가 직접 설계한 비공개 경험과
                시즌 시그니처에 먼저 초대됩니다.
              </p>
            </div>

            <LoginPanel />

            <p className="mt-10 text-[12px] leading-[1.7] text-ink-muted text-center">
              계속 진행하면{" "}
              <a className="underline underline-offset-2" href="#">
                이용약관
              </a>
              과{" "}
              <a className="underline underline-offset-2" href="#">
                개인정보 처리방침
              </a>
              에 동의하는 것으로 간주합니다.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
