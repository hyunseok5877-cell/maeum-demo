# 📜 CHANGELOG — 마음 (Maeum) 프로젝트

> **규칙**:
> - 모든 의사결정·문서변경·스펙수정은 본 파일에 **날짜·시각·결정자·변경전·변경후·이유**를 **append-only**로 기록.
> - 절대 과거 항목을 삭제·수정하지 않는다. 잘못된 결정은 새로운 엔트리로 "revert" 또는 "supersede" 표시.
> - AI 어시스턴트는 작업 시작 전 `DECISIONS.md`와 본 파일을 반드시 읽는다.
> - 버전은 `v<major>.<minor>` 형식. 주요 방향 전환 시 major 올림.

---

## [v0.4] — 2026-04-24

### 확정
- **브랜드 무드보드 v0.1** 수립
  - 5원칙: 여백이 장식 / 무채색 기본 / 세리프·산세리프 대화 / 이미지>문장 / 잔잔한 움직임
  - 레퍼런스: Aesop · Jil Sander · Rimowa · Acne Studios · Black Tomato · Hermès · Aman
  - 컬러: Ivory White(#FAFAF8) + Ink Black(#1A1A1A) + Line Grey(#E6E4DE) 중심, **Phase 1 액센트 미사용**
  - 폰트: EB Garamond(Display) + Pretendard(한글 본문) + Inter(UI) — **무료 조합으로 시작**
  - 그리드: 12컬럼 max-width 1440px · gutter 24px
  - 수직 리듬: 섹션 padding-y 120px/80px/64px (desktop/tablet/mobile)
  - 버튼: 직각(radius 0) · height 52px · Primary 검정배경
  - 로고 방향: **A안(한글 "마음" 우선 + 영문 서브)** 권장
  - 이미지 원칙: 웜 +200K · 얼굴 클로즈업 자제 · 4:5 카드 비율
  - 영상: 히어로 루프 8~15초 · muted 기본

### 추가
- `docs/07_brand_moodboard.md` — 브랜드 DNA·무드 원칙·컴포넌트 가이드
- `design-tokens.json` — Tailwind·프론트 구현 시 단일 토큰 소스

### 금지 리스트 추가
- 금색 그라데이션·이모지·뉴모피즘·3D·형광·중앙정렬 폼·풀블랙(→Obsidian)·할인이벤트 배너

### 결정자: AI 초안 + 오너 수락

---

## [v0.3] — 2026-04-24

### 확정
- **서비스명**: "마음 (Maeum)"
  - Before: 후보 7개(MUSEN / NOIR CURATION / ATELIER ONE / CIEL / RARE& / MAISON MOMENT / ORÉ)
  - After: **마음**
  - 이유: 오너의 기존 "마음 AI 에이전시" 브랜드 일관성 + 한국어 정서적 울림
  - 결정자: 오너

- **브랜드 무드**: 모던 미니멀
  - Before: 샤넬 블랙골드 럭셔리 (v0.1)
  - After: **모던 미니멀** (Rimowa/Aesop/Jil Sander 레퍼런스)
  - 이유: 오너 취향 변경, Black Tomato 류 미니멀 럭셔리가 더 적합
  - 결정자: 오너

- **공급 카테고리 축소·변경**:
  - Before: 슈퍼카 / 요트 / 루프탑 파티 / 프라이빗 셰프 / 승마 / 소개팅 / 헬기투어 / 스카이다이빙
  - After (Phase 1): **슈퍼카 / 요트 / 프라이빗 외승**
  - 제외: **프라이빗 셰프, 소개팅**
  - 이유: 검증된 3개로 집중, 소개팅은 법적·윤리적 리스크 커서 제외. 셰프는 오너 판단으로 제외
  - 결정자: 오너

- **소개팅 예외 처리**:
  - 개인 요청 시 오너가 직접 오프라인 행사로 진행 (플랫폼 상품화 X)
  - 플랫폼 DB·UI에는 소개팅 카테고리 생성 금지

- **비즈니스 모델**: 하이브리드 확정 (단계적 도입)
  - Phase 1 (0~6개월): **객단가 중개수수료만**
  - Phase 2 (6~12개월): Gold 멤버십(연 100만원) 추가
  - Phase 3 (12개월+): Black 초대제 멤버십(연 500만원) 추가
  - 이유: AI 분석(`05_review_summary.md` §3) — 하이브리드가 단독 모델보다 ≈2배 매출. 단, 초기엔 데이터 부족 → 단계 도입
  - 결정자: 오너 + AI 제안 채택

- **초기 자본**: 0원 (부트스트랩)
  - 도메인 확보 완료
  - 법무 자문비 필요 없음 (내부 해결)
  - 인지된 지출: TossPayments 결제 수수료 2.9~3.3% + VAT
  - 이유: 오너 확정

- **UX 벤치마크**: blacktomato.com
  - 패턴: 감정 카피 히어로 → 신뢰 요소(추천사·언론·수상) → 탭 필터(여행자/인기/월/스포트라이트) → 심층 카탈로그 → 대형 CTA
  - 이 패턴을 "경험" 맥락으로 치환해 `docs/06_ux_spec.md`에 설계

### 추가
- `DECISIONS.md` 생성 — 현재 확정 상태 단일 진실 원천 (롤백 기준점)
- `CHANGELOG.md` 생성 (본 파일)
- `docs/06_ux_spec.md` 생성 — Black Tomato 벤치마크 기반 UX 스펙

### 유지 (변경 없음)
- 스택: Django + Next.js + Tailwind + RAG 챗봇
- 법적 포지션: 통신판매중개업
- 금지어 규칙: "여행/투어/관광"
- 3-depth 네비게이션 구조
- 객단가 300만원 포지션
- MBTI 스타일 성향 테스트 + 역제안 큐레이션

---

## [v0.2] — 2026-04-24

### 확정
- **시장조사 리포트** 완성 (`docs/04_market_research.md`)
  - 글로벌 Experiential Luxury $245.8B (2025) → $598.4B (2034), CAGR 10.4%
  - 한국 Experiential Luxury CAGR 22% (글로벌 2배)
  - 한국 금융자산 300억+ 초고자산가 1.1만명
  - Knightsbridge Circle £25k~£100k 멤버십 벤치마크
  - Black Tomato "Feelings Engine" 참고
  - 실패사례: Vayable 2019 종료, Airbnb Experiences v1 실패

- **통합 리뷰** 완성 (`docs/05_review_summary.md`)
  - Go/No-Go 판정: GO (조건부)
  - 권장 모델: 하이브리드(멤버십+객단가)
  - 리스크 매트릭스 작성

### 추가
- `docs/01_entity_definition.md` (27개 엔티티)
- `docs/02_qa_strategy.md` (12개 테스트 유형, 골든패스 12개)
- `docs/03_dev_documents_index.md` (65+ 문서 로드맵)
- `docs/04_market_research.md`
- `docs/05_review_summary.md`

### 결정자: AI 분석 + 오너 승인

---

## [v0.1] — 2026-04-24 (킥오프)

### 확정
- **신규 사업**: 프리미엄 경험 큐레이션 플랫폼
- **스택**: Django + Next.js + Tailwind + Node.js
  - Before: Java + Spring Boot (오너 최초 제안)
  - After: Django (AI 제안 — Python 기반 AI 자동화와 동일 언어)
  - 이유: 오너의 AI 자동화 에이전시 특성상 Python 통합 유리
  
- **법적 포지션**: 통신판매중개업 (여행업 등록 회피)
  - "여행·투어·관광" 단어 전면 금지

- **3-depth 네비게이션 구조**:
  - 1depth: 국가 (한국 only, 기타 Coming Soon)
  - 2depth: 구글맵 기반 지역
  - 3depth: 경험 상세

- **카테고리(초안)**: 슈퍼카·요트·파티·셰프·승마·소개팅·헬기·스카이다이빙 → v0.3에서 축소됨

- **브랜드 무드(초안)**: 샤넬 블랙골드 럭셔리 → v0.3에서 모던 미니멀로 변경

- **핵심 기능**: RAG 챗봇 + MBTI 성향 테스트 + 역제안 큐레이션

- **포지션**: 객단가 300만원/건, 월 1건만 성사돼도 손익 유지

### 결정자: 오너 + AI 초안 제시

---

## 📋 향후 엔트리 템플릿

```markdown
## [v<major>.<minor>] — YYYY-MM-DD

### 확정
- **<항목명>**:
  - Before: <변경 전 상태>
  - After: <변경 후 상태>
  - 이유: <왜 바뀌었는지>
  - 결정자: <오너 / AI 제안 채택 / 합의 등>

### 추가
- <새 파일·엔티티·기능 등>

### 제거
- <제거된 항목>

### Revert
- <이전 결정 되돌림 — 어떤 버전으로 되돌렸는지 명시>

### 결정자 / 메모
```

---

## 🔙 롤백 절차

1. 오너가 "vX.Y로 롤백" 요청
2. AI는 `CHANGELOG.md`를 열어 vX.Y 이후 변경 내역을 역순으로 확인
3. `DECISIONS.md`의 해당 섹션을 vX.Y 상태로 덮어쓰기
4. 관련 `docs/` 파일들도 vX.Y 시점 버전으로 복원 (Git이 있으면 `git checkout`, 없으면 수동)
5. 본 CHANGELOG에 **새 엔트리**로 롤백 이벤트 append (이전 엔트리 삭제 금지):
   ```
   ## [v0.3-rollback] — YYYY-MM-DD
   ### Revert
   - v0.3 → v0.2 상태로 롤백
   - 이유: ...
   - 영향받은 파일: DECISIONS.md, docs/06_ux_spec.md 등
   ```
