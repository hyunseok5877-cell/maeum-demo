# 📜 CHANGELOG — 마음 (Maeum) 프로젝트

> **규칙**:
> - 모든 의사결정·문서변경·스펙수정은 본 파일에 **날짜·시각·결정자·변경전·변경후·이유**를 **append-only**로 기록.
> - 절대 과거 항목을 삭제·수정하지 않는다. 잘못된 결정은 새로운 엔트리로 "revert" 또는 "supersede" 표시.
> - AI 어시스턴트는 작업 시작 전 `DECISIONS.md`와 본 파일을 반드시 읽는다.
> - 버전은 `v<major>.<minor>` 형식. 주요 방향 전환 시 major 올림.

---

## [v0.9] — 2026-04-24

### L — 성향 테스트 완료
- `api/curation/quiz_data.py` — 6문항 × 4지선다, 4차원(N/D/T/R) 가중치 스코어링
- `api/curation/views.py`:
  - `GET /api/curation/quiz/questions/` — 공개 문항 (가중치 숨김)
  - `POST /api/curation/quiz/submit/` — 답변 저장 + 자동 채점 + session_token 반환
  - `GET /api/curation/quiz/result/<uuid>/` — 유형·설명·추천 경험 3건
- 시드된 4유형(NOCTURNE_LUXE, DAWN_HEAL, THRILL_RIDER, ROMANCE_ARCHITECT)에 `hero_experiences` 연결
- `web/src/app/quiz/page.tsx` — client-side 6문항 진행바 + 자동 전환 + 제출 → result 라우팅
- `web/src/app/quiz/result/[token]/page.tsx` — Obsidian 배너(유형명·영문·설명) + 추천 3카드 + CTA `/request-curation?type=...`

### M — 큐레이션 문의 완료
- `POST /api/curation/requests/` — 게스트도 가능 (이메일·전화 중 1개 + 이름 필수)
- `web/src/app/request-curation/page.tsx` — 3-step 폼
  - Step 1: 날짜 범위·지역(select)·인원·예산 범위
  - Step 2: 경험 맥락 6개 중 1개 (생일·기념일·프로포즈·비즈니스·자기보상·기타)
  - Step 3: 자유 서술 + 게스트 연락처 + 제출
  - `?type=` 쿼리로 퀴즈 결과 연동
- 제출 성공 시 "문의 #N 접수" 확인 화면 + 다음 액션 CTA

### N — 지역 페이지 + 카탈로그 필터
- `web/src/app/regions/page.tsx`:
  - 운영 중 지역 카드 그리드 (서울·부산·제주 — 경험 개수 뱃지)
  - 지역명을 대형 세리프 워드마크로 표시 (이미지 없이도 브랜드 톤 유지)
  - Coming Soon 지역 칩 (강원·경기·전남·경북·인천)
- `web/src/app/experiences/page.tsx`:
  - `?region=<code>` · `?category=<code>` 쿼리 필터 지원
  - 필터 활성 시 뱃지 + "필터 해제" 링크
  - 백엔드 DRF `filterset_fields={'region__code','category__code',...}` 기반

### API 유틸
- `src/lib/api.ts`: `getAllExperiences({region,category})`, `getRegions()` 함수 추가
- `getExperienceBySlug()` 엔드포인트 연결

### E2E 테스트 보강
- 총 14개 (기존 8 + 신규 6) — **14/14 통과**
- 추가: /quiz · /request-curation · /regions 렌더, /experiences?region 필터, 퀴즈 API end-to-end, 큐레이션 요청 API 게스트 접수

### 결정자: AI 실행, 오너 지시

---

## [v0.8] — 2026-04-24

### 확정 규칙
- **RAG 챗봇 · TossPayments 결제 = 프로젝트 최후 순위** (DECISIONS §🚨 #7 추가). 공급·경험 상세·카탈로그·성향테스트·큐레이션문의 전부 완성된 뒤 마지막에.

### 추가
- `/experiences` — 카탈로그 페이지. 카테고리별(슈퍼카·요트·외승) 섹션 그룹핑, 경험 카드 그리드
- `/experiences/[slug]` — 경험 상세 페이지
  - 히어로 갤러리 (대표 16:10 + 서브 2장)
  - 제목·서브카피·카테고리·지역·소요시간 메타 라인
  - Sticky 우측 가격 카드 (원가 line-through → 할인가·% OFF, 인원·소요·예약시점·가능일·공급)
  - "문의하기" CTA
  - STORY 섹션 — `content_html` 리치 렌더 (`.prose-maeum` 글꼴·헤딩·리스트·색상·링크 스타일)
  - ADD-ONS 옵션 리스트 (추가 가격 표시)
  - CONSIDERATIONS 안내 (인원·예약시점·취소 정책)
  - MOTION 섹션 — 비디오 파일이 있으면 `<video controls>` 노출
  - 풀폭 최종 CTA — "이 경험이 당신의 마음에 닿기를" 블랙 섹션
- `<SiteHeader>` · `<SiteFooter>` 컴포넌트 분리 (overlay/solid variant)
- `.prose-maeum` 글로벌 스타일: 리치 에디터 HTML(H·p·ul·ol·a·strong·em·s·blockquote·hr·img) 일관 렌더

### 수정
- **Next.js Turbopack 이슈 회피**: 한글 폴더명(`경험플랫폼`) + 동적 라우트(`[slug]`) 조합에서 Turbopack이 UTF-8 바이트 경계 패닉 → `package.json` 스크립트를 `next dev --webpack` / `next build --webpack`으로 전환. 프로덕션 영향 없음.

### 시연 데이터 보강
- 페라리 선셋 경험에 리치 콘텐츠(h2·h3·리스트·strong·em·color·hr) 시드
- 옵션 2개 추가 (전담 포토그래퍼 80만원 · 남산 팔각정 테라스 40만원)
- 취소 정책 4단계 시드

### 검증
- 홈 200 · /experiences 200 · /experiences/ferrari-sunset-namsan 200
- 상세 페이지에서 리치 HTML·옵션·취소정책 모두 확인
- 스크린샷 4장 저장 (01_home_hero, 02_catalog, 03_detail, 04_detail_top)

### 결정자: AI 실행, 오너 지시

---

## [v0.7] — 2026-04-24

### 확정
- **상품 등록 필드 확장** (오너 요청):
  - `Experience.discount_percentage` (0~100) — 설정 시 프론트에서 원가 line-through + 할인가 노출
  - `Experience.content_html` — 네이버 블로그 스타일 리치 에디터(django-summernote) 연동
  - `Experience.available_from` / `available_to` — 판매 가능 일자
  - `Experience.final_price` / `discount_amount` — 파생 프로퍼티(자동계산)
- **파일 업로드**: `ExperienceMedia.file` FileField 추가. **JPG/PNG/GIF/WEBP/AVIF/SVG/MP4/MOV/WEBM/PDF** 허용. `url` 외부링크 옵션 유지

### H단계 완료 — API 연결
- DRF serializer/viewset (`experiences/serializers.py`, `experiences/views.py`)
- 엔드포인트:
  - `GET /api/experiences/` — 카탈로그 (region/category/country 필터, ordering, search)
  - `GET /api/experiences/featured/` — 홈 히어로 추천
  - `GET /api/experiences/<slug>/` — 상세 (content_html + 옵션 + 미디어 포함)
  - `GET /api/experiences/regions/` — 지역 리스트
  - `GET /api/experiences/categories/` — 카테고리 리스트
  - `GET /api/experiences/countries/` — 국가 리스트
- 프론트 `web/src/lib/api.ts` + `<ExperienceCard>` 컴포넌트
- **홈에 "이 주의 큐레이션" 섹션 추가** — API 데이터로 카드 3~4개 그리드 렌더
- 페라리 선셋 경험에 15% 할인 데모 적용 (line-through + OFF 배지 확인)
- `django-summernote` 통합: Experience 어드민에서 `content_html` 필드가 WYSIWYG 에디터(볼드·색상·폰트·줄긋기·URL·이미지 삽입)

### I단계 완료 — 자동 테스트 + CI
- Playwright 설치 (`e2e/`)
- 8개 smoke 테스트 작성:
  1. 홈 히어로·로고 렌더
  2. 히어로 서브카피(슈퍼카·요트·외승) 노출
  3. **금지어(여행/투어/관광) 0건 검증** — 불변 규칙 자동화
  4. 중개자 고지 푸터 노출
  5. 이 주의 큐레이션 섹션 + 카드 최소 1개
  6. 할인 경험 line-through + 15% OFF 배지
  7. `/api/health` 200 응답
  8. featured API 데이터 검증 (slug, final_price, discount_percentage 필드)
- **8/8 통과 확인** (2.8s)
- GitHub Actions CI 워크플로 `.github/workflows/ci.yml`:
  - `backend` job — Django migrate + check + seed
  - `frontend` job — Next.js lint + build
  - `e2e` job — 두 서버 기동 후 Playwright 실행, 실패 시 report 업로드

### 기타
- `next.config.ts` — `images.remotePatterns`에 localhost·unsplash 추가
- CORS_ALLOWED_ORIGINS에 http://localhost:3001 추가
- API 헬스 개념 설명 (CHANGELOG 외 대화로만)
- 메모리: "웹 접속·WebFetch 승인 요청 금지" 피드백 추가

### 결정자: AI 실행, 오너 지시

---

## [v0.6] — 2026-04-24

### 확정
- **Django 모델 29개 구현 완료** — `docs/01_entity_definition.md` 기준
- **accounts 앱 신규**: User(AbstractUser 확장·이메일 로그인) + UserProfile + MembershipTier + Membership + Curator + AuditLog (6개)
- **experiences 앱 12개**: Country · Region · Category · Tag · Vendor · VendorContract · VendorDocument · Experience · ExperienceMedia · ExperienceOption · ExperienceSchedule · ExperienceEmbedding
- **bookings 앱 4개**: Booking · BookingItem · Payment(idempotency_key 포함) · Refund
- **curation 앱 9개**: PersonalityType · PersonalityTestSession · PersonalityTestAnswer · CurationRequest · CurationProposal · ChatSession · ChatMessage · Review · Wishlist
- 공통 믹스인 `maeum/common.py`: `TimestampedModel` (created/updated/deleted_at) + `money_field()` (KRW BigInt)
- `settings.AUTH_USER_MODEL = 'accounts.User'` 적용, DB 초기화 후 재마이그레이션
- 29개 모델 어드민 자동 등록 (inline, autocomplete, search_fields, filter, fieldsets)

### 시드 데이터
- `python manage.py seed_maeum` — 멱등 투입 커맨드
- 국가 4 / 지역 8(한국 전부) / 카테고리 3(슈퍼카·요트·외승) / 태그 6 / 벤더 3 / 멤버십 3(Phase 1 UI 비활성) / 성향유형 4 / 경험 6(서울·부산·제주 각 2)

### 어드민
- 수퍼유저 생성: `admin@maeum.local` / `maeum2026` (로컬 개발용)
- `http://localhost:8000/admin/` 접속 가능

### 프론트 수정
- 헤더에서 "MAEUM" 텍스트 삭제 (로고 단독 표시) — 오너 요청

### 검증
- `migrate` ✓ / `check` 에러 0개 / `seed_maeum` 성공 / Admin HTTP 200

### 결정자: AI 실행, 오너 지시

---

## [v0.5] — 2026-04-24

### 확정
- **브랜드 관계 확정**: "마음" 플랫폼은 **기존 마음 AI 에이전시의 하위 사업부** (동일 마스터브랜드, 로고 공유)
  - Before: 브랜드 관계 미정 (DECISIONS open question #5)
  - After: 동일 브랜드, 기존 `~/Desktop/마음web/maeum_logo.png` 공유 사용
  - 이유: 오너가 기존 로고 이미지 전달함으로써 확정

### 추가 — 레포 부트스트랩
- 모노레포 구조: `경험플랫폼/{web, api, docs}` + 루트 설정 파일
- **web/** — Next.js 16.2.4 + React 19.2.4 + Tailwind v4 + TypeScript + ESLint
  - `src/app/globals.css` — `@theme` 블록에 `design-tokens.json` 주입
  - `src/app/layout.tsx` — EB Garamond(Display) + Inter(Body) 폰트 로드, lang="ko"
  - `src/app/page.tsx` — 홈 히어로 1차 (브랜드·감정 스테이트먼트·API 헬스 표시·푸터 중개자 고지)
  - `public/logo.png` — 마음 로고 배치
- **api/** — Django 5.1.15 + DRF + django-cors-headers + django-filter + python-dotenv
  - `maeum/settings.py` — KR 로케일(Asia/Seoul), CORS, DRF 기본 설정, .env 로드
  - `maeum/urls.py` — `/api/health/`, `/api/experiences/`, `/api/bookings/`, `/api/curation/`
  - 3개 앱 스켈레톤: `experiences`, `bookings`, `curation` (stub view + url)
  - `requirements.txt`, `.env.example`
  - `api_venv/` Python 가상환경 (gitignore됨)
- **루트** — `README.md`, `.gitignore`, git init (main 브랜치)
- **검증**: `next build` ✓ 정적 생성 4페이지 통과 / Django `migrate` + `check` ✓

### 기술 결정 (부트스트랩 중)
- **Next.js 16 권고** 준수: AGENTS.md 힌트대로 `node_modules/next/dist/docs/` 참조 후 코드 작성
- **Tailwind v4 CSS-first 접근** 채택: `@theme` 블록 사용, `tailwind.config.ts` 불사용
- **Django SQLite 개발 기본** / 프로덕션은 Postgres+pgvector 예정
- **폰트 무료 조합 유지**: EB Garamond + Inter (Pretendard는 추후 self-host 또는 next/font/local)

### Git
- Initial commit: `b5ec30e`

### 결정자: AI 실행 + 오너 지시 채택

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
