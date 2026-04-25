# 📜 CHANGELOG — 마음 (Maeum) 프로젝트

> **규칙**:
> - 모든 의사결정·문서변경·스펙수정은 본 파일에 **날짜·시각·결정자·변경전·변경후·이유**를 **append-only**로 기록.
> - 절대 과거 항목을 삭제·수정하지 않는다. 잘못된 결정은 새로운 엔트리로 "revert" 또는 "supersede" 표시.
> - AI 어시스턴트는 작업 시작 전 `DECISIONS.md`와 본 파일을 반드시 읽는다.
> - 버전은 `v<major>.<minor>` 형식. 주요 방향 전환 시 major 올림.

---

## [v0.18] — 2026-04-25 — 합석/단독/지인 모드 + 채팅 매칭 + 사이버 폰트 통일 + 갤러리 라이트박스

### 컨셉 전환
- 럭셔리 자산(차/요트/항공)을 매개로 한 30-40대 소셜 매칭 플랫폼으로 포지션 조정
- 핵심 가치: "같은 회차에 탄 사람들" — 자산은 무대, 관계가 상품

### 백엔드

**`accounts/models.py`**
- `User.verified_at`, `User.verification_method` 추가 (인스타·링크드인·인터뷰·KYC)
- 매칭 화면에 "✓ 검증" 배지로 노출

**`bookings/models.py`**
- `SessionGroup` 신설: (experience, scheduled_date, sharing_mode, capacity, pax_taken, is_full)
- SHARING: `private` / `friends_only` / `open` (max_length=16)
- `Booking.sharing_mode`, `Booking.session_group` (FK→SessionGroup) 추가
- `ChatRoom` (SessionGroup 1:1), `ChatMessage` (room, user, kind=user|system, body) 신설
- 마이그레이션: `bookings 0002, 0003`, `accounts 0006`

**`bookings/views.py`**
- `_assign_session_group(experience, scheduled_at, pax, mode)` 매칭 로직:
  1. pax > capacity → 강제 단독
  2. mode=open + 같은 (경험,날짜) open 그룹 빈자리 충분 → 합류
  3. 그 외 → 새 그룹 생성 + ChatRoom 자동 개설 + 시스템 메시지
- 단독 가격 프리미엄: `PRIVATE_PRICE_MULTIPLIER = 2.5` 적용
- `_public_member_card(user)` — gender/age_range/occupation/verified만 노출 (노골X)
- 신규 endpoint:
  - `POST /api/bookings/demo/` 확장 — body에 `sharing_mode`, 응답에 `session_group_id`, `chat_room_id`, `forced_private`, `group_pax_taken`, `group_capacity`
  - `GET /api/bookings/availability/?experience_slug=&date=` — 합석 가능 그룹 + 익명 멤버 카드
  - `GET /api/bookings/<id>/chat/` — 방 정보 + 멤버 리스트
  - `GET|POST /api/bookings/<id>/chat/messages/` — 폴링 기반 (`after=<id>` 증분)

**`accounts/views.py` (`my_profile`)**
- `recent_bookings` 응답에 `sharing_mode`, `session_group_id`, `group_pax_taken`, `group_capacity`, `has_chat` 추가

### 프론트

**폰트 통일 — Cyber 톤**
- `layout.tsx`: Playfair Display, EB Garamond 제거. **Chakra Petch** + JetBrains Mono + Allura(시그니처 1곳)만 유지
- `globals.css`: `--font-display`, `--font-serif`, `--font-playfair`, `--font-sans`, `--font-body` 모두 동일한 `--font-cyber-stack`로 alias → 기존 `font-[family-name:var(--font-serif)]` 클래스도 자동으로 사이버 폰트 적용
- `body { font-feature-settings: "ss01" "cv11" "tnum" }` — 사이버 숫자/글리프 활성

**`components/ExperienceGallery.tsx` (신규)**
- 4+ 사진 대응: 메인 1 + 사이드 썸네일 2 유지, 마지막 썸네일에 `+N 사진 더보기` 오버레이
- 라이트박스 (전체화면, ‹›/ESC, 카운터, 썸네일 스트립)
- 모바일에서는 갤러리 아래 "사진 N장 전체보기" 버튼

**`components/ExperienceActions.tsx`**
- 모달에 자리 오픈 방식 라디오 (오픈 합석 / 지인만 / 단독 ×2.5)
- 단독 선택 시 결제 금액 ×2.5 자동 적용 + "(단독)" 캡션
- 오픈 모드 선택 시 `/api/bookings/availability/` 호출 → 같은 날짜 합석 그룹의 익명 멤버 카드 표시 (성별·연령대·직군·검증 배지)
- 예약 후 `/bookings/{id}/chat` 자동 라우팅

**`app/bookings/[id]/chat/page.tsx` + `ChatRoomClient.tsx` (신규)**
- 좌측 채팅 + 우측 멤버 패널 (2-col)
- 시스템 메시지 (입장/큐레이터 모더레이터 안내) 별도 톤
- 4초 폴링 (`?after=<lastId>`), 자동 스크롤
- 멤버 패널: 닉네임 / 검증✓ / 성별·연령·인원 / 직업

**`app/bookings/BookingsClient.tsx`**
- 카드에 sharing 모드 칩 (`단독 이용` / `지인만` / `오픈 합석`)
- `has_chat` 인 경우 카드 하단에 "채팅방 입장 (N/M)" 버튼

**`app/experiences/page.tsx`**
- 헤드라인 "어디로, 언제, 몇 명인가요?" → "새로운 경험을 떠날 준비가 되셨나요?"

### CSS (`globals.css`)
- `.lightbox-backdrop`, `.lightbox-stage`, `.lightbox-close`, `.lightbox-counter`, `.lightbox-nav`, `.lightbox-strip` 신규
- 사이버 보정: body font-feature-settings + `[class*="cyber-strip__"]` mono 강제

### 매칭 룰 (요약)
| 조건 | 결과 |
|---|---|
| pax > 큐레이션 max_pax | 강제 단독, 가격 ×2.5 |
| mode=open + 같은 회차 open 그룹 빈자리 | 합류 + 시스템 메시지 |
| mode=friends_only | 단독 그룹 (외부 합류 불가) 가격 ×1 |
| mode=private | 회차 단독 잠금, 가격 ×2.5 |

---

## [v0.17] — 2026-04-25 — 위시리스트 풀 구현 + 데모 예약 흐름

### 백엔드

**Wishlist (`curation/views.py` + `curation/urls.py`)**
- 모델은 기존 `Wishlist(user, experience)` (unique_together) 그대로 활용
- 신규 endpoint:
  - `GET /api/curation/wishlist/` — 내 위시리스트 (제목·가격·커버 이미지·지역·카테고리)
  - `POST /api/curation/wishlist/toggle/` body `{experience_slug}` → `{in_wishlist: true}`
  - `DELETE /api/curation/wishlist/toggle/` 동일 body → `{in_wishlist: false}`
  - `GET /api/curation/wishlist/check/<slug>/` — 경험 상세에서 ♡ 초기 상태
- 모두 `CSRFExemptSessionAuthentication` + `IsAuthenticated`

**Booking 데모 (`bookings/views.py` + `bookings/urls.py`)**
- 신규 endpoint: `POST /api/bookings/demo/` body `{experience_slug, pax_count?, scheduled_at?}`
- 자동 booking_number `MAEUM-YYMMDD-XXXX`, status `confirmed` (결제 흐름 생략 — 데모)
- 14일 후 default 일정, BookingItem 1건 동시 생성
- 응답: `{id, booking_number, status, scheduled_at, total_amount}`

### 프론트

**신규 컴포넌트 `ExperienceActions.tsx`** (client)
- 경험 상세 페이지 가격 카드에 삽입
- 마운트 시 `/auth/me/` + `/wishlist/check/{slug}/` 호출 → 인증·찜 상태 확인
- 버튼:
  - 풀폭 검정 **"예약하기 (데모)"** — confirm 후 `/bookings/demo/` POST → `/bookings`로 이동, alert로 booking_number 안내
  - 1/2 폭 **♡ 위시리스트 담기 / ♥ 위시리스트에 담김** (toggle, 담긴 상태일 땐 brass 배경)
  - 1/2 폭 큐레이터 문의 (`/request-curation`)
- 비로그인 시 confirm으로 로그인 유도

**경험 상세 (`/experiences/[slug]/page.tsx`)**
- 기존 단일 "문의하기" Link → `<ExperienceActions />` 컴포넌트로 교체
- 가이드 문구 변경: "데모 예약은 결제 없이 즉시 확정 — 마이페이지 > 예약 내역에서 확인"

**위시리스트 페이지 (`/wishlist`)** — placeholder → 실데이터
- `WishlistClient.tsx` 분리. `/wishlist/` GET 호출
- 빈 상태: "♡ 버튼을 눌러 담아 보세요" + 경험 둘러보기 CTA
- 카드 그리드(3컬럼) + 우상단 × 버튼으로 즉시 제거(DELETE)
- 401/403 → /login 자동 리다이렉트

### E2E 검증 (curl)
```
1. 로그인
2. 위시 toggle  → in_wishlist: true
3. 위시 list   → count: 1, 페라리 선셋 남산 루트
4. 데모 예약   → MAEUM-260425-CCE2 confirmed 5,440,000원
```

### 결정자: 오너 지시 + AI 실행

---

## [v0.16.7] — 2026-04-25 — 성향 유형 description 풍부화 (4종 모두)

### 문제 (오너 리포트)
"로맨스 설계자가 한 줄로 끝남 — 가치관·성향(즉흥 vs 계획)·강점·추천 큐레이션 방향까지 보여줘야 한다. 다른 유형도 동일"

### 변경
`api/experiences/management/commands/seed_maeum.py` `PERSONALITY_TYPES`의 description을 다음 5요소 구조로 풍부화:
1. 어떤 사람인지 (한 문장 정의)
2. 가치관 (돈 vs 가치, 무엇을 우선하는지)
3. 성향 (즉흥 vs 계획, 자유 vs 디테일)
4. 강점 영역 (어떤 경험에 어울리는지)
5. 추천 큐레이션 방향 ("아래와 같은 큐레이션을 추천드립니다"로 마무리)

### 4종 갱신 결과 (글자수)
- NOCTURNE_LUXE 야행성 럭셔리파 — 317자
- DAWN_HEAL 새벽의 정원사 — 255자
- THRILL_RIDER 드라이브 스릴 시커 — 233자
- ROMANCE_ARCHITECT 로맨스 설계자 — 280자

각 유형마다 톤 차별화: 야행=조용한 비공개, 새벽=회복·평정, 스릴=강도·즉흥, 로맨스=설계·디테일

### 적용
`python manage.py seed_maeum` 재실행 → DB 갱신 완료 (update_or_create로 멱등). `/quiz/result/[token]` 페이지가 즉시 새 description 노출

### 결정자: 오너 지시 + AI 실행

---

## [v0.16.6] — 2026-04-25 — 푸터 법적 고지 3종 + 모달 팝업

### 추가
- `SiteFooter.tsx` server → **client component** 전환 (모달 state 관리)
- 푸터 하단 hairline border 위에 3개 링크 노출 (carlesfaus 패턴 `[ Label ]` 브래킷)
  - **[ 이용약관 ]** · **[ 개인정보수집 ]** · **[ 사업자정보 ]**
- 클릭 시 중앙 정렬 모달 (backdrop blur, ESC 닫기, body scroll lock, 클릭 외부 영역 닫기)

### 모달 콘텐츠

**1. 이용약관** — 9개 조항 (목적/용어/서비스 성격/회원 가입/예약·결제·취소/금지 행위/책임 제한/약관 변경/분쟁 해결). 통신판매중개업자 포지션 반영, 회사가 거래 당사자 아님 명시

**2. 개인정보 수집·이용** — 7개 섹션 (수집 항목/이용 목적/보유 기간/제3자 제공/처리 위탁/회원 권리/보호 책임자). 인테이크 설문의 민감 항목까지 포함. 결제 카드 정보는 회사 미저장(TossPayments 직접 처리) 명시

**3. 사업자 정보 (오너 제공 데이터 그대로 박음)**
| 상호 | 마음 (Maeum) |
| 대표자 | 이현석 |
| 사업자등록번호 | **812-88-02419** |
| 주소 | 제주시 신북로 126 103-303호 |
| 이메일 | hello@maeum.local |
| 업태 | 정보통신업 |
| 업종 | 통신판매중개업 |

### CSS (`globals.css` 신규 섹션 — Legal Modal)
- `.legal-modal-backdrop`: rgba(15,15,15,0.55) + backdrop-blur, fadeIn 200ms
- `.legal-modal`: max-width 720px, max-height calc(100vh - 80px), slideUp 240ms
- `.legal-modal__head/body/foot`: 헤더(타이틀+닫기) / 스크롤 가능 본문 / 확인 버튼
- `.legal-table`: 사업자 정보 라벨/값 2컬럼 표 (35% 라벨 / 65% 값)

### 결정자: 오너 지시 + AI 실행

---

## [v0.16.5] — 2026-04-25 — Guest-XXXX 임시 라벨이 진짜 닉네임처럼 표시되던 문제 수정

### 문제 (오너 리포트)
"마이페이지 큰 제목에 Guest-r5ldzn이 떠 있음 — 게스트 닉네임이 표시되어야 하나?"

### 원인
v0.16.2 버그 시기에 잘못 만들어진 auto user들이 `display_name='Guest-XXXXXX'`, `nickname=''` 상태. my_profile API의 fallback이 `display_name → email split` 순이라 Guest 라벨을 진짜 닉네임처럼 출력. 사용자가 닉네임을 설정한 적이 없는데도 닉네임이 있는 것처럼 보임.

### 수정
**Backend `accounts/views.py` `my_profile`**
- nickname fallback 우선순위: `user.nickname` > `display_name(단, "Guest-" prefix 제외)` > `''`
- Guest-XXX 라벨을 닉네임으로 절대 출력하지 않음

**Frontend `MyProfileClient.tsx`**
- `data.user.nickname`이 빈 문자열이면 큰 제목 자리에 italic 회색 "닉네임을 설정해 주세요" + brass "지금 설정하기 →" CTA (`/welcome`)
- 닉네임 있으면 기존 디스플레이

**Frontend `SiteHeader.tsx`**
- 헤더 우측 사용자 라벨도 Guest- prefix 거름. 표시 우선순위: `nickname` > `display_name(non-Guest)` > "닉네임 설정"
- avatarLetter도 동일 처리 (Guest는 email 첫글자 fallback)

### 결과
v0.16.2 시기 auto user로 로그인된 케이스도 명확히 "닉네임 설정 필요"가 보임 → 사용자가 정상 닉네임 설정 흐름으로 유도

### 결정자: 오너 리포트 + AI 진단/실행

---

## [v0.16.4] — 2026-04-25 — 뱃지 디자인 미리보기 토글 (임시)

### 추가
- `MyProfileClient.tsx` 뱃지 섹션 헤더 우측에 **"디자인 미리보기"** 버튼
- 클릭 시 `previewBadges` state true → 모든 뱃지를 unlock 상태(BADGE_ICON 표시)로 노출
- 미획득 뱃지에는 "미리보기" 라벨 + opacity 0.85로 실제 획득과 시각적 구분
- 다시 클릭 시 정상 잠금 상태 복구

### 의도
디자인 검토 — 6개 뱃지(첫 경험 ✦ / 스피드 시커 ◉ / 바다의 방랑자 ◈ / 새벽의 산책자 ☾ / 삼도 순례자 ♢ / 큐레이터의 선택 ♔) 이모지 표시가 어떻게 보이는지 확인용. 실제 earned 데이터는 변하지 않음.

### 결정자: 오너 검토 요청 + AI 실행 (임시 — 디자인 확정 후 제거 또는 어드민 전용으로 승격 검토)

---

## [v0.16.3] — 2026-04-25 — 성향 테스트 결과 user 자동 저장 + 재방문 분기

### 문제 (오너 리포트)
"성향 테스트 했는데 또 같은 시작 화면 — 테스트한 사람이라면 무슨 성향인지 나와야 하지 않냐"

### 원인 (다중 결함)
1. `quiz_submit`에 인증 데코레이터 없음 + 프론트 fetch에 `credentials: "include"` 누락 → `request.user = AnonymousUser` → `PersonalityTestSession.user = None`
2. `quiz_submit`이 `UserProfile.personality_type`을 갱신하지 않음 → 마이페이지 personality_type 응답이 영영 비어있음
3. `/quiz` 페이지가 기존 결과 보유 사용자 분기 없음 → 매번 처음부터
4. 마이페이지 "성향 테스트" 카드도 결과 유무 무관 동일 라벨

### 수정

**Backend `curation/views.py`**
- `from accounts.views import CSRFExemptSessionAuthentication`
- `quiz_submit`에 `@authentication_classes([CSRFExemptSessionAuthentication])` 추가 → 세션 cookie로 user 식별
- 제출 후 로그인 사용자에 한해 `UserProfile.personality_type = ptype` 자동 저장 (get_or_create)

**Backend `accounts/views.py` `my_profile`**
- 응답에 `last_quiz_token` 추가 (가장 최근 동일 type session_token)
- 결과 페이지로 직접 이동 가능

**Frontend `web/src/app/quiz/page.tsx`**
- 마운트 시 `/me/profile/` 호출 → `personality_type + last_quiz_token` 있으면 `existing` state
- 시작 화면 분기:
  - existing 있음: "당신의 성향은 [야행성 럭셔리파]입니다" + [내 결과 보기 →] / [다시 테스트하기] 버튼
  - existing 없음: 기존 신규 사용자 안내
- submit fetch에 `credentials: "include"` 추가 (이게 빠져서 인증 자체가 안 되던 핵심)

**Frontend `MyProfileClient.tsx`**
- 빠른 링크 카드 "성향 테스트": personality_type 있으면 라벨 "내 성향 결과" + 부제로 `name_ko` (브래스 색) + href는 `/quiz/result/{token}` 직접
- 없으면 기존 "성향 테스트" + `/quiz`

### 검증 (curl E2E)
```
1. 로그인 → nickname 설정
2. quiz 제출 (cookie 동봉) → session_token + type 받음
3. me/profile 응답:
   personality_type: { code: NOCTURNE_LUXE, name_ko: 야행성 럭셔리파, ... }
   last_quiz_token: bc745e6d-... ✓
```

### 결정자: 오너 리포트 + AI 진단/실행

---

## [v0.16.2] — 2026-04-25 — 닉네임/인테이크가 다른 user에 저장되던 치명적 버그 수정

### 문제 (오너 리포트)
"닉네임/회원정보 다 입력했는데 헤더에서 또 /welcome으로 보내짐 — 반복"

### 원인 진단
v0.15.7에서 CSRF 403 해결을 위해 4개 endpoint에 `@authentication_classes([])`를 추가했는데, 이는 **CSRF 우회 + SessionAuthentication 자체 비활성화**의 부작용을 유발:
- `request.user`가 무조건 `AnonymousUser`로 설정됨
- `nickname_set`/`submit_intake` 안의 `if request.user.is_authenticated` → 항상 False
- → 매번 새 auto User를 생성하고 그 user에 nickname/intake 저장
- 진짜 로그인된 user(예: peter@maeum.local)의 `nickname`은 영구히 빈 채
- 헤더의 `/api/auth/me/`(SessionAuthentication 정상)는 진짜 user 반환 → `needs_nickname: true` → /welcome 무한 루프

### 수정
- `accounts/views.py`: `CSRFExemptSessionAuthentication(SessionAuthentication)` 신규 클래스
  - `enforce_csrf(self, request): return` — CSRF 검증만 우회
  - 세션 식별(sessionid 쿠키 → user 매핑)은 정상 동작
- `mock_social_login`, `submit_intake`, `logout_view`, `nickname_set`, `avatar_upload`의 `authentication_classes([])` → `authentication_classes([CSRFExemptSessionAuthentication])`

### 검증 (curl 시나리오)
```
1. mock 로그인 → user id=21
2. nickname_set → 동일 user id=21에 nickname 저장 ✓ (이전엔 새 user 생성)
3. me → needs_nickname: false → /my 정상 라우팅 ✓
```

### 영향
- 데이터 정합성: 이번 버그로 DB에 만들어진 무효 auto_* user들 존재 가능. 운영 시작 전 정리 권장
- 향후 CSRF 우회 필요시 `@authentication_classes([])` 절대 금지, 항상 `CSRFExemptSessionAuthentication` 사용

### 결정자: 오너 리포트 + AI 진단/실행 (v0.15.7 회귀 수정)

---

## [v0.16.1] — 2026-04-25 — 프로필 사진 업로드 기능

### 백엔드 (`accounts`)
- **모델**: `User.avatar = ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True)` 추가
- **마이그레이션**: `accounts/migrations/0005_user_avatar.py` 생성·적용
- **endpoint** 신규: `POST/DELETE /api/auth/avatar/`
  - `@authentication_classes([])` + `IsAuthenticated` (CSRF 우회 + 세션 인증 필요)
  - POST: `multipart/form-data` `avatar` 필드 → ImageField 검증(타입 image/*, 5MB 이하) → 기존 파일 정리 후 저장
  - DELETE: 기존 파일 정리 + `avatar = None`
  - 응답: `{ ok, user: UserSerializer }` (avatar_url 포함 절대 URL)
- **serializer**: `UserSerializer.avatar_url` SerializerMethodField — `request.build_absolute_uri()`로 절대 URL 빌드
- **my_profile**: 응답 `user.avatar_url` 추가

### 프론트
- `SiteHeader.tsx`: `me.avatar_url` 있으면 `<img>` 6×6 round-full로 표시, 없으면 기존 첫글자 디스크
- `MyProfileClient.tsx`:
  - Profile 타입에 `user.avatar_url?` 추가
  - `useRef<HTMLInputElement>` + 숨김 `<input type="file">`
  - 프로필 카드 아바타 영역 = 큰 버튼. 클릭 시 파일 선택 → POST → 새 URL로 setData
  - 호버 시 검정 반투명 오버레이 + "사진 변경" / 업로드 중 "업로드 중…"
  - avatar 있을 때 우상단 × 삭제 버튼 (DELETE 호출, hover 시 빨강)
  - 5MB / 이미지 타입 검증 클라이언트 사이드 + 백엔드 이중 방어

### CSS (`globals.css`)
- `.profile-avatar--editable .profile-avatar__btn`: absolute inset 0 버튼
- `.profile-avatar__img`: width/height 100% + object-fit: cover (원형 마스크는 부모가 처리)
- `.profile-avatar__overlay`: rgba(15,15,15,0.55) 호버 시 opacity 0→1, "사진 변경" 라벨
- `.profile-avatar__delete`: 우상단 28×28 round 버튼, hover 시 error red 배경
- `.profile-verified`: z-index 2 (오버레이 위에 표시)

### 검증
- POST `/api/auth/avatar/` 인증 없을 때 401, 인증 시 200
- `/my` 페이지 정상 렌더

### 결정자: 오너 지시 + AI 실행

---

## [v0.16] — 2026-04-25 — 마이페이지 메뉴 풍부화 (회원등급 / 예약내역 / 최근검색 / 고객센터)

### 문제 (오너 리포트)
"닉네임 입력하고 회원가입 끝났는데 매뉴 확인 불가. 예약 내용·최근 검색·회원 등급·고객센터 같은 기능이 있어야 하지 않냐"

### 변경 — `MyProfileClient.tsx`

**1. 회원 등급 카드 추가** (프로필 카드와 성향 유형 사이)
- 경험 횟수 기반 임시 4단계 매핑 (Phase 2 멤버십 도입 전 임시 운영):
  - 0회 = **Invité** (초대 회원)
  - 1회+ = **Découvreur** (탐험가)
  - 3회+ = **Initié** (입문자)
  - 10회+ = **Connaisseur** (감별사)
- 다음 등급까지 남은 경험 횟수 우측 표시. 최고 등급 도달 시 "최고 등급 도달"

**2. 이전 경험 → 예약 내역 (라벨 정정)**
- 헤더 "Carnet" → "Réservations" + "예약 내역"
- 우상단 "전체 보기 →" 링크 (`/bookings`)

**3. 최근 검색 섹션 신규**
- localStorage `maeum:recentSearches` 기반 (최대 8개)
- 빈 상태 안내 + 칩 그리드(최대 8개) + "모두 지우기" 버튼
- 칩 클릭 시 `/experiences?q=...`

**4. 빠른 링크 그리드 3개 → 6개 확장**
- 예약 내역 전체 (`/bookings`) · 위시리스트 (`/wishlist`) · 프로필 수정 (`/onboarding`) · 큐레이션 (`/request-curation`) · 성향 테스트 (`/quiz`) · **고객센터 (`/support`)**

### 변경 — `ExperienceSearchBar.tsx`
- `submit()` 안에서 선택된 region 라벨을 localStorage `maeum:recentSearches` 에 push (최대 8개, 중복 제거, 최신 순)

### 신규 페이지

**`/support`** — 고객센터
- 연락 카드 3개 (Email / Téléphone / 큐레이션 의뢰)
- FAQ 5개 (취소·환불 / 큐레이터 직접 문의 / 결제 / 통신판매중개업 안내 / 회원 등급)
- `<details>` 아코디언 패턴

**`/bookings`** — 예약 내역 전체
- 클라이언트 컴포넌트 `BookingsClient.tsx`로 분리
- `/me/profile/` 응답의 `recent_bookings`를 풀 그리드(3컬럼)로 노출
- 상태 필터 5개 (전체 / 확정 / 진행중 / 완료 / 취소)
- 각 카드에 상태 뱃지(색상 매핑) + booking_number 표시

**`/wishlist`** — 위시리스트
- placeholder. "곧 출시" 안내 + 경험 둘러보기 CTA

### 검증
- `/my`, `/bookings`, `/wishlist`, `/support` 모두 200 OK

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.9] — 2026-04-25 — 파비콘을 마음 로고로 교체

### 변경
- `web/public/logo.png` → `web/src/app/icon.png` 복사 (Next.js 16 자동 favicon 처리)
- `web/src/app/apple-icon.png`도 추가 (iOS 홈 화면 아이콘)
- 기존 `web/src/app/favicon.ico` (Next.js 기본 검정 삼각형) 삭제

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.8] — 2026-04-25 — 헤더 로그인 상태 반영 + 인테이크 폼 UX 개선

### 1. 헤더 — 로그인 상태 반영 (오너 피드백 "기획자/개발자 따로 놀지 마라")
- 기존: `me && me.nickname`만 사용자 영역 표시 → nickname 없는(welcome 미완료) 신규 가입자는 로그인했는데도 헤더가 "[ 로그인 및 회원가입 ]" 노출
- 변경: `me`만 있으면 무조건 사용자 영역 표시
  - 닉네임 fallback: `nickname || display_name || email.split("@")[0]`
  - 링크: `needs_nickname` true → `/welcome` (닉네임 설정 유도) / false → `/my`
  - aria-label도 동적 fallback

### 2. 인테이크 폼 (`IntakeForm.tsx` + `globals.css`)

**거주 (02 · Résidence)** — 자유 input → **드롭다운**
- `REGIONS` 데이터: 한국 시·도 17개 + 각 시·군·구 (서울 25 / 부산 16 / 경기 31 / … / 제주 2). 총 ~250개 행정구역
- 시·도 select 변경 시 시·군·구 select 옵션 동적 매핑 + 시·도 변경 시 시·군·구 자동 리셋
- 시·도 미선택 상태에서 시·군·구는 disabled

**유입 경로 (07 · Source)** — 단일 → **복수 선택 (multi)**
- `referral_source` (string) → `referral_sources` (string[])
- `ChipGroup multi` 활성. 라벨: "유입 경로 (복수 선택)"
- "기타" 선택 시 → 하단에 **밑줄 input** (`field-input--underline`) 노출, `referral_other`에 직접 입력 저장
- "지인 추천" 선택 시에만 → **추천인 (닉네임)** 입력란 노출 (조건부 렌더링)
  - 추천인 박스: 기존 풀사이즈 → `field-input--small` (padding 8/12, font-size 14) 컴팩트
  - "(선택)" 라벨 제거 (조건부 노출이므로 의미 명확)
- 백엔드 호환: 제출 시 `referral_sources`를 콤마 구분 + 기타 텍스트 병합한 문자열로 `referral_source` 필드에 직렬화

**동의 (08 · Consentement)** — Optional 중복 제거
- `<span className="optional">Optional</span>` 두 곳(c_market·c_prof) 삭제
- `[선택]` 라벨 안 표시와 우측 "Optional" 표시 중복 → `[선택]`만 유지

### 3. CSS 추가 (`globals.css`)
- `.field-select`: appearance:none + 인라인 SVG ▾ 화살표 (우측 14px). disabled 상태 회색
- `.field-input--small`: padding 8/12, font-size 14
- `.field-input--underline`: border 좌·상·우 0 + 하단 1px solid ink, focus 시 brass 강조

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.7] — 2026-04-25 — 데모 로그인 403 (CSRF) 수정

### 문제 (오너 리포트)
"로그인 데모로 되어 있음에도 진행되지 않음 — 로그인 실패 (403)"

### 원인 (단계별 격리)
1. `curl` (cookie 없음) POST → 200 OK ✅
2. `curl -H "Cookie: sessionid=..."` POST → 403 + `{"detail":"CSRF Failed: CSRF cookie not set."}` ❌

DRF의 `SessionAuthentication`이 default로 활성. 브라우저가 한 번 로그인하면 `sessionid` 쿠키가 발급되고, 이후 POST 요청부터 SessionAuthentication이 CSRF 토큰을 요구. 프론트(`LoginPanel.tsx`)는 X-CSRFToken 헤더를 보내지 않으므로 403.

### 수정
- `api/accounts/views.py`:
  - `from rest_framework.decorators import authentication_classes` 추가
  - `mock_social_login`, `submit_intake`, `logout_view`, `nickname_set`에 `@authentication_classes([])` 추가
  - SessionAuthentication 우회 → CSRF 검증 건너뜀
  - 이 endpoint들은 모두 anonymous 호출이 가능해야 하는 인증 발급/공개 엔드포인트
  - `nickname_check`는 GET 위주라 영향 없음, `me`/`my_profile`은 IsAuthenticated이므로 별도 인증 필요시 SessionAuth 유지

### 검증
- 수정 후 `curl -H "Cookie: sessionid=..."` POST → 200 OK + 정상 로그인 응답
- 브라우저 데모 로그인 정상 작동

### 결정자: 오너 리포트 + AI 진단/실행

---

## [v0.15.6] — 2026-04-25 — 트랙박스 흔들림 수정 (coord typing → bar width 변동)

### 문제 (오너 리포트)
"바깥쪽 게이지박스(트랙)가 스크롤마다 움직임. 모바일에서는 안 움직임"

### 원인 (모바일 비교로 검증)
- 데스크탑: `.cyber-strip__footer { grid-template-columns: 1fr auto; }` → bar(1fr) + coord(auto) 나란히
- coord 패널의 좌표 텍스트(`[대한민국] [제주] [북위 33°...] ■ [동경 126°...]`)는 **AI 타이핑 효과**로 점진적으로 채워짐
- typing 진행 중 coord auto width = 0 → max → 변동
- bar(1fr) = viewport - coord width → coord 늘어나는 만큼 bar 줄어듦
- 결과: **bar의 트랙박스가 매 frame 좌→우로 줄어들었다 늘어남 = 흔들림**
- 모바일은 footer를 `grid-template-columns: 1fr` 단일컬럼으로 bar/coord 위아래 스택 → typing이 bar에 영향 못 줌 → 안 흔들림 (검증 완료)

### 수정
- `.cyber-strip__coord`: `min-width: 540px` + `flex-shrink: 0` + `justify-content: flex-end` 추가
  - typing 종료 시점의 width 미리 확보 → typing 진행 중에도 coord 박스 크기 불변
  - bar(1fr) 영역 width 안정 → 트랙박스 흔들림 사라짐
- 모바일 미디어쿼리(720px 이하): `min-width: 0` reset로 overflow 방지

### 검증 단서
모바일에서 흔들리지 않는다 = footer grid를 single column으로 둔 구조의 자연스러운 결과. 데스크탑도 비슷한 효과를 min-width로 모방.

### 결정자: 오너 진단 정정 + AI 실행

---

## [v0.15.5] — 2026-04-25 — 게이지 fill 복구 + 카운터 N/total 정확 동기화

### 정정 (v0.15.4 오해 수정)
v0.15.4에서 fill을 제거하고 cursor 사각형만 남긴 것은 **잘못된 해석**.
오너 의도: "게이지는 점점 차는 형태가 맞고, **fill의 길이가 카운터와 비례 안 맞는 게 문제**".

### 진짜 문제
- v0.15.3 이전: `idx = Math.floor(progress * 7)` → 카운터 07/07이 progress 85.7%에서 표시되고 fill은 100%까지 더 채워짐 → "카운터 끝났는데 게이지 더 감"
- v0.15.3: idx round + `progress = idx / (total - 1)` → 01/07=0%, 07/07=100% 매핑. 하지만 **첫 카드 보고 있는데 fill 0%인 게 부자연스러움** (01/07이면 1/7만큼 차야 정상)

### 수정
- `CyberExperienceStrip.tsx`:
  - fill `<div>` 복구 (cursor 제거)
  - `setProgress((idx + 1) / total)` → 01/07 = 1/7 ≈ 14.3%, 07/07 = 7/7 = 100%
  - 카운터 N/total과 fill 비율이 1:1 정확 매핑
- `globals.css`:
  - `.cyber-strip__fill` 룰 복구
  - `.cyber-strip__cursor` 룰 제거
  - transition: `cubic-bezier(0.4, 0, 0.2, 1) 220ms` (linear → ease로 자연스럽게)

### 결과
| 카운터 | fill 길이 |
|---|---|
| 01/07 | 14.3% |
| 02/07 | 28.6% |
| 04/07 | 57.1% |
| 07/07 | 100% |

- fill은 카운터와 정확히 비례
- 100% 절대 안 넘음 (Math.min 클램핑)
- 길이 변화는 의도된 동작 (게이지가 차는 형태)

### 결정자: 오너 정정 + AI 재실행

---

## [v0.15.4] — 2026-04-25 — 게이지 fill 제거, 절대크기 사각형 cursor만 위치 이동

### 문제 (오너 재리포트)
"게이지 사각형 크기 자체가 변하는 에러" — 02/07일 때와 07/07일 때 사각형(fill) 너비가 다름

### 원인 재진단
v0.15.3까지는 **fill(왼쪽부터 채워지는 막대)**과 **cursor(끝점 표시 막대)**를 둘 다 두는 구조. 사용자는 fill을 "게이지 사각형"으로 인식 → fill의 width가 progress에 따라 변하니 "사각형 크기가 변한다"고 판단. 사용자 의도는 **절대크기 인디케이터가 위치만 이동**하는 carlesfaus.com 패턴.

### 수정
- `CyberExperienceStrip.tsx`: `.cyber-strip__fill` JSX 제거. cursor만 남김
- `globals.css`:
  - `.cyber-strip__fill` 룰 삭제
  - `.cyber-strip__cursor`: `width: 2px` → `width: 28px`, `height: 16px` → `height: 100%`(트랙 높이 = 12px와 동일), `top: -2px` → `top: 0` → 트랙 안에 꽉 차는 절대크기 사각형
  - 인라인 `left + translateX(-progress%)` 동일 → 양 끝에서 트랙 안에 정확히 정렬

### 결과
- progress 변화 시 사각형 크기는 **28px×12px 고정 불변**
- 위치만 좌(02/07 ≈ 16.7%) → 우(07/07 = 100%)로 이동
- 양 끝점에서 트랙 박스 밖으로 안 나감

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.3] — 2026-04-25 — 게이지 cursor 절대값 정렬 + 카운터-fill 동기화

### 문제 (오너 리포트)
"게이지 버튼이 절대값 크기 고정 안 되어 있고 0~100인데 0~120까지 가는 것처럼 보임"

### 원인 분석
1. **카운터-게이지 스케일 어긋남**
   - 기존: `idx = Math.floor(progress * total)` (total=7)
   - progress 0% → 카드 1번 / progress 14.3% → 카드 2번 / progress 85.7% → 카드 7번
   - 카운터 "07/07"은 progress 85.7%부터 표시되고, fill은 100%까지 계속 진행 → "카운터 끝났는데 게이지가 더 감"
2. **cursor가 부모 트랙 경계 너머로 1px 삐져나감**
   - 기존: `transform: translateX(-1px)` 정적 적용
   - progress 0% → cursor left edge = -1px (좌측 외부)
   - progress 100% → cursor right edge = 100% + 1px (우측 외부)
   - 시각적으로 cursor 이동 거리 > 트랙 너비

### 수정
- `CyberExperienceStrip.tsx`:
  - `idx = Math.round(raw * (total - 1))` → 카드 1번=progress 0%, 카드 7번=progress 100% 정확 매핑
  - `setProgress(idx / (total - 1))` → fill·cursor가 카운터(idx)와 step 동기화
  - `Math.max(0, Math.min(1, self.progress))` 명시 클램핑 (resize·scrub overshoot 방어)
  - cursor 인라인 transform: `translateX(-${progress * 100}%)` → 0%일 때 0 shift, 100%일 때 cursor 자기너비만큼 좌측 이동 → 양 끝에서 부모 안에 정확히 정렬
- `globals.css`:
  - `.cyber-strip__cursor`: 정적 `transform: translateX(-1px)` 제거, transition에 `transform 180ms linear` 추가

### 결과
- 카드 N번 보일 때 fill = (N-1)/6 정확히 표시
- cursor가 트랙 좌·우 경계 밖으로 절대 안 나감
- "01/07"=0%, "04/07"=50%, "07/07"=100% 직관적

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.2] — 2026-04-25 — 챕터 헤딩 고정 + 카드 stage 높이 수정

### 변경
- `CyberExperienceStrip.tsx`: 큰 디스플레이 텍스트 `{spot.label}` (동적 도시명) → **"이번달 인기 큐레이션"** 고정
  - 부제: `{spot.key.toUpperCase()}` → `"CETTE SEMAINE · MONTHLY CURATION"` 고정
  - active 도시 정보는 footer 좌표 패널에서 이미 동적 표시되므로 헤더는 섹션 타이틀 역할로 단순화
- `globals.css`:
  - `.cyber-strip__stage`: `align-items: center` → `align-items: stretch` + `min-height: 0`
  - `.cyber-strip__track`: `align-items: stretch` + `height: 100%` 추가
  - `.cyber-strip__img`: `flex: 1 1 auto` → `flex: 1 1 0` (basis 0으로 강제 grow)

### 이유
- 오너 피드백 1: 큰 글씨가 도시명일 필요 없음 → 섹션 헤딩 "이번달 인기 큐레이션"이 더 적절
- 오너 피드백 2: 카드 아래 빈공간 너무 큼
  - 원인: track height 미지정 → card height 100% 무효 → image flex grow 적용 안 됨 → 이미지가 거의 0 높이
  - 해결: stage→track 높이 stretch 체인 + img flex basis 0으로 명시

### 결정자: 오너 지시 + AI 실행

---

## [v0.15.1] — 2026-04-25 — 사이버 스트립 빈공간 정리 + 챕터 헤더

### 변경 — `CyberExperienceStrip` 레이아웃 재배치

**1. 챕터 헤더 신규 추가** (도시 레일 위)
- 좌: `CHAPITRE_NN / TT` 인디케이터
- 중앙: active 도시명 큰 디스플레이 (`Playfair italic clamp(28px, 4.4vw, 60px)`) + 영문 코드 모노스페이스
- 우: `[카테고리]` · `~만원~` 가격 + `▼ NEXT` 버튼 (다음 섹션 점프, 기존 logic 그대로)
- 하단 1px hairline 구분선으로 도시 레일과 분리

**2. 카드 너비 명시화**
- 기존 `width: auto` (이미지 aspect-ratio로 결정) → `width: clamp(220px, 19vw, 320px)`
- 이미지: `aspect-ratio + height 100%` → `width 100% + flex 1 1 auto + height auto`
- 결과: 이미지 영역이 stage 세로공간을 가득 채우고, 너비는 카드 고정값을 따름

**3. viewport grid 압축**
- 기존: `grid-template-rows: 32px 1fr 64px` / padding `14px 0` / gap `10px`
- 변경: `grid-template-rows: auto 28px 1fr 40px` / padding `10px 0` / gap `8px`
- footer 64 → 40px 로 컴팩트화

### 이유
- 오너 피드백 1: 도시 레일과 카드 사이 큰 빈공간 → 헤더 행 추가로 정보 밀도 ↑
- 오너 피드백 2: 카드와 footer 사이 큰 빈공간 → footer 높이 축소 + 카드/이미지가 stage 가득 채우게
- 카드 너비 미지정 시 이미지(`aspect-ratio + height 100% + width auto`)가 flex column 안에서 폭이 0에 가깝게 줄어드는 현상 → 카드 폭 고정으로 해결

### 영향 범위
- `web/src/components/CyberExperienceStrip.tsx`: header JSX 추가
- `web/src/app/globals.css`: `.cyber-strip__viewport`, `.cyber-strip__header*`, `.cyber-strip__card`, `.cyber-strip__img`, 720px 미디어쿼리 수정
- v0.14 LOCKED 자산 (홈 InfiniteLoopHero 관련 클래스) 무관 — 별도 섹션

### 결정자: 오너 지시 + AI 실행

---

## [v0.15] — 2026-04-25 — 사이버 경험 스트립 + 헤더 통일 + 도시 레일

### 변경 — `/experiences` 페이지

**1. CyberExperienceStrip 신규 추가** (`web/src/components/CyberExperienceStrip.tsx`)
- carlesfaus.com/projects 패턴: 검색바("어디로, 언제, 몇 명인가요?") 바로 아래 섹션
- **GSAP ScrollTrigger pin+scrub**: 섹션이 viewport top+72px에 pin 되고, 세로 스크롤이 가로 translateX로 전환
- 스트립 다 지나가면 pin 해제 → 다음 섹션(마음 추천)으로 자연스럽게 이어짐
- 도시 레일 8개 (clickable): 서울 / 제주 / 부산 / 통영 / 대전 / 대구 / 강원 / 광주 — 각 셀 클릭 시 해당 도시 첫 매물 위치로 페이지 스크롤 점프 (`window.scrollTo` 부드럽게)
- 각 도시 레일 active: 현재 보이는 카드의 `region.code`와 매칭, 셀 위에 ▼ blinking caret
- 매물 없는 도시는 disabled (opacity 0.18, cursor default)
- 우하단 좌표 패널: AI 타이핑 애니메이션으로 `[대한민국] [서울] [북위 37°33'01"] ■ [동경 126°58'41"]` 자동 교체
- 하단 게이밍 프로그레스 바: `▼▼▼ ━━━━━━━━━━ [03/07]` 가로 스크롤 진행도 실시간 반영
- ▼ 다음 챕터 점프 버튼: 스크롤 다 안 해도 pin 끝지점으로 점프
- 이미지: `source.unsplash.com` deprecated 폴백 (slug→`SLUG_IMG` 7개 + `category.code`→`CATEGORY_IMG` 4개)

**2. 검색바 영역 유지**
- "어디로, 언제, 몇 명인가요?" 헤딩 + `ExperienceSearchBar` 그대로
- 필터 활성 상태(`?region=`/`?category=`)에서는 스트립 숨기고 그리드 뷰로 집중

**3. 의존성**
- `gsap` 추가 (`web/package.json`). pin+scrub 패턴은 GSAP ScrollTrigger 필수 (메모리 규칙)
- `next/font/google`에 `JetBrains_Mono` 추가 (`--font-mono`) — 사이버 모노스페이스 텍스트용

### 변경 — 전역 헤더·페이지 배경 통일

- `SiteHeader`: `overlay`/`solid` 분기 제거 → 항상 `bg-transparent`. border·blur 모두 삭제. 페이지 `--color-bg` (#FAFAF8)이 헤더 영역으로 그대로 비침
- 모든 하위 페이지 (`/login`, `/welcome`, `/onboarding`, `/about`, `/my`, `/experiences`): `bg-white pt-[88px]` → `bg-bg pt-[72px]` 로 통일
- min-height 계산도 `calc(100vh-88px)` → `calc(100vh-72px)`
- 헤더 우측 CTA 단순화: `me + nickname` → 닉네임 버튼 / 그 외 모두 `[ 로그인 및 회원가입 ]` 단일 (구 "닉네임 설정" 분기 제거)

### 이유
- 오너 피드백 1: 헤더 색이 페이지 배경과 달라보임 → 완전 동일하게 만들어 "엄청 잘 디자인된 서비스 같은 느낌"
- 오너 피드백 2: carlesfaus.com/projects 사이버틱 디자인 → 경험 페이지에 적용 (홈 메인은 v0.14 LOCKED 그대로)
- 오너 피드백 3: 도시 레일은 `[KR1]` 코드보다 한글 도시명이 직관적 + 클릭으로 점프
- 오너 피드백 4: 스크롤 다 하지 않아도 다음 챕터로 넘어갈 수 있어야 함 → ▼ 점프 버튼

### v0.14 LOCKED 자산 영향
- `web/src/app/page.tsx` (홈), `InfiniteLoopHero.tsx`, v0.14 디자인 토큰 **불변**
- 홈에서 시도했던 CyberOverlay는 롤백 → `/experiences` 전용 섹션으로 이전

### 후속 (다음 작업 큐)
- 닉네임 저장 실패 분석 (백엔드 endpoint 200 정상 — 프론트 `nickname_check`가 익명 사용자 케이스에서 본인 exclude 못 해 `available:false` 반환 → 버튼 disabled. 익명도 자기 세션 매칭하도록 fix 필요)
- Google OAuth 실연동: `google-auth` Python lib 설치 완료 (`api_venv`). `/api/auth/google/verify/` 엔드포인트 + 프론트 GIS(Google Identity Services) 도입 예정. `GOOGLE_CLIENT_ID` 환경 변수 필요 → 오너가 Google Cloud Console에서 OAuth 클라이언트 ID 발급해야 함

---

## [v0.14.1] — 2026-04-25 — 헤더 메뉴 carlesfaus 브래킷 스타일

### 변경
- `web/src/components/SiteHeader.tsx`: 메뉴 라벨을 `[ Label ]` 브래킷 형태로 감싸고, 헤더 전체 폭에 `grid-cols-[auto_1fr_auto] + justify-evenly`로 균등 분배
- 헤더 배경 = 페이지 배경과 동일 (overlay 모드 = 완전 투명, solid 모드 = `bg-bg/80` blur). border-b 제거
- 텍스트 톤 통일: overlay/solid 모두 `text-ink` (다크). 흰색 인버스 톤 제거 — 홈 히어로 흰 배경 위에서도 자연스럽게 읽힘
- 헤더 높이 88 → 72px 슬림화. 로고 40 → 28px. 폰트 caption(12px+0.18em) → 13px+0.04em (carlesfaus 톤)
- 브래킷 `[`, `]`은 opacity 60% 기본, 호버 시 100% — 미세한 상호작용
- "Maeum" Playfair 워드마크는 제거 (carlesfaus도 좌측은 작은 아이콘만)

### 이유
오너 피드백: carlesfaus.com 메뉴바 스타일 (`[ 에 대한 ]    [ 프로젝트 ]    [ 연락하다 ]`)이 더 고급스러움. 배경색 동일하게 → 헤더가 페이지에 녹아들고 콘텐츠가 주인공

### 영향 범위
- v0.14 LOCKED 자산: `InfiniteLoopHero`·`page.tsx`·`globals.css`·`design-tokens.json` **불변**. SiteHeader만 수정
- E2E: `SiteHeader`의 nav links 텍스트는 그대로(About·Experiences·Sentiment·Curation) → 기존 18/18 통과 유지 예상

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
