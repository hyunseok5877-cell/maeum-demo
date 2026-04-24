# 01. 엔티티 정의서 (Entity Definition Document)

> 프로젝트: **마음 (Maeum)**
> 버전: v0.2 (2026-04-24, DECISIONS v0.3 반영)
> 목적: Django ORM·DB 스키마·API 설계의 단일 진실 원천(Single Source of Truth)
>
> ⚠️ **DECISIONS.md·CHANGELOG.md 우선**. 본 문서와 모순 시 DECISIONS를 따른다.
>
> **v0.2 갱신사항**:
> - Phase 1 카테고리 확정: 슈퍼카·요트·프라이빗 외승 (셰프·소개팅 제외)
> - 멤버십 엔티티는 유지하되 **Phase 1 UI 비활성** — DB·스키마는 Phase 2 대비 선행 구축
> - `Payment.idempotency_key` 추가
> - `Refund` 엔티티 신규
> - `VendorDocument` 엔티티 신규 (벤더 증빙파일)

---

## 0. 명명 규칙

| 항목 | 규칙 |
|---|---|
| 엔티티(테이블) | 영문 PascalCase (예: `Experience`, `CurationRequest`) |
| 필드 | 영문 snake_case (예: `display_name`, `created_at`) |
| 기본키 | `id` (BigAutoField) |
| 생성/수정 | 모든 테이블 `created_at`, `updated_at` 공통 |
| 삭제 | Soft delete 원칙 — `deleted_at` nullable (복구·감사 목적) |
| 금전 | `DecimalField(max_digits=12, decimal_places=0)` KRW 정수 보관. 다국가 대비 별도 `currency_code` ISO 4217 |
| 다국어 | `django-modeltranslation` — `name`, `description` 등 콘텐츠성 필드는 `ko`, `en`, `ja`, `zh` suffix로 확장 |

---

## 1. 엔티티 목록 (23개)

| # | 엔티티 | 카테고리 | 한줄 정의 |
|---|---|---|---|
| 1 | `User` | 사용자 | 일반 회원 계정 |
| 2 | `UserProfile` | 사용자 | 프로필·선호·연락처 (1:1) |
| 3 | `MembershipTier` | 사용자 | 멤버십 등급 마스터 |
| 4 | `Membership` | 사용자 | 사용자별 멤버십 가입 이력 |
| 5 | `Curator` | 운영 | 내부 큐레이터·어드민 계정 |
| 6 | `Country` | 지역 | 국가 마스터 (1depth) |
| 7 | `Region` | 지역 | 국가 내 지역 마스터 (2depth) |
| 8 | `Category` | 경험 | 경험 대분류 (슈퍼카·요트·파티 등) |
| 9 | `Experience` | 경험 | 경험 상품 상세 (3depth 노출 단위) |
| 10 | `ExperienceMedia` | 경험 | 경험 이미지·영상 |
| 11 | `ExperienceOption` | 경험 | 옵션·추가 구성 (예: 인원 추가, 디너 업그레이드) |
| 12 | `ExperienceSchedule` | 경험 | 운영 가능 일정·시간대 (캘린더) |
| 13 | `Vendor` | 공급 | 제휴 공급사(요트업체·슈퍼카 렌탈 등) |
| 14 | `VendorContract` | 공급 | 벤더별 정산율·계약 조건 |
| 15 | `Booking` | 거래 | 예약 주문 |
| 16 | `BookingItem` | 거래 | 예약 라인아이템 (경험·옵션·수량) |
| 17 | `Payment` | 거래 | 결제 트랜잭션 |
| 18 | `CurationRequest` | 큐레이션 | 맞춤 역제안 문의 |
| 19 | `CurationProposal` | 큐레이션 | 큐레이터가 작성한 3안 제안 |
| 20 | `PersonalityTestSession` | 성향 테스트 | 테스트 응시 세션 |
| 21 | `PersonalityTestAnswer` | 성향 테스트 | 문항별 응답 |
| 22 | `PersonalityType` | 성향 테스트 | 16유형 마스터 (결과값) |
| 23 | `ChatSession` / `ChatMessage` | 챗봇 | RAG 챗봇 대화 로그 |
| 24 | `ExperienceEmbedding` | 챗봇 | RAG용 벡터 임베딩 (pgvector) |
| 25 | `Review` | 소셜 | 경험 후기 |
| 26 | `Wishlist` | 소셜 | 찜 |
| 27 | `AuditLog` | 운영 | 관리자 행동 로그 (컴플라이언스) |
| 28 | `Refund` | 거래 | 환불 내역 (부분환불 히스토리 포함) — v0.2 추가 |
| 29 | `VendorDocument` | 공급 | 벤더 사업자·보험 증빙 파일 — v0.2 추가 |

**Phase 1 제외(엔티티는 유지·UI·데이터 생성 금지)**:
- `MembershipTier`, `Membership` → Phase 2에서 활성화
- `Category.code = 'private_chef'`, `Category.code = 'matchmaking'` 데이터 생성 금지
- 소개팅은 개인 요청 시 오너가 별도 오프라인 처리 (플랫폼 밖)

---

## 2. 엔티티 상세 정의

### 1) User (사용자)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BigAuto | PK | |
| email | EmailField | unique, not null | 로그인 ID |
| phone | CharField(20) | unique, null | 국제전화 형식 E.164 |
| password | CharField | Django 해시 | OAuth만 쓰면 null |
| oauth_provider | CharField(20) | null | `kakao`/`apple`/`google` |
| oauth_id | CharField(255) | null | 외부 공급자 ID |
| display_name | CharField(100) | | 노출 이름 |
| status | CharField(20) | default `active` | `active`/`dormant`/`banned` |
| last_login_at | DateTime | null | |
| created_at / updated_at / deleted_at | DateTime | | |

관계: `UserProfile` 1:1, `Membership` 1:N, `Booking` 1:N, `Wishlist` 1:N, `Review` 1:N

### 2) UserProfile

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) | 1:1 |
| birth_year | Integer | 연령대 집계용 (생일 X) |
| gender | CharField(10) | `male`/`female`/`other`/`na` |
| country_id | FK(Country) | 국적 |
| marketing_opt_in | Boolean | |
| preferred_categories | ManyToMany(Category) | |
| personality_type_id | FK(PersonalityType) | 최근 테스트 결과 |
| total_booking_amount | Decimal | 누적 결제액 (등급 산정용) |
| vip_note | Text | 큐레이터 메모 (알레르기·선호·NG사항) |

### 3) MembershipTier

| 필드 | 타입 | 설명 |
|---|---|---|
| code | CharField(20) unique | `standard`/`gold`/`black` |
| name | CharField(50) | 노출명 |
| annual_fee | Decimal | 연회비 |
| benefits | JSON | 혜택 리스트 |
| priority_queue_weight | Integer | 예약 우선순위 |

### 4) Membership

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) | |
| tier_id | FK(MembershipTier) | |
| started_at / ends_at | DateTime | |
| auto_renew | Boolean | |
| status | `active`/`cancelled`/`expired` | |

### 5) Curator

| 필드 | 타입 | 설명 |
|---|---|---|
| id | BigAuto | PK |
| admin_user_id | FK(auth_user) | Django 관리자 연결 |
| display_name | CharField | |
| specialty_categories | ManyToMany(Category) | 전문 분야 |
| signature_color | CharField | 카톡·이메일 서명 커스텀 |

### 6) Country

| 필드 | 타입 | 설명 |
|---|---|---|
| code | CharField(2) unique | ISO 3166-1 alpha-2 (`KR`/`JP`/`CN`) |
| name_ko / name_en | CharField | |
| is_active | Boolean | false면 "Coming Soon"으로 표시 |
| display_order | Integer | |

### 7) Region

| 필드 | 타입 | 설명 |
|---|---|---|
| country_id | FK(Country) | |
| code | CharField(20) | `seoul`/`busan`/`jeju` |
| name_ko / name_en | CharField | |
| lat / lng | Decimal | 구글맵 센터 좌표 |
| bounding_box | JSON | 지도 영역(남서·북동 좌표) |
| hero_media_id | FK(ExperienceMedia) | 지역 메인 이미지 |
| is_active | Boolean | |

### 8) Category

| 필드 | 타입 | 설명 |
|---|---|---|
| code | CharField(30) unique | `supercar`/`yacht`/`rooftop_party`/`equestrian`/`matchmaking` 등 |
| name_ko / name_en | CharField | |
| icon | CharField | 아이콘 식별자 |
| description | Text | |
| display_order | Integer | |

### 9) Experience (핵심)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | BigAuto | PK |
| slug | Slug unique | URL용 `lambo-city-drive-seoul` |
| title_ko / title_en | CharField(200) | |
| subtitle_ko / subtitle_en | CharField(300) | |
| description_ko / description_en | RichText | 상세 설명 (HTML) |
| country_id | FK(Country) | |
| region_id | FK(Region) | |
| category_id | FK(Category) | |
| vendor_id | FK(Vendor) | null 허용(직영) |
| base_price | Decimal | KRW 기본가 (1인·1회 기준) |
| currency | Char(3) | ISO 4217 |
| duration_minutes | Integer | |
| min_pax / max_pax | Integer | 최소·최대 인원 |
| advance_booking_days | Integer | 최소 며칠 전 예약 |
| cancellation_policy | Text | |
| status | `draft`/`active`/`paused`/`archived` | |
| is_featured | Boolean | 홈 노출 |
| rating_avg | Decimal(2,1) | 평균 별점 |
| rating_count | Integer | |
| views_count | Integer | |
| booking_count | Integer | |
| seo_meta_title / seo_meta_description | CharField | |
| tags | ManyToMany(Tag) | 성향 태그 (추천 엔진용) |
| published_at | DateTime | |

### 10) ExperienceMedia

| 필드 | 타입 | 설명 |
|---|---|---|
| experience_id | FK(Experience) | |
| type | `image`/`video` | |
| url | URL | S3·Cloudflare 경로 |
| display_order | Integer | |
| alt_text | CharField | 접근성 |
| is_cover | Boolean | 대표 이미지 |

### 11) ExperienceOption

| 필드 | 타입 | 설명 |
|---|---|---|
| experience_id | FK(Experience) | |
| name | CharField | "디너 업그레이드", "전문 포토그래퍼" |
| additional_price | Decimal | |
| max_quantity | Integer | |

### 12) ExperienceSchedule

| 필드 | 타입 | 설명 |
|---|---|---|
| experience_id | FK(Experience) | |
| date | Date | |
| start_time / end_time | Time | |
| capacity | Integer | 해당 슬롯 예약 가능 인원 |
| is_blocked | Boolean | 운영자 차단 |

### 13) Vendor

| 필드 | 타입 | 설명 |
|---|---|---|
| name | CharField | "씨엘로 마리나", "카팔레트" |
| contact_name / phone / email | CharField | |
| business_registration_no | CharField | 사업자번호 |
| address | CharField | |
| insurance_info | JSON | 보험가입정보(슈퍼카·요트 필수) |
| bank_account | 암호화 필드 | 정산 계좌 |
| status | `active`/`paused`/`blacklisted` | |

### 14) VendorContract

| 필드 | 타입 | 설명 |
|---|---|---|
| vendor_id | FK(Vendor) | |
| commission_rate | Decimal(5,2) | `18.00`=18% |
| settlement_cycle | `weekly`/`monthly` | |
| contract_start / contract_end | Date | |
| contract_pdf_url | URL | 전자계약 사본 |

### 15) Booking

| 필드 | 타입 | 설명 |
|---|---|---|
| id | BigAuto | PK |
| booking_number | CharField unique | `MUS-2026-000123` 노출용 |
| user_id | FK(User) | |
| status | enum | `pending`/`confirmed`/`in_progress`/`completed`/`cancelled`/`refunded` |
| scheduled_at | DateTime | 경험 실행 일시 |
| pax_count | Integer | 인원수 |
| total_amount | Decimal | |
| discount_amount | Decimal | |
| commission_amount | Decimal | 벤더 수수료 자동 계산 |
| special_request | Text | 고객 요청사항 |
| curator_id | FK(Curator) | 담당자 |
| cancelled_at / cancel_reason | DateTime / Text | |

### 16) BookingItem

| 필드 | 타입 | 설명 |
|---|---|---|
| booking_id | FK(Booking) | |
| experience_id | FK(Experience) | |
| option_id | FK(ExperienceOption) null | |
| quantity | Integer | |
| unit_price / subtotal | Decimal | |

### 17) Payment

| 필드 | 타입 | 설명 |
|---|---|---|
| booking_id | FK(Booking) | |
| provider | `tosspayments`/`bank_transfer`/`manual` | |
| provider_tx_id | CharField | PG 트랜잭션 ID |
| idempotency_key | CharField unique | v0.2 추가 — 중복 요청 방지 |
| amount | Decimal | |
| currency | CharField | |
| status | `pending`/`paid`/`failed`/`refunded`/`partial_refunded` | |
| paid_at / refunded_at | DateTime | |
| receipt_url | URL | |

### 28) Refund (v0.2 신규)

| 필드 | 타입 | 설명 |
|---|---|---|
| payment_id | FK(Payment) | |
| booking_id | FK(Booking) | |
| amount | Decimal | 부분환불 가능 |
| reason | Text | |
| approved_by | FK(Curator) | |
| provider_refund_id | CharField | PG 환불 트랜잭션 |
| status | `requested`/`approved`/`completed`/`rejected` | |
| requested_at / completed_at | DateTime | |

### 29) VendorDocument (v0.2 신규)

| 필드 | 타입 | 설명 |
|---|---|---|
| vendor_id | FK(Vendor) | |
| type | `business_reg`/`insurance`/`contract`/`driver_license`/`safety_cert` | |
| file_url | URL | S3 암호화 버킷 |
| valid_until | Date | 보험만기 등 |
| verified_by | FK(Curator) | 검증자 |
| verified_at | DateTime | |

### 18) CurationRequest

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) null | 비회원 허용 |
| guest_name / guest_phone / guest_email | CharField | 비회원용 |
| preferred_date_start / preferred_date_end | Date | |
| region_id | FK(Region) | |
| budget_min / budget_max | Decimal | |
| pax_count | Integer | |
| occasion | `birthday`/`anniversary`/`proposal`/`business`/`self_reward`/`other` | |
| personality_type_id | FK(PersonalityType) null | |
| free_text | Text | "꿈꾸던 하루를 자유롭게 서술" |
| status | `new`/`assigned`/`proposed`/`booked`/`declined`/`closed` | |
| assigned_curator_id | FK(Curator) | |
| source | `web_form`/`chatbot`/`phone`/`kakao` | |

### 19) CurationProposal

| 필드 | 타입 | 설명 |
|---|---|---|
| request_id | FK(CurationRequest) | |
| option_label | `A`/`B`/`C` | |
| title | CharField | |
| narrative | Text | 큐레이터의 스토리텔링 |
| total_price | Decimal | |
| experience_refs | ManyToMany(Experience) | 구성 경험들 |
| pdf_url | URL | 제안서 PDF |
| status | `draft`/`sent`/`accepted`/`declined` | |

### 20) PersonalityTestSession

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) null | 비회원 응시 허용 |
| session_token | UUID | 쿠키 기반 |
| started_at / completed_at | DateTime | |
| result_type_id | FK(PersonalityType) | |
| is_opted_in_curation | Boolean | "역제안 받기" 동의 |

### 21) PersonalityTestAnswer

| 필드 | 타입 | 설명 |
|---|---|---|
| session_id | FK(PersonalityTestSession) | |
| question_code | CharField | `Q1`, `Q2` ... |
| answer_code | CharField | `luxury`/`healing`/`thrill`/`romance` |
| answer_weight | JSON | 차원별 점수 `{L:2, H:0, T:1, R:3}` |

### 22) PersonalityType (결과 16유형)

| 필드 | 타입 | 설명 |
|---|---|---|
| code | CharField(20) unique | `NOCTURNE-LUXE`, `DAWN-HEAL` 등 |
| name_ko / name_en | CharField | |
| description | Text | 유형 설명 |
| hero_experience_ids | ManyToMany(Experience) | 추천 경험 |
| image_url | URL | 유형 대표 이미지 |

### 23) ChatSession / ChatMessage

**ChatSession**
| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) null | |
| session_token | UUID | |
| started_at / ended_at | DateTime | |
| conversion_status | `browsing`/`curation_requested`/`booked` | |

**ChatMessage**
| 필드 | 타입 | 설명 |
|---|---|---|
| session_id | FK(ChatSession) | |
| role | `user`/`assistant`/`system` | |
| content | Text | |
| retrieved_experience_ids | JSON | RAG 검색 결과 추적 |
| model_name | CharField | `claude-sonnet-4-6` 등 |
| tokens_in / tokens_out | Integer | |
| latency_ms | Integer | |

### 24) ExperienceEmbedding (pgvector)

| 필드 | 타입 | 설명 |
|---|---|---|
| experience_id | FK(Experience) | |
| content_hash | CharField | 변경 감지 |
| embedding | VectorField(3072) | `text-embedding-3-large` 차원 |
| model_version | CharField | |
| created_at | DateTime | |

### 25) Review

| 필드 | 타입 | 설명 |
|---|---|---|
| booking_id | FK(Booking) | 예약 완료자만 작성 가능 |
| user_id | FK(User) | |
| rating | Integer 1-5 | |
| title / content | CharField / Text | |
| photo_urls | JSON array | |
| is_verified | Boolean | 예약 데이터 기반 자동 true |
| is_public | Boolean | 공개 여부 |
| curator_reply | Text | 운영자 답글 |

### 26) Wishlist

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | FK(User) | |
| experience_id | FK(Experience) | |
| created_at | DateTime | |
| unique_together | (user_id, experience_id) | |

### 27) AuditLog

| 필드 | 타입 | 설명 |
|---|---|---|
| actor_id | FK(Curator) | |
| action | CharField | `create`/`update`/`delete`/`export` |
| entity_type | CharField | `Booking`/`Experience` 등 |
| entity_id | BigInt | |
| before / after | JSON | diff |
| ip_address | GenericIPAddress | |
| created_at | DateTime | |

---

## 3. 핵심 관계 (ERD 텍스트)

```
User ──1:1── UserProfile
User ──1:N── Membership ──N:1── MembershipTier
User ──1:N── Booking ──1:N── BookingItem ──N:1── Experience
                  └──1:N── Payment
User ──1:N── Wishlist ──N:1── Experience
User ──1:N── Review ──N:1── Booking

Country ──1:N── Region ──1:N── Experience ──N:1── Category
Experience ──1:N── ExperienceMedia
Experience ──1:N── ExperienceOption
Experience ──1:N── ExperienceSchedule
Experience ──N:1── Vendor ──1:N── VendorContract
Experience ──1:1── ExperienceEmbedding (RAG용)

User ──1:N── CurationRequest ──1:N── CurationProposal
CurationRequest ──N:1── Curator (담당)
CurationProposal ──N:N── Experience (구성요소)

User ──1:N── PersonalityTestSession ──N:1── PersonalityType
PersonalityTestSession ──1:N── PersonalityTestAnswer

User ──1:N── ChatSession ──1:N── ChatMessage
```

---

## 4. 상태머신 (Status Machines)

### Booking
```
pending ──(결제완료)──▶ confirmed ──(경험일)──▶ in_progress ──(종료)──▶ completed
   │                        │
   └─(취소)─▶ cancelled ◀───┘
                                              completed ──(환불)──▶ refunded
```

### CurationRequest
```
new ──(큐레이터 배정)──▶ assigned ──(제안 발송)──▶ proposed
                                         │
                  ┌──────────────────────┤
                  ▼                      ▼
                booked                 declined
```

### Payment
```
pending → paid → (환불요청) → partial_refunded / refunded
       ↘ failed
```

---

## 5. 인덱스·성능 고려

| 엔티티 | 인덱스 | 이유 |
|---|---|---|
| User | `email`, `oauth_provider+oauth_id` | 로그인 |
| Experience | `country_id+region_id+status`, `category_id+status`, `is_featured+status`, `slug` | 카탈로그 필터 |
| Experience | `published_at desc` | 신규 정렬 |
| Booking | `user_id+status`, `scheduled_at`, `booking_number` | 내 예약·운영 |
| ExperienceEmbedding | `embedding` (ivfflat) | pgvector ANN |
| Review | `experience_id+is_public+rating` | 경험 상세 페이지 |

---

## 6. 권한 매트릭스 (요약)

| 엔티티 | 비회원 | 회원 | Gold | Black | 큐레이터 | Superadmin |
|---|---|---|---|---|---|---|
| Experience 조회 | R | R | R | R | R | RW |
| 예약 생성 | ✗ | ✓ | 우선 | 최우선 | ✓ | ✓ |
| 시크릿 경험 조회 | ✗ | ✗ | R | R | R | RW |
| CurationRequest | ✓ (guest) | ✓ | ✓ | ✓ | R·배정 | RW |
| 벤더 관리 | ✗ | ✗ | ✗ | ✗ | R | RW |
| AuditLog | ✗ | ✗ | ✗ | ✗ | 본인기록 | R |

---

## 7. 개인정보·컴플라이언스 플래그

- `User.phone`, `UserProfile.birth_year`, `Vendor.bank_account` → **AES-256 필드 암호화** (`django-encrypted-model-fields`)
- `CurationRequest.free_text` → 민감 내용 포함 가능 → 접근 시 AuditLog 강제 기록
- **보존기간**: 예약 완료 후 5년 (전자상거래법), 마케팅 동의 철회 시 즉시 파기
- **GDPR 대비**: 해외 회원 대상 확장 시 `user_data_export`, `user_data_erase` 엔드포인트 예정

---

## 8. 열려 있는 질문 (TBD)

1. 소개팅 매칭 — 별도 `MatchProfile`, `MatchProposal` 엔티티로 분리할지 (Phase 1에선 `Experience` + `CurationRequest`로 흡수 예정)
2. 기프트 바우처 — `GiftCard` 엔티티 필요 여부 (Phase 2 후보)
3. 구독형 멤버십 결제주기 — 연 1회 vs 월 1회 선택형
4. 다국어 콘텐츠 — `django-modeltranslation` vs 별도 `ExperienceTranslation` 테이블
5. 벤더 self-service 포털 — 별도 인증 스키마 (`VendorUser`) 분리 여부

---

**다음 문서**: `02_qa_strategy.md`, `03_dev_documents_index.md`, `04_market_research.md` (에이전트 수행 중), `05_review_summary.md`
