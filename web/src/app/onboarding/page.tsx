import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntakeForm } from "@/components/IntakeForm";

export const metadata = {
  title: "프로필 설문 · 마음 (Maeum)",
  description:
    "큐레이터가 당신에게 가장 가까운 경험을 설계할 수 있도록, 약간의 정보를 부탁드립니다.",
};

export default function OnboardingPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-16 pb-[120px]">
          <div className="intake-wrapper">
            <div className="text-center mb-10">
              <p className="caption text-brass">— Profil confidentiel</p>
              <h1
                className="mt-5 font-[family-name:var(--font-display)] text-ink"
                style={{
                  fontSize: "clamp(30px, 4.5vw, 52px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                당신을 조금 더
                <br />
                알고 싶습니다.
              </h1>
              <p className="mt-6 text-[15px] leading-[1.75] text-ink-muted max-w-[520px] mx-auto">
                답변하신 내용은 오직 담당 큐레이터만 열람합니다.
                민감하다고 느껴지는 항목은 언제든{" "}
                <em className="not-italic text-brass">&ldquo;공개하지 않음&rdquo;</em>
                을 선택하실 수 있습니다.
              </p>
            </div>

            <IntakeForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
