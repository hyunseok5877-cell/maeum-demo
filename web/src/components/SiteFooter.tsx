export function SiteFooter() {
  return (
    <footer className="border-t border-line py-16 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
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
    </footer>
  );
}
