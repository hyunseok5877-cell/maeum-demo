"use client";

import { useEffect, useState } from "react";

type LegalDoc = "terms" | "privacy" | "business" | null;

const DOCS: Record<
  Exclude<LegalDoc, null>,
  { label: string; title: string; body: React.ReactNode }
> = {
  terms: {
    label: "이용약관",
    title: "이용약관",
    body: (
      <>
        <p className="legal-meta">시행일: 2026년 4월 25일</p>

        <h3>제 1 조 (목적)</h3>
        <p>
          본 약관은 마음(이하 “회사”)이 제공하는 큐레이션 플랫폼 “마음(Maeum)” 및
          관련 부가 서비스(이하 “서비스”)의 이용 조건과 절차, 회사와 회원 간의
          권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>

        <h3>제 2 조 (용어의 정의)</h3>
        <ol>
          <li>“서비스”란 회사가 운영하는 프리미엄 경험(이하 “경험”) 통합 큐레이션 플랫폼을 의미합니다.</li>
          <li>“회원”이란 본 약관에 동의하고 회사가 정한 절차에 따라 가입한 자를 말합니다.</li>
          <li>“공급자”란 회사와 별도 계약을 체결하고 회원에게 경험을 제공하는 사업자를 말합니다.</li>
          <li>회사는 <strong>통신판매중개업자</strong>이며 경험 계약의 당사자가 아닙니다.</li>
        </ol>

        <h3>제 3 조 (서비스의 성격)</h3>
        <p>
          회사는 회원과 공급자 간의 경험 거래를 중개합니다. 경험의 품질·이행·환불·취소 등
          개별 거래 조건은 공급자가 정한 정책을 우선합니다. 회사는 결제 대행 및 분쟁
          중재의 범위 내에서 회원을 보호합니다.
        </p>

        <h3>제 4 조 (회원 가입)</h3>
        <ol>
          <li>회원 가입은 본 약관과 개인정보 수집·이용에 동의한 자가 회사가 정한 절차에 따라 신청함으로써 성립합니다.</li>
          <li>회사는 다음 각 호에 해당하는 신청에 대하여는 가입을 거절하거나 사후에 회원 자격을 상실시킬 수 있습니다.
            <ul>
              <li>타인의 정보를 도용한 경우</li>
              <li>허위 정보를 기재한 경우</li>
              <li>본 약관 위반 또는 부정 사용 이력이 있는 경우</li>
            </ul>
          </li>
        </ol>

        <h3>제 5 조 (예약·결제·취소)</h3>
        <ol>
          <li>회원은 서비스 내 절차에 따라 경험을 예약하고 결제할 수 있습니다.</li>
          <li>취소·환불 정책은 각 경험의 상세 페이지에 명시된 공급자 정책을 따릅니다.</li>
          <li>회사는 결제 대행사(TossPayments 등)를 통해 결제를 처리합니다.</li>
        </ol>

        <h3>제 6 조 (금지 행위)</h3>
        <p>
          회원은 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.
          타인 명의 도용, 허위 후기 작성, 자동화 수단을 통한 비정상적 접근, 공급자
          또는 다른 회원에 대한 명예 훼손·차별 행위 등.
        </p>

        <h3>제 7 조 (책임의 제한)</h3>
        <p>
          회사는 천재지변, 공급자의 귀책 사유, 통신 두절 등 불가항력적인 사유로
          서비스가 중단되거나 개별 경험이 정상 이행되지 못한 경우 책임을 지지 않습니다.
          단, 회사의 고의 또는 중대한 과실에 의한 경우는 예외로 합니다.
        </p>

        <h3>제 8 조 (약관의 변경)</h3>
        <p>
          회사는 약관의 규제에 관한 법률 등 관련 법령을 위배하지 않는 범위에서 본 약관을
          변경할 수 있으며, 변경 시에는 시행 7일 전(불리한 변경은 30일 전)부터 서비스 내 공지합니다.
        </p>

        <h3>제 9 조 (분쟁 해결 및 관할)</h3>
        <p>
          본 약관과 관련하여 발생한 분쟁의 관할 법원은 회사 본사 소재지를 관할하는 법원으로
          합니다. 준거법은 대한민국 법령으로 합니다.
        </p>
      </>
    ),
  },
  privacy: {
    label: "개인정보수집",
    title: "개인정보 수집 및 이용",
    body: (
      <>
        <p className="legal-meta">시행일: 2026년 4월 25일</p>

        <h3>1. 수집 항목</h3>
        <ul>
          <li><strong>필수</strong>: 이메일, 닉네임, 소셜 로그인 식별자 (Google/Naver UID)</li>
          <li><strong>선택(인테이크 설문)</strong>: 성함, 연령대, 거주 시·도/구·동, 직업·소속, 혼인 상태, 연소득·자산 범위, 선호 카테고리·예산·시기·동행 유형, 유입 경로</li>
          <li><strong>자동 수집</strong>: 접속 로그, 쿠키·세션 식별자, 디바이스 정보(브라우저·OS), 검색·예약 이력</li>
          <li><strong>결제 시</strong>: 카드 결제는 결제 대행사(TossPayments)가 직접 수집·처리하며 회사는 카드 정보를 저장하지 않습니다.</li>
        </ul>

        <h3>2. 수집·이용 목적</h3>
        <ul>
          <li>회원 식별 및 본인 확인, 부정 이용 방지</li>
          <li>큐레이션 추천 및 담당 큐레이터 매칭</li>
          <li>경험 예약·결제·환불 처리, 공급자와의 일정·픽업 조율</li>
          <li>고객 문의 응대 및 분쟁 처리</li>
          <li>(선택 동의 시) 마케팅 정보 발송, 큐레이션 알고리즘 학습</li>
        </ul>

        <h3>3. 보유 및 이용 기간</h3>
        <ul>
          <li>회원 정보: 회원 탈퇴 시까지 (탈퇴 즉시 파기. 다만 관련 법령에 따라 일정 기간 보관 의무가 있는 항목은 그 기간 동안 보관)</li>
          <li>예약·결제 기록: 전자상거래 등에서의 소비자 보호에 관한 법률에 따라 5년</li>
          <li>로그·접속 기록: 통신비밀보호법에 따라 3개월</li>
        </ul>

        <h3>4. 제3자 제공</h3>
        <p>
          경험 예약 시 해당 공급자에게 일정 조율을 위해 회원의 닉네임·예약 일자·인원·연락처를 제공합니다. 그 외에는 법령에 따른 요구가 있는 경우를 제외하고 제3자에게 제공하지 않습니다.
        </p>

        <h3>5. 처리 위탁</h3>
        <ul>
          <li>결제: TossPayments (카드 결제·환불 처리)</li>
          <li>인프라: AWS, Vercel (호스팅·로그)</li>
          <li>이메일 발송: SendGrid 또는 동등 서비스</li>
        </ul>

        <h3>6. 회원의 권리</h3>
        <p>
          회원은 언제든지 본인의 정보를 열람·정정·삭제·처리 정지 요구할 수 있으며,
          마이페이지의 “프로필 수정” 또는 고객센터를 통해 처리 가능합니다.
          민감 정보(자산·소득 범위 등)는 담당 큐레이터 외에는 열람할 수 없도록 격리 저장됩니다.
        </p>

        <h3>7. 개인정보 보호 책임자</h3>
        <p>
          개인정보 보호 책임자: 이현석 (대표) / hello@maeum.local
        </p>
      </>
    ),
  },
  business: {
    label: "사업자정보",
    title: "사업자 정보",
    body: (
      <>
        <table className="legal-table">
          <tbody>
            <tr><th>상호</th><td>마음 (Maeum)</td></tr>
            <tr><th>대표자</th><td>이현석</td></tr>
            <tr><th>사업자등록번호</th><td>812-88-02419</td></tr>
            <tr><th>주소</th><td>제주시 신북로 126 103-303호</td></tr>
            <tr><th>이메일</th><td>hello@maeum.local</td></tr>
            <tr><th>업태</th><td>정보통신업</td></tr>
            <tr><th>업종</th><td>통신판매중개업</td></tr>
          </tbody>
        </table>

        <p className="mt-6 text-[13px] text-ink-muted leading-[1.7]">
          마음(Maeum)은 통신판매중개업자로서 회원과 공급자 간 경험 거래를 중개합니다.
          개별 경험 계약의 이행 및 그에 따른 책임은 해당 공급자에게 있으며, 회사는
          결제 대행 및 분쟁 중재의 범위 내에서 회원을 보호합니다.
        </p>
      </>
    ),
  },
};

export function SiteFooter() {
  const [open, setOpen] = useState<LegalDoc>(null);

  // ESC 닫기 + body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <footer className="border-t border-line py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="caption text-ink-muted mb-2">MAEUM</p>
              <p className="text-[14px] text-ink-muted max-w-md">
                당사는 통신판매 중개자로, 경험 계약의 당사자는 제휴 공급사입니다.
                상품 정보와 거래에 관한 의무와 책임은 판매자에게 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-[14px] text-ink-muted">
              <span>© 2026 MAEUM</span>
              <span>Private Beta</span>
            </div>
          </div>

          {/* 법적 고지 링크 */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-line text-[13px] tracking-[0.04em]">
            {(["terms", "privacy", "business"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setOpen(k)}
                className="text-ink-muted hover:text-brass transition"
              >
                [ {DOCS[k].label} ]
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* 모달 */}
      {open && (
        <div
          className="legal-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={DOCS[open].title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="legal-modal">
            <div className="legal-modal__head">
              <h2 className="legal-modal__title">{DOCS[open].title}</h2>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="닫기"
                className="legal-modal__close"
              >
                ×
              </button>
            </div>
            <div className="legal-modal__body">{DOCS[open].body}</div>
            <div className="legal-modal__foot">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="legal-modal__ok"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
