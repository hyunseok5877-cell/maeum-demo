# 마음 (Maeum) — 경험 큐레이션 플랫폼

프리미엄 경험(슈퍼카·요트·프라이빗 외승) 통합 큐레이션 서비스.

> ⚠️ **작업 시작 전 반드시 읽기**: [`DECISIONS.md`](./DECISIONS.md) · [`CHANGELOG.md`](./CHANGELOG.md)
> 본 README는 기술 실행 가이드. 비즈니스·디자인 결정은 DECISIONS.md가 단일 진실 원천.

---

## 📁 레포 구조

```
경험플랫폼/
├── DECISIONS.md           # 확정 결정 스냅샷 (단일 진실 원천)
├── CHANGELOG.md           # 결정 이력 로그 (append-only)
├── README.md              # 본 파일
├── design-tokens.json     # 디자인 토큰 (컬러·폰트·간격 전부)
├── docs/                  # 기획·QA·시장조사·UX·브랜드 문서
│   ├── 01_entity_definition.md
│   ├── 02_qa_strategy.md
│   ├── 03_dev_documents_index.md
│   ├── 04_market_research.md
│   ├── 05_review_summary.md
│   ├── 06_ux_spec.md
│   └── 07_brand_moodboard.md
├── web/                   # Next.js 16 + Tailwind v4 (프론트)
└── api/                   # Django 5 (백엔드)
    └── api_venv/          # Python 가상환경 (.gitignore)
```

---

## 🛠️ 기술 스택

| 레이어 | 기술 | 버전 |
|---|---|---|
| 프론트 | Next.js (App Router) | 16.2.4 |
| React | | 19.2.4 |
| 스타일 | Tailwind CSS | v4 |
| 백엔드 | Django | 5.1 |
| API | Django REST Framework | 3.15+ |
| DB (개발) | SQLite | 기본 |
| DB (프로덕션 예정) | PostgreSQL + pgvector | - |
| 결제 | TossPayments | - |
| AI 챗봇 | RAG (임베딩 + Claude/GPT) | - |

---

## 🚀 빠른 시작

### 1. 백엔드 (Django API)

```bash
cd api

# 가상환경 활성화 (최초 1회 생성 완료)
source ../api_venv/bin/activate

# 환경 변수
cp .env.example .env

# 마이그레이션 (최초 실행됨)
python manage.py migrate

# 수퍼유저 생성
python manage.py createsuperuser

# 개발 서버
python manage.py runserver
# → http://localhost:8000/admin/
# → http://localhost:8000/api/health/
```

### 2. 프론트 (Next.js)

```bash
cd web

# 의존성 설치 (최초 1회 완료)
npm install

# 개발 서버
npm run dev
# → http://localhost:3000
```

---

## 🏗️ 아키텍처 (Phase 1)

```
[Browser]
    │
    ▼
[Next.js 16 · App Router]   ← Vercel
    │  fetch /api/...
    ▼
[Django REST API]           ← Render / Railway
    │
    ├─▶ PostgreSQL (+ pgvector)  ← 관리형 DB
    ├─▶ S3 (이미지·영상)
    ├─▶ TossPayments (결제)
    └─▶ Claude / OpenAI (RAG 챗봇)
```

---

## 🧭 Django 앱 (초기)

| 앱 | 역할 |
|---|---|
| `experiences` | 경험 카탈로그, 지역, 카테고리 |
| `bookings` | 예약·결제·환불 |
| `curation` | 역제안 큐레이션 문의, 성향 테스트 |

Phase 2 이후 `memberships`, `chat`, `vendors` 등 추가 예정.

---

## 🎨 디자인 시스템

- `design-tokens.json` = 단일 토큰 원천
- `web/src/app/globals.css` 의 `@theme` 블록이 Tailwind v4에 토큰 주입
- 상세: [`docs/07_brand_moodboard.md`](./docs/07_brand_moodboard.md)

### 주요 클래스 (Tailwind v4)

```
bg-bg          → #FAFAF8 (배경 기본)
bg-surface     → #FFFFFF (카드)
bg-obsidian    → #0F0F0F (히어로 오버레이)
text-ink       → #1A1A1A (본문)
text-ink-muted → #6B6B6B (보조)
border-line    → #E6E4DE (구분선)
font-[family-name:var(--font-serif)]  → EB Garamond
font-[family-name:var(--font-sans)]   → Inter
```

---

## 🔒 불변 규칙

- ❌ **"여행·투어·관광"** 단어 금지 (법적 리스크)
- ❌ 숙박·항공 결합 상품 금지
- ❌ 프라이빗 셰프·소개팅 상품화 금지 (Phase 1 제외)
- ✅ 모든 변경은 `CHANGELOG.md` append
- ✅ 작업 시작 전 `DECISIONS.md` 읽기

---

## 📋 다음 할 일 (Phase 1 개발)

- [ ] Django 모델 구현 (experiences·bookings·curation — `docs/01_entity_definition.md` 기준)
- [ ] DRF serializer·viewset
- [ ] Next.js 페이지 라우팅 (`/experiences`, `/regions`, `/quiz`, `/request-curation`)
- [ ] 디자인 토큰 기반 공통 컴포넌트 (Button, Card, Input)
- [ ] 관리자 경험 CRUD 커스텀
- [ ] TossPayments 결제 연동
- [ ] RAG 챗봇 (pgvector 세팅 후)
- [ ] E2E 테스트 (Playwright)

---

## 📄 라이선스

Private · 저작권자 마음 에이전시 법인 · 2026
