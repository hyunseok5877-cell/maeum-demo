import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "고객센터 · 마음 (Maeum)",
};

const FAQS = [
  {
    q: "예약 후 취소·변경은 어떻게 하나요?",
    a: "마이페이지 > 예약 내역에서 해당 예약 상세로 이동 후 취소·변경을 요청하실 수 있습니다. 경험 시작 7일 전 100%, 3일 전 50%, 24시간 전 환불 불가 등 경험별 정책이 다릅니다.",
  },
  {
    q: "큐레이터에게 직접 문의할 수 있나요?",
    a: "회원 가입 후 [큐레이션 의뢰하기]에서 일정·예산·동행 정보를 입력해 주시면 24시간 내에 담당 큐레이터가 직접 연락드립니다.",
  },
  {
    q: "결제는 어떤 방식이 가능한가요?",
    a: "TossPayments 카드 결제(국내 모든 카드사) 및 계좌 이체가 가능합니다. 일부 프리미엄 경험은 계약금 30% + 잔금 분납 방식으로 진행됩니다.",
  },
  {
    q: "마음의 모든 경험이 \"여행 상품\"인가요?",
    a: "아닙니다. 마음은 통신판매중개업으로 등록된 큐레이션 플랫폼이며 여행업이 아닙니다. 숙박·항공 결합 상품은 취급하지 않으며, 모든 경험은 단일 체험·세션·프로그램입니다.",
  },
  {
    q: "회원 등급은 어떻게 올라가나요?",
    a: "마음을 통한 경험 횟수에 따라 자동으로 변동합니다. Invité(0회) → Découvreur(1회+) → Initié(3회+) → Connaisseur(10회+) 순입니다. Phase 2(2026 하반기)에 Gold·Black 멤버십이 도입될 예정입니다.",
  },
];

export default function SupportPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="flex-1 bg-bg pt-[72px]">
        <section className="px-6 md:px-12 pt-12 pb-24 max-w-[960px] mx-auto">
          <p className="caption text-brass">— Assistance</p>
          <h1
            className="mt-4 font-[family-name:var(--font-display)] text-ink"
            style={{
              fontSize: "clamp(36px, 4.5vw, 60px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            고객센터.
          </h1>
          <p className="mt-4 text-ink-muted text-[15px] leading-[1.7] max-w-2xl">
            마음 회원이라면 누구나 24시간 내 답변을 보장합니다. FAQ에서 답을 찾지
            못하셨다면 아래 채널로 직접 문의해 주세요.
          </p>

          {/* 연락 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-12">
            <a
              href="mailto:hello@maeum.local"
              className="p-6 border border-line rounded-[16px] hover:border-ink transition"
            >
              <p className="caption text-ink-muted">Email</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
                hello@maeum.local
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                평일·주말 24시간 내 답변
              </p>
            </a>
            <a
              href="tel:+82-2-0000-0000"
              className="p-6 border border-line rounded-[16px] hover:border-ink transition"
            >
              <p className="caption text-ink-muted">Téléphone</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
                02-0000-0000
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                평일 10:00 – 19:00 (KST)
              </p>
            </a>
            <Link
              href="/request-curation"
              className="p-6 border border-line rounded-[16px] hover:border-ink transition"
            >
              <p className="caption text-ink-muted">Curation</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
                큐레이션 의뢰
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                전담 큐레이터 1:1 응대
              </p>
            </Link>
          </div>

          {/* FAQ */}
          <section className="mt-16">
            <p className="caption text-brass">— FAQ</p>
            <h2
              className="mt-3 font-[family-name:var(--font-display)] text-ink"
              style={{ fontSize: "clamp(22px, 2.6vw, 32px)" }}
            >
              자주 묻는 질문
            </h2>
            <div className="mt-6 divide-y divide-line border-t border-b border-line">
              {FAQS.map((f, i) => (
                <details key={i} className="group py-5 px-1">
                  <summary className="cursor-pointer flex items-center justify-between text-ink list-none">
                    <span className="text-[15px] font-medium">{f.q}</span>
                    <span className="caption text-ink-muted group-open:rotate-180 transition">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-[14px] text-ink-muted leading-[1.8]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-12 caption text-ink-muted">
            마음은 통신판매중개업자로서 거래 당사자 간 분쟁에 직접 책임지지
            않으며, 결제 대행·고객 보호 정책에 따라 중재합니다.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
