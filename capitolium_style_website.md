# 🎨 Capitolium 스타일 럭셔리 웹사이트 제작 프롬프트

> 참고 사이트: https://www.collabcapitolium.fr/
> 프랑스 럭셔리 스포츠 브랜드 협업 사이트 스타일로 제작

---

## 📋 프로젝트 개요

프랑스의 `Capitolium` 웹사이트(Toulouse FC × Stade Toulousain 협업)를 벤치마킹하여, **영화 같은 몰입감**과 **럭셔리 브랜드**의 분위기를 내는 웹사이트를 제작합니다.

### 핵심 키워드
- 🎬 Cinematic (영화적)
- 💎 Luxury (럭셔리)
- 📖 Storytelling (스토리텔링)
- 🏛️ Classic/Architectural (클래식/건축적)
- ✨ Minimal but Impactful (미니멀하지만 임팩트 있는)

---

## 🎯 기술 스택

```
프론트엔드:
- HTML5 (시맨틱 마크업)
- CSS3 (커스텀, Tailwind 선택적)
- JavaScript (Vanilla 또는 React/Vue)
- GSAP 3.x (애니메이션)
- GSAP ScrollTrigger (스크롤 기반 애니메이션)
- Lenis (부드러운 스크롤, 선택)

미디어:
- WebM 영상 (일반 재생용)
- MP4 영상 (Scrub용, 스크롤 연동)
- WebP 이미지 (용량 최적화)
- SVG (텍스처, 아이콘)

백엔드 (선택):
- Kirby CMS 또는 Next.js/Astro
```

---

## 🎨 디자인 시스템

### 컬러 팔레트

```css
:root {
  /* 메인 컬러 */
  --color-bg-primary: #F5F1EA;        /* 아이보리/크림 (대리석 느낌) */
  --color-bg-secondary: #2B2420;      /* 다크 브라운 */
  --color-accent-gold: #C9A961;       /* 골드 (Capitouls 전통 색) */
  --color-accent-red: #8B0000;        /* 와인 레드 (귀족 색) */
  --color-accent-black: #1A1614;      /* 잉크 블랙 */
  
  /* 텍스트 */
  --color-text-primary: #1A1614;
  --color-text-secondary: #6B5F54;
  --color-text-inverse: #F5F1EA;
  
  /* 텍스처 */
  --color-marble-light: #E8E0D4;
  --color-marble-dark: #A89B8A;
}
```

### 타이포그래피

```css
/* 헤드라인용 - 세리프 럭셔리 폰트 */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;700;900&display=swap');

/* 본문용 - 산세리프 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Playfair Display', 'Cormorant Garamond', serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  
  /* 사이즈 스케일 */
  --fs-hero: clamp(3rem, 10vw, 8rem);
  --fs-h1: clamp(2.5rem, 6vw, 5rem);
  --fs-h2: clamp(2rem, 4vw, 3.5rem);
  --fs-h3: clamp(1.5rem, 2.5vw, 2rem);
  --fs-body: clamp(1rem, 1.2vw, 1.125rem);
  --fs-small: 0.875rem;
}
```

### 스페이싱

```css
:root {
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;
  --space-2xl: 12rem;
  
  /* 섹션 간격 */
  --section-spacing: clamp(6rem, 15vh, 12rem);
}
```

---

## 🏗️ 페이지 구조

### 1. **Hero Section (인트로)**

```html
<section class="hero">
  <video autoplay muted loop playsinline>
    <source src="/videos/intro-sky.webm" type="video/webm">
    <source src="/videos/intro-sky.mp4" type="video/mp4">
  </video>
  
  <div class="hero-overlay">
    <h1 class="hero-title">
      [프로젝트 이름]
    </h1>
    <p class="hero-subtitle">[서브 태그라인]</p>
    
    <button class="btn-enter">
      <span>Entrer</span>
      <span>Entrer</span>
    </button>
  </div>
</section>
```

**핵심 효과**:
- ✅ 배경 비디오 자동 재생 (음소거, 루프)
- ✅ 영상 위 반투명 오버레이 (텍스트 가독성)
- ✅ 큰 세리프 폰트 헤드라인
- ✅ 미니멀한 CTA 버튼

---

### 2. **Scrub Video Section (스크롤 연동 영상)** ⭐ 핵심

```html
<section class="scrub-section">
  <video id="scrubVideo" muted playsinline preload="auto">
    <source src="/videos/scrub-entrance.mp4" type="video/mp4">
  </video>
  
  <div class="scrub-content">
    <h2>챕터 타이틀</h2>
    <p>설명 텍스트...</p>
  </div>
</section>
```

```javascript
// GSAP ScrollTrigger Scrub Video
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById('scrubVideo');
const section = document.querySelector('.scrub-section');

// 비디오 로드 후 실행
video.addEventListener('loadedmetadata', () => {
  gsap.to(video, {
    currentTime: video.duration,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: `+=${window.innerHeight * 2}`, // 2뷰포트 높이만큼 스크롤
      scrub: 0.5,  // 0.5초 지연으로 부드럽게
      pin: true,   // 섹션 고정
      anticipatePin: 1
    }
  });
});
```

**제작 팁**:
- 🎥 **영상 제작 시**: Adobe Premiere/After Effects에서 10-15초 영상 렌더링
- 📏 **프레임레이트**: 30fps 권장
- 📦 **용량**: 5-15MB (H.264 압축)
- 🔧 **인코딩**: `ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium output.mp4`

---

### 3. **Chapter Section (스토리텔링 챕터)**

```html
<section class="chapter">
  <div class="chapter-header">
    <span class="chapter-number">Chapitre I</span>
    <h2 class="chapter-title">
      <span>Les arcades</span>
      <span>Les arcades</span> <!-- 텍스트 반복 트레일 -->
    </h2>
  </div>
  
  <div class="marble-divider">
    <img src="/marble.svg" alt="">
  </div>
  
  <div class="chapter-content">
    <article class="content-block">
      <img src="/image1.webp" alt="">
      <h3>Le lieu des commencements</h3>
      <p>본문 내용...</p>
    </article>
    
    <article class="content-block reversed">
      <img src="/image2.webp" alt="">
      <h3>Populaire dans l'âme</h3>
      <p>본문 내용...</p>
    </article>
  </div>
  
  <!-- 마퀴(Marquee) 텍스트 -->
  <div class="marquee">
    <span>Les arcades · Les arcades · Les arcades ·</span>
  </div>
</section>
```

```css
/* 텍스트 트레일 효과 */
.chapter-title {
  position: relative;
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 700;
}

.chapter-title span:first-child {
  position: absolute;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--color-accent-gold);
  transform: translate(-8px, -8px);
}

.chapter-title span:last-child {
  color: var(--color-accent-black);
}

/* 대리석 구분선 */
.marble-divider {
  height: 120px;
  margin: var(--space-xl) 0;
  background-image: url('/marble-texture.svg');
  background-size: cover;
  background-position: center;
}

/* 마퀴 (무한 스크롤 텍스트) */
.marquee {
  overflow: hidden;
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-accent-gold);
  border-bottom: 1px solid var(--color-accent-gold);
}

.marquee span {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 2rem;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

---

### 4. **Gallery Section (이미지 갤러리)**

```html
<section class="gallery">
  <h2>Médias</h2>
  
  <div class="gallery-grid">
    <figure class="gallery-item size-large">
      <img src="/image1.webp" alt="" loading="lazy">
    </figure>
    <figure class="gallery-item size-medium">
      <img src="/image2.webp" alt="" loading="lazy">
    </figure>
    <!-- ... -->
  </div>
</section>
```

```css
/* 비대칭 그리드 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-sm);
}

.gallery-item {
  overflow: hidden;
  position: relative;
}

.gallery-item.size-large { grid-column: span 8; grid-row: span 2; }
.gallery-item.size-medium { grid-column: span 4; }
.gallery-item.size-small { grid-column: span 3; }

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.gallery-item:hover img {
  transform: scale(1.05);
}
```

---

## 🎭 핵심 애니메이션 구현

### 1. 페이드 인 애니메이션 (스크롤 시)

```javascript
gsap.utils.toArray('.fade-in').forEach(element => {
  gsap.from(element, {
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });
});
```

### 2. 패럴랙스 효과

```javascript
gsap.utils.toArray('.parallax').forEach(img => {
  gsap.to(img, {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: img,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});
```

### 3. 부드러운 스크롤 (Lenis)

```javascript
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### 4. 텍스트 글자별 등장 애니메이션

```javascript
import SplitType from 'split-type';

const text = new SplitType('.split-text', { types: 'chars,words' });

gsap.from(text.chars, {
  opacity: 0,
  y: 100,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.8,
  ease: "power4.out",
  scrollTrigger: {
    trigger: '.split-text',
    start: "top 80%"
  }
});
```

---

## 🖼️ 에셋 준비 가이드

### 영상

```bash
# 1. 원본 영상 편집 (Premiere, DaVinci 등)
# 2. WebM으로 변환 (일반 재생용)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# 3. MP4로 변환 (Scrub용)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -movflags +faststart output.mp4

# 4. 여러 해상도로 생성
ffmpeg -i input.mp4 -vf scale=-2:1080 output-1080p.mp4
ffmpeg -i input.mp4 -vf scale=-2:720 output-720p.mp4
```

### 이미지

```bash
# WebP 변환
cwebp -q 80 input.jpg -o output.webp

# 여러 사이즈 생성 (반응형)
convert input.jpg -resize 640 output-640.jpg
convert input.jpg -resize 1280 output-1280.jpg
convert input.jpg -resize 1920 output-1920.jpg
```

### 대리석/텍스처 SVG

무료 리소스 사이트:
- [SVG Backgrounds](https://www.svgbackgrounds.com/)
- [Hero Patterns](https://heropatterns.com/)
- [Figma Community](https://www.figma.com/community) (marble texture 검색)

---

## 📱 반응형 전략

```css
/* 모바일 우선 (Mobile First) */
.hero-title {
  font-size: clamp(2rem, 10vw, 8rem);
  line-height: 0.9;
}

/* 태블릿 */
@media (min-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

/* 데스크탑 */
@media (min-width: 1200px) {
  .gallery-grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

/* 모바일에서는 스크럽 비디오 비활성화 (성능 이슈) */
@media (max-width: 768px) {
  .scrub-section video {
    display: none;
  }
  .scrub-section {
    background-image: url('/fallback-image.webp');
    background-size: cover;
  }
}
```

---

## ⚡ 성능 최적화 체크리스트

- [ ] 이미지 **WebP 포맷** 사용 (JPG 대비 30% 용량↓)
- [ ] 영상 **H.264 + WebM 이중 제공**
- [ ] `loading="lazy"` 속성으로 이미지 지연 로딩
- [ ] `preload="metadata"` 로 비디오 메타데이터만 먼저 로드
- [ ] 폰트 `font-display: swap` 사용
- [ ] Critical CSS 인라인 처리
- [ ] JavaScript 번들 **코드 스플리팅**
- [ ] CDN 사용 (Cloudflare, Cloudfront)
- [ ] 파일명에 **해시 추가** (캐시 버스팅)
  - 예: `image-ae541c27.webp`

---

## 🎯 제작 순서 (단계별)

### Phase 1: 기획 & 디자인 (1주)
1. ✅ 스토리보드/와이어프레임 작성
2. ✅ 컬러 팔레트, 폰트 선정
3. ✅ Figma/Adobe XD로 목업 제작
4. ✅ 필요한 영상/이미지 에셋 리스트업

### Phase 2: 에셋 제작 (1-2주)
1. ✅ 영상 촬영/편집
2. ✅ Scrub용 영상 별도 제작
3. ✅ 이미지 촬영/편집
4. ✅ WebP/WebM 변환

### Phase 3: 개발 (2-3주)
1. ✅ HTML 구조 작성
2. ✅ CSS 스타일링
3. ✅ GSAP 애니메이션 구현
4. ✅ Scrub 비디오 구현
5. ✅ 반응형 대응

### Phase 4: 최적화 & 배포 (1주)
1. ✅ Lighthouse 성능 검사
2. ✅ 크로스 브라우저 테스트
3. ✅ SEO 메타 태그 설정
4. ✅ OG 이미지 준비
5. ✅ 배포 (Vercel/Netlify)

---

## 🔧 추천 개발 도구

```bash
# 프로젝트 시작
npm create vite@latest my-luxury-site -- --template vanilla
# 또는
npm create astro@latest

# 필수 패키지
npm install gsap
npm install @studio-freight/lenis
npm install split-type

# 개발 도구
npm install -D vite
npm install -D sass
npm install -D autoprefixer
```

---

## 📚 레퍼런스 사이트 (벤치마킹)

Capitolium과 유사한 스타일의 사이트들:

1. **Apple 제품 페이지** - https://www.apple.com/iphone/
   - Scrub 비디오의 원조
   
2. **Awwwards 수상작** - https://www.awwwards.com/
   - 최신 럭셔리 웹 트렌드

3. **Active Theory** - https://activetheory.net/
   - 프리미엄 브랜드 사이트 에이전시

4. **Locomotive** - https://locomotive.ca/
   - 캐나다 프리미엄 웹 스튜디오

5. **Obys Agency** - https://obys.agency/
   - 우크라이나 럭셔리 디자인

---

## 🎬 최종 체크리스트

### 디자인
- [ ] 일관된 컬러 팔레트 적용
- [ ] 세리프/산세리프 폰트 조화
- [ ] 여백(Space)을 충분히 활용
- [ ] 대비(Contrast) 확보
- [ ] 시각적 위계 명확

### 애니메이션
- [ ] Scrub 비디오 구현
- [ ] 스크롤 기반 페이드인
- [ ] 패럴랙스 효과
- [ ] 부드러운 스크롤
- [ ] 호버 인터랙션

### 성능
- [ ] Lighthouse 점수 90+ 
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### 접근성
- [ ] alt 태그 모든 이미지
- [ ] 키보드 네비게이션
- [ ] 충분한 색 대비
- [ ] 시맨틱 HTML

---

## 💡 프롬프트 예시 (AI에게 명령할 때)

```
위 문서를 기반으로 [프로젝트 이름]을 위한 럭셔리 스포츠/브랜드 웹사이트를 제작해주세요.

주요 요구사항:
1. 컨셉: [예: 한국 전통 × 현대 스포츠]
2. 메인 컬러: [예: #2B2420 다크 브라운 + #C9A961 골드]
3. 챕터 수: 3개 (각 챕터마다 스크럽 비디오 1개)
4. 타겟 디바이스: 데스크탑 우선, 모바일 대응

포함할 섹션:
- Hero (배경 비디오)
- Scrub 비디오 섹션 1
- Chapter 1: [이름]
- Scrub 비디오 섹션 2
- Chapter 2: [이름]
- Chapter 3: [이름]
- Gallery
- Footer

기술 스택: HTML5 + CSS3 + Vanilla JS + GSAP + ScrollTrigger
반응형: 필수
성능: Lighthouse 90+ 목표

파일 구조도 제안해주시고, 단계별로 코드를 작성해주세요.
```

---

## 🙋 자주 묻는 질문

**Q: Scrub 비디오 용량이 너무 커지면?**
A: 15초 영상을 10MB 이하로 압축. CRF 값을 28-32로 높이면 용량 감소.

**Q: 모바일에서 비디오가 안 돌아가요.**
A: `playsinline muted autoplay` 속성 모두 필수. iOS는 특히 `muted` 없으면 자동재생 X.

**Q: Kirby CMS 꼭 써야 하나요?**
A: 아닙니다. Next.js, Astro, Nuxt 같은 모던 프레임워크도 훌륭한 대안.

**Q: 폰트 어디서 구하나요?**
A: Google Fonts(무료), Adobe Fonts(구독), Commercial Type(유료) 순으로 퀄리티 상승.

---

## 📝 라이선스 주의사항

- ✅ 영상/이미지는 **본인 촬영** 또는 **저작권 구매**
- ✅ 폰트 상업용 라이선스 확인
- ✅ 음악은 무료 BGM (YouTube Audio Library) 또는 구매
- ❌ 타 사이트 에셋 무단 사용 금지

---

**작성일**: 2026년 4월
**참고 사이트**: https://www.collabcapitolium.fr/
**용도**: AI 코딩 어시스턴트용 프롬프트
