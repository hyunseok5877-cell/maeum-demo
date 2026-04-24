# 📜 CHANGELOG — 마음 (Maeum) 프로젝트

> **규칙**:
> - 모든 의사결정·문서변경·스펙수정은 본 파일에 **날짜·시각·결정자·변경전·변경후·이유**를 **append-only**로 기록.
> - 절대 과거 항목을 삭제·수정하지 않는다. 잘못된 결정은 새로운 엔트리로 "revert" 또는 "supersede" 표시.
> - AI 어시스턴트는 작업 시작 전 `DECISIONS.md`와 본 파일을 반드시 읽는다.
> - 버전은 `v<major>.<minor>` 형식. 주요 방향 전환 시 major 올림.

---

## [v0.14] — 2026-04-24 — 🔒 **LOCKED HERO SNAPSHOT**

### 확정 — carlesfaus.com 패턴 Infinite Scroll Hero (오너 요청, 최종)

> **이 버전은 오너가 "엄청 힘들게 만든" 디자인. 건드리기 전 반드시 이 스냅샷으로 롤백 가능하도록 세 방식으로 보존.**

### 구조
- 홈 (`/`) = `SiteHeader` + `InfiniteLoopHero` + `SiteFooter` 만. Chapitre I·II·III·Marquee·Closing 전부 제거
- **배경 텍스트**: "경험을 재설계하다." (한글 검정) + italic "Imagination, Made Real." — `position: fixed`로 뷰포트 중앙에 영구 고정. 스크롤·ancestor overflow 영향 0. 히어로 섹션이 뷰포트 밖이면 IntersectionObserver가 opacity 페이드 (SiteFooter와 겹침 방지)
- **이미지 블록**: 150vh 세로 블록 안에 절대 좌표로 이미지 6장 흩뿌림. 3개 패턴(A/B/C) 순환
- **무한 스크롤**: 초기 5블록(≈750vh), 마지막 sentinel 진입 시 IntersectionObserver가 2블록씩 append (상한 60)
- **각 이미지 = `<Link>`**: 7개 실존 Experience slug 전부 연결 (`lamborghini-seoul-urban-drive` · `ferrari-sunset-namsan` · `busan-haeundae-private-yacht-sunset` · `busan-night-yacht-champagne` · `jeju-private-equestrian-oreum` · `jeju-beach-equestrian-sunset` · `kpop-seoul-private-studio-session`)
- **호버**: 이미지 background-size 110→126% 줌 + 하단 검정 그라데이션 페이드 + 캡션 슬라이드업

### 주요 파일 (이 스냅샷의 "진짜")
```
web/src/app/page.tsx
web/src/app/layout.tsx            (Playfair_Display next/font)
web/src/app/globals.css           (.scroll-hero, .sc-text-fixed, .sc-img 등)
web/src/components/InfiniteLoopHero.tsx
web/src/components/SiteHeader.tsx (88px, Playfair Maeum 워드마크, 불어 메뉴)
design-tokens.json                (v0.2 — Brass 해금, Playfair Primary)
```

### 3중 보존
1. **Git tag**: `v0.14-hero-locked` — 정확히 이 commit 가리킴
2. **물리 백업**: `.backups/v0.14-hero-infinite-loop/` 에 위 6개 파일 원본 복사본
3. **문서**: 본 CHANGELOG 엔트리 + DECISIONS v0.14

### 🔙 롤백 방법 (가장 안전한 → 덜 안전한 순)

**방법 1 — Git tag 체크아웃 (추천, 전체 레포 복원)**
```bash
cd ~/Desktop/경험플랫폼
git fetch --tags
git checkout v0.14-hero-locked -- web/src/app/page.tsx web/src/app/layout.tsx web/src/app/globals.css web/src/components/InfiniteLoopHero.tsx web/src/components/SiteHeader.tsx design-tokens.json
```
위 명령은 지정 파일만 tag 시점으로 되돌림. 다른 파일은 그대로.

**전체 레포를 통째로 tag 시점으로 되돌리려면**:
```bash
git checkout v0.14-hero-locked
# 또는 별도 브랜치로
git checkout -b rollback-to-v0.14 v0.14-hero-locked
```

**방법 2 — 물리 백업에서 수동 복원**
```bash
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/page.tsx ~/Desktop/경험플랫폼/web/src/app/page.tsx
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/globals.css ~/Desktop/경험플랫폼/web/src/app/globals.css
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/InfiniteLoopHero.tsx ~/Desktop/경험플랫폼/web/src/components/InfiniteLoopHero.tsx
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/SiteHeader.tsx ~/Desktop/경험플랫폼/web/src/components/SiteHeader.tsx
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/layout.tsx ~/Desktop/경험플랫폼/web/src/app/layout.tsx
cp ~/Desktop/경험플랫폼/.backups/v0.14-hero-infinite-loop/design-tokens.json ~/Desktop/경험플랫폼/design-tokens.json
```

**롤백 후 실행**
```bash
cd ~/Desktop/경험플랫폼/web
npm run build
npm run dev
```

### 결정자: 오너 지시, AI 실행

---

## [v0.13] — 2026-04-24

### 확정 — 브랜드 무드 확장 (오너 방향 전환 지시)

- **무드 키워드**: "모던 미니멀" → **"모던 미니멀 × 시네마틱 럭셔리"**
  - Before (v0.4~v0.12): Aesop/Jil Sander 뼈대, 액센트 없음, EB Garamond 단독
  - After (v0.13): 같은 뼈대 유지 + Capitolium(collabcapitolium.fr) 레퍼런스의 시네마틱 스토리텔링 레이어 덧댐
  - 이유: 오너 지시 — "디자인 퀄리티가 다르다. 영화적 몰입감 필요. 단, 금액 관련(객단가 300만원) 상품은 유지"
  - 결정자: 오너 지시 + AI 실행

### 디자인 토큰 v0.2
- **액센트**: **Antique Brass `#8A7445`** 1종 해금 (v0.1~0.12는 액센트 없음)
  - 용도: 챕터 넘버링·trail stroke·대리석 divider·마퀴 라인·링크 호버·focus ring
  - 금지 유지: 금색 **그라데이션**, 여러 액센트 동시 사용, 형광·메탈릭 골드
- **Display 폰트**: Playfair Display Primary 교체 + italic 적극 사용. EB Garamond는 `.prose-maeum` 에디토리얼 본문으로 후퇴
- **다크 배경 선택지 추가**: Espresso `#2B2420` (풀블랙보다 따뜻). 히어로·닫는 섹션은 Espresso 기본
- **아이보리 선택지 추가**: Warm Ivory `#F5F1EA` (장문 섹션)
- **캡션 tracking**: 0.04em → **0.18em** (프렌치 에디토리얼 톤)
- **섹션 padding-y**: 120/80/64 → **160/100/72**
- **히어로 폰트 사이즈**: `clamp(56px, 10vw, 128px)` 신설
- **모션**: `reveal` 유틸 (1200ms 페이드 60px, IntersectionObserver) · `marquee-scroll` 40s · 시네마틱 이징 `cubic-bezier(0.25, 0.1, 0.25, 1)`

### 신규 컴포넌트·유틸 (globals.css)
- `.chapter-number` — 골드 이탤릭 챕터 라벨 (Chapitre I — Sentiment 등)
- `.chapter-title` + `.trail-wrap / .trail-ghost` — 골드 stroke trail 레이어 (본체 뒤 -6px 어긋남)
- `.marble-divider` — Brass 그라데이션 1px 라인 + 마름모 2개 장식
- `.marquee` / `.marquee-track` — 40s 무한 스크롤 이탤릭 워드마크
- `.btn-cinematic` — Entrer-style 호버 텍스트 위 스와이프 버튼
- `.reveal` / `.is-in` — 뷰포트 진입 시 1200ms 페이드인 (글로벌 메모리 규칙: 등장 애니메이션은 뷰포트 진입 시에만 실행)

### 신규 React 컴포넌트
- `web/src/components/Reveal.tsx` — IntersectionObserver로 `.is-in` 토글. `prefers-reduced-motion` 대응

### 홈 페이지 전체 리디자인 (`web/src/app/page.tsx`)
- 히어로: Espresso 배경 + 배경 이미지 + 그라데이션 오버레이 + 챕터 넘버링(— Ouverture) + trail stroke 타이틀 + Entrer-style CTA + 좌하단 중개업 고지 + 우하단 SCROLL 힌트
- Chapitre I — Sentiment (감정 스테이트먼트) — Warm Ivory 배경 + italic Brass 하이라이트 + 대리석 divider
- Marquee — Supercar · Yacht · Private Equestrian · K-pop Studio
- Chapitre II — Territoire (By Country) — 12컬럼 그리드, 1px gap에 Line 색 깔아 hairline 격자, Ouvert/Bientôt 라벨
- Chapitre III — Cette semaine (이 주의 큐레이션) — Espresso 다크 섹션 + trail 타이틀 + 카드 stagger 120ms
- Closing — Fin du prologue + 인용문 + Entrer CTA

### 헤더 (`SiteHeader.tsx`)
- 높이 72 → 88px
- 로고 옆 "Maeum" Playfair italic 워드마크 병기
- 메뉴 4개 불어 변형: Experiences · Territoire · Sentiment · Curation
- 호버 시 Brass 전환

### layout.tsx
- `Playfair_Display` next/font 추가 (weight 400·500·700·900, italic 포함)
- `--font-playfair` CSS 변수 노출

### 유지 (바뀌지 않음)
- "여행·투어·관광" 단어 금지
- 가격·벤더 확정은 오너만
- 프라이빗 셰프·소개팅 상품화 금지
- RAG·TossPayments 최후순위
- 모든 문서 CHANGELOG append-only
- 중앙정렬 폼 금지 · 이모지 금지 · 3D/뉴모피즘 금지

### TODO (후속)
- [ ] 히어로 실제 영상(.mp4/.webm) 소싱·교체
- [ ] Scrub video 섹션 1회 (슈퍼카 or 요트) — GSAP ScrollTrigger
- [ ] E2E 기존 18개 회귀 확인 (금지어·디스카운트 배지·ticker)
- [ ] /experiences · /experiences/[slug] · /quiz · /regions · /request-curation 페이지도 동일 톤으로 순차 이식

### 결정자: 오너 지시 + AI 실행

---

## [v0.12] — 2026-04-24

### 최근 예약 소셜 프루프 위젯 (오너 요청)
- 좌하단 플로팅 배지 — 원형 아바타 + 마스킹된 ID + 경험명 + 상대시간
- 4.5초마다 다음 예약으로 페이드 로테이션
- × 버튼 닫으면 localStorage에 저장 (세션 유지)

### 백엔드
- `GET /api/bookings/recent/` — confirmed/completed/in_progress 상태 최신 10건
- `_mask_identifier()` — 이메일·username을 `ab**cd` 패턴으로 마스킹 (개인정보)
- 예시: `minjae.k@example.com` → `mi**.k`

### 상세 페이지 문구 변경 (오너 요청)
- Final CTA "이 경험이 당신의 마음에 닿기를" → "**해당 일정에 추가하고 싶은 컨텐츠가 있을까요?**"
- 상하 패딩 120px → 64~80px 축소 (2-depth 보조 톤)
- 세로 2줄 중앙 → 가로 나란히 + 컴팩트 버튼

### 시드
- `python manage.py seed_bookings` 커맨드 신설
- 데모 사용자 7명 (김민재/박예진/이승현/정하은/차지호/소영/남태진)
- 데모 예약 12건 — 최근 3일 내 분포, 다양한 상태

### 프론트
- `web/src/components/RecentBookingsTicker.tsx` 클라이언트 컴포넌트
- `layout.tsx`에 전역 삽입 (모든 페이지 하단 노출)
- 아바타 팔레트 5종(검정·보르도·마린·포레스트·브라스) → 해시 기반 고정 배정
- `prefers-reduced-motion`/aria-live 접근성 반영

### E2E
- 총 18개 (기존 16 + 신규 2) — **18/18 통과**
- 추가: 티커 위젯 노출·마스킹 검증 / recent API 마스킹 검증

### 결정자: AI 실행, 오너 지시

---

## [v0.11] — 2026-04-24

### 변경 (오너 요청)
- **홈 섹션 순서 변경**: 히어로 → 감정 스테이트먼트 → **BY COUNTRY (국가 선택)** → **THIS WEEK (이 주의 큐레이션)**
  - 이유: 서사 흐름상 "어느 나라인가?" → "그 안에서 어떤 하루?" 순이 더 자연스러움 (3-depth 1→3 흐름 유지)

### 신규
- **K-pop 컬처 카테고리** 추가 (`code=kpop`, `name_ko='K-pop 컬처'`, display_order=4)
- 경험 **"K-pop 서울 프라이빗 스튜디오 세션"** 시드
  - 서울 · K-pop 컬처 · 3,500,000원 · 6시간 · 1~4인 · Featured
  - 설명: 강남 녹음 스튜디오 레코딩 + 성수동 안무 클래스 + 스타일링·촬영
- 신규 벤더 **"서울 스튜디오 시그널"** (수수료 28%) 추가
- 카탈로그 탭에 "K-pop 컬처" 자동 노출 (API categories 기반 동적)

### 용어 정정
- 오너가 "kpop 투어"로 요청했으나 **"투어" 단어는 금지 규칙** (DECISIONS §🚨 #1)
- 대체 명명 **"K-pop 서울 프라이빗 스튜디오 세션"** 으로 시드 등록

### 검증
- 홈 HTML 섹션 순서 확인: 감정 스테이트먼트 → BY COUNTRY → THIS WEEK ✓
- `/experiences/kpop-seoul-private-studio-session` 200 ✓
- Playwright 16/16 통과 ✓

### 결정자: AI 실행, 오너 지시

---

## [v0.10] — 2026-04-24

### 카탈로그 UX 변경 (오너 요청)
- 기존 `/experiences`: 카테고리별 섹션 누적 그룹 (프라이빗 외승 섹션 → 요트 섹션 → 슈퍼카 섹션) 제거
- 변경: **카테고리 탭 4개** `[전체 · 슈퍼카 · 요트 · 프라이빗 외승]` → 선택 시 해당 카테고리 카드만 단일 그리드
- 활성 탭은 검정 배경으로 강조, 나머지는 테두리만
- 지역 필터(`?region=`)는 별도 뱃지로 표시, 독립적으로 해제 가능

### 홈에 국가 레이어 추가 (3-depth 1depth UI 복원)
- 홈페이지 하단에 **"BY COUNTRY · WORLDWIDE"** 섹션 신규
- 한국·일본·중국·미국·프랑스·이탈리아 6개 국가 카드 (6컬럼 그리드)
- 한국 = **OPEN** (클릭 → `/regions`)
- 나머지 = **COMING SOON** (dim·non-clickable)
- 브랜드 서사: "마음은 한국에서 시작해 전 세계로 확장됩니다"

### 시드 확장
- `seed_maeum.py`에 프랑스·이탈리아 추가 (총 6개 국가, 한국만 active)

### E2E
- 총 16개 (기존 14 + 신규 2) — **16/16 통과**
- 추가: 홈 국가 섹션 렌더 / 카탈로그 요트 탭 필터

### 결정자: AI 실행, 오너 지시

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
