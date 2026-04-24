# 🎬 무한 이미지 루프 + 고정 배경 텍스트 효과

> **효과 이름**: Infinite Scroll Gallery with Sticky Background Text  
> **참고 사이트**: https://www.carlesfaus.com/en  
> **난이도**: ⭐⭐⭐⭐ (중상급)

---

## 🎯 효과 설명

### 핵심 컨셉

```
┌─────────────────────────────────────┐
│                                     │
│   [고정되는 큰 텍스트/로고]          │ ← 스크롤해도 안 움직임
│    CARLES FAUS                      │
│    ARQUITECTURA                     │
│                                     │
│   [이미지1] 올라옴 ↑                │ ← 계속 위로 흐름
│   [이미지2] 올라옴 ↑                │
│   [이미지3] 올라옴 ↑                │
│   [이미지1] 다시 등장 (루프) 🔄     │ ← 무한 반복
│                                     │
└─────────────────────────────────────┘
```

### 사용자가 경험하는 것
1. 큰 **브랜드 텍스트/로고**가 배경에 **고정**되어 있음
2. 스크롤하면 **이미지들이 아래에서 위로 흘러 올라옴**
3. 끝까지 스크롤해도 **이미지가 처음부터 다시 반복**
4. 텍스트는 계속 **같은 자리에 머물러** 있음
5. 결과: **브랜드 정체성은 고정 + 작품은 무한 감상** 가능

---

## 🎨 이 효과가 왜 멋진가?

### 디자인 철학

| 요소 | 의미 |
|------|------|
| **고정 텍스트** | 🏛️ 브랜드의 영원함, 정체성 |
| **흐르는 이미지** | 🌊 작품의 다양성, 시간의 흐름 |
| **무한 루프** | ♾️ 지속성, 풍부함 |
| **대비** | ⚖️ 움직임 + 정적의 조화 |

### 심리적 효과
- 🧠 **몰입감**: 계속 새로운 이미지 등장 → 이탈률 감소
- 👁️ **기억**: 브랜드 텍스트 지속 노출 → 인지도 상승
- 🎨 **감성**: 갤러리를 걷는 듯한 경험

---

## 🛠️ 기술 구현 방법 3가지

### 방법 1: **CSS Position Fixed + JavaScript Clone** ⭐ 추천

가장 부드럽고 성능 좋음

```html
<div class="hero-section">
  <!-- 고정될 배경 텍스트 -->
  <div class="background-text">
    <h1>CARLES FAUS</h1>
    <p>ARQUITECTURA</p>
  </div>
  
  <!-- 무한 루프될 이미지 컨테이너 -->
  <div class="image-loop-container">
    <div class="image-track">
      <!-- 이미지들 (JS로 복제됨) -->
      <div class="image-item"><img src="project1.jpg" alt=""></div>
      <div class="image-item"><img src="project2.jpg" alt=""></div>
      <div class="image-item"><img src="project3.jpg" alt=""></div>
      <div class="image-item"><img src="project4.jpg" alt=""></div>
    </div>
  </div>
</div>
```

```css
/* 섹션 설정 */
.hero-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 고정 배경 텍스트 */
.background-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none; /* 클릭 방해 안 함 */
  mix-blend-mode: difference; /* 이미지 위에서 잘 보이게 */
}

.background-text h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 300;
  color: white;
  letter-spacing: -0.02em;
  line-height: 0.9;
}

.background-text p {
  font-size: clamp(1rem, 2vw, 1.5rem);
  letter-spacing: 0.3em;
  color: white;
  margin-top: 1rem;
}

/* 이미지 트랙 (위로 흐르는 컨테이너) */
.image-loop-container {
  position: relative;
  z-index: 2;
  width: 100%;
}

.image-track {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 20vh 10vw;
}

/* 각 이미지 아이템 */
.image-item {
  width: 60%;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.8s, transform 1s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.image-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 이미지 위치 변화로 다이나믹한 느낌 */
.image-item:nth-child(odd) { margin-left: 5%; }
.image-item:nth-child(even) { margin-left: 35%; }
.image-item:nth-child(3n) { width: 70%; margin-left: 20%; }

.image-item img {
  width: 100%;
  height: auto;
  display: block;
}
```

```javascript
// 무한 루프 로직
class InfiniteImageLoop {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.image-track');
    this.items = Array.from(this.track.querySelectorAll('.image-item'));
    this.originalItems = [...this.items];
    
    this.init();
  }

  init() {
    // 1. 초기 이미지를 여러 번 복제하여 무한 루프 준비
    this.cloneImages(3); // 3번 복제 = 총 4세트
    
    // 2. 스크롤 감지
    this.setupScrollObserver();
    
    // 3. 무한 루프 체크
    this.setupLoopCheck();
  }

  cloneImages(times) {
    for (let i = 0; i < times; i++) {
      this.originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('cloned');
        this.track.appendChild(clone);
      });
    }
  }

  setupScrollObserver() {
    // 이미지가 보이면 페이드인
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20% 0px'
    });

    this.track.querySelectorAll('.image-item').forEach(item => {
      observer.observe(item);
    });
  }

  setupLoopCheck() {
    // 끝에 도달하면 스크롤을 시작 지점으로 순간이동 (부드럽게)
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const maxScroll = this.track.scrollHeight - window.innerHeight;
      const oneSetHeight = this.track.scrollHeight / 4; // 4세트이므로
      
      // 3번째 세트를 지나면 1번째 세트 위치로 순간이동
      if (scrollTop > oneSetHeight * 3) {
        window.scrollTo(0, scrollTop - oneSetHeight * 2);
      }
      // 처음으로 스크롤 시 역방향 루프
      if (scrollTop < oneSetHeight * 0.5) {
        window.scrollTo(0, scrollTop + oneSetHeight * 2);
      }
    });
  }
}

// 실행
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.image-loop-container');
  new InfiniteImageLoop(container);
});
```

---

### 방법 2: **GSAP + ScrollTrigger Virtual Scroll** 🚀

더 부드럽고 제어 쉬움

```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// 1. 부드러운 스크롤 설정
const lenis = new Lenis({
  duration: 1.2,
  smooth: true,
  smoothTouch: false
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. 이미지 배열 (무한 복제용 원본)
const images = [
  '/images/project1.jpg',
  '/images/project2.jpg',
  '/images/project3.jpg',
  '/images/project4.jpg'
];

// 3. 동적으로 이미지 생성 (많이 많이)
function createInfiniteGallery() {
  const track = document.querySelector('.image-track');
  const repeatCount = 20; // 20번 반복 = 사실상 무한
  
  for (let i = 0; i < repeatCount; i++) {
    images.forEach((src, index) => {
      const item = document.createElement('div');
      item.className = 'image-item';
      item.innerHTML = `<img src="${src}" alt="Project ${index + 1}">`;
      track.appendChild(item);
    });
  }
}

// 4. 각 이미지 등장 애니메이션
function animateImages() {
  gsap.utils.toArray('.image-item').forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 150,
      scale: 0.9,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "top 50%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// 5. 배경 텍스트 고정 + 효과
function setupBackgroundText() {
  gsap.to('.background-text', {
    scrollTrigger: {
      trigger: '.hero-section',
      start: "top top",
      end: "bottom bottom",
      pin: '.background-text', // 텍스트 고정!
      pinSpacing: false
    }
  });
}

// 6. 실행
createInfiniteGallery();
setupBackgroundText();
animateImages();
```

---

### 방법 3: **Seamless CSS Animation** 🎨

가장 간단, 순수 CSS로 자동 흐름

```css
@keyframes infiniteScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.image-track {
  animation: infiniteScroll 60s linear infinite;
}

/* 이미지를 2배로 배치해서 seamless */
.image-track .image-item {
  flex-shrink: 0;
}
```

```html
<!-- 이미지 2세트를 그대로 붙여서 seamless 효과 -->
<div class="image-track">
  <!-- 1세트 -->
  <div class="image-item"><img src="1.jpg"></div>
  <div class="image-item"><img src="2.jpg"></div>
  <div class="image-item"><img src="3.jpg"></div>
  
  <!-- 2세트 (복제) -->
  <div class="image-item"><img src="1.jpg"></div>
  <div class="image-item"><img src="2.jpg"></div>
  <div class="image-item"><img src="3.jpg"></div>
</div>
```

**장점**: 자동 재생, 심플  
**단점**: 사용자 스크롤에 반응 X

---

## 🎯 AI에게 전달할 완벽한 프롬프트

### 🔑 기본 프롬프트

```
다음 효과를 가진 웹사이트 섹션을 만들어줘:

**효과 이름**: Infinite Scroll Gallery with Sticky Background Text

**핵심 동작**:
1. 섹션 중앙에 큰 브랜드 텍스트/로고가 position: fixed로 고정됨
2. 스크롤하면 이미지들이 아래에서 위로 흘러 올라오며 페이드인
3. 끝까지 스크롤해도 처음 이미지가 다시 나오며 무한 반복
4. 배경 텍스트는 계속 같은 자리에 머물러 있음

**참고 사이트**: https://www.carlesfaus.com/en

**기술 스택**:
- HTML5 + CSS3 + Vanilla JavaScript
- GSAP ScrollTrigger
- Lenis (smooth scroll)
- IntersectionObserver (이미지 페이드인)

**디자인 요구사항**:
- 배경 텍스트: 대형 세리프 폰트 (Playfair Display)
- 이미지: 화면 60% 너비, 교차 배치 (좌측/우측)
- 컬러: 아이보리 배경 + 다크 브라운 텍스트
- 여백: 넉넉하게 (padding 20vh)
- 반응형: 모바일에서도 잘 보이게

**무한 루프 방식**: 
- 이미지 배열을 JavaScript로 여러 번 복제
- 스크롤이 끝에 도달하면 순간이동으로 처음으로 돌아가기
- 사용자는 무한 스크롤로 느껴지게

**페이드인 효과**:
- opacity: 0 → 1
- translateY: 100px → 0
- duration: 1.2초
- ease: "power3.out"
- IntersectionObserver threshold: 0.1

완성된 HTML, CSS, JavaScript 코드를 모두 작성해줘.
```

---

## 💎 고급 커스터마이징 옵션

### A. **mix-blend-mode로 텍스트를 멋지게**

```css
.background-text {
  mix-blend-mode: difference; /* 배경에 따라 색 반전 */
  color: white;
}

/* 또는 */
.background-text {
  mix-blend-mode: multiply; /* 겹침 효과 */
  color: #000;
}

/* 또는 */
.background-text {
  mix-blend-mode: exclusion; /* 아티스틱 */
  color: #f0e6d2;
}
```

### B. **이미지에 패럴랙스 추가**

```javascript
gsap.utils.toArray('.image-item').forEach(item => {
  gsap.to(item.querySelector('img'), {
    y: -100,
    ease: "none",
    scrollTrigger: {
      trigger: item,
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    }
  });
});
```

### C. **이미지마다 랜덤 위치**

```javascript
document.querySelectorAll('.image-item').forEach(item => {
  const randomOffset = Math.random() * 30 - 15; // -15% to +15%
  item.style.marginLeft = `${randomOffset + 20}%`;
  item.style.width = `${Math.random() * 20 + 50}%`; // 50~70%
});
```

### D. **호버 시 이미지 확대 + 정보 표시**

```html
<div class="image-item">
  <img src="project1.jpg" alt="">
  <div class="image-info">
    <h3>프로젝트 이름</h3>
    <p>위치 · 연도</p>
  </div>
</div>
```

```css
.image-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.image-item img {
  transition: transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.image-item:hover img {
  transform: scale(1.05);
}

.image-info {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.image-item:hover .image-info {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 📐 레이아웃 변형 아이디어

### 🎨 Variation 1: **지그재그 배치**

```css
.image-item:nth-child(4n+1) { margin-left: 5%; width: 55%; }
.image-item:nth-child(4n+2) { margin-left: 45%; width: 50%; }
.image-item:nth-child(4n+3) { margin-left: 20%; width: 60%; }
.image-item:nth-child(4n+4) { margin-left: 35%; width: 55%; }
```

### 🎨 Variation 2: **중앙 정렬 + 다양한 크기**

```css
.image-item {
  margin: 0 auto;
}

.image-item:nth-child(3n+1) { width: 40%; }
.image-item:nth-child(3n+2) { width: 60%; }
.image-item:nth-child(3n+3) { width: 50%; }
```

### 🎨 Variation 3: **전체 너비 + 부분 너비 교차**

```css
.image-item:nth-child(odd) { width: 100%; } /* 풀 너비 */
.image-item:nth-child(even) { width: 50%; margin-left: 25%; } /* 반 너비 */
```

---

## 🚨 주의사항 & 최적화

### ⚠️ 성능 이슈

이미지가 너무 많으면 브라우저 터짐 주의!

```javascript
// ✅ 좋은 방법: Lazy Loading
<img src="project1.jpg" loading="lazy" alt="">

// ✅ 좋은 방법: Virtual Scroll (화면 밖 이미지 제거)
function cleanupOffscreenImages() {
  document.querySelectorAll('.image-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < -2000 || rect.top > window.innerHeight + 2000) {
      item.remove();
    }
  });
}
```

### 📱 모바일 최적화

```css
@media (max-width: 768px) {
  .image-item {
    width: 85% !important;
    margin-left: 7.5% !important;
  }
  
  .background-text {
    position: absolute; /* fixed 대신 absolute */
    font-size: 3rem;
  }
}
```

### 🎯 접근성

```html
<!-- 스크린 리더용 -->
<div class="background-text" role="presentation" aria-hidden="true">
  CARLES FAUS
</div>

<!-- reduced-motion 지원 -->
```

```css
@media (prefers-reduced-motion: reduce) {
  .image-item {
    transition: none;
    transform: none !important;
  }
  
  .image-track {
    animation: none;
  }
}
```

---

## 📚 참고 라이브러리

```bash
# 필수
npm install gsap
npm install @studio-freight/lenis

# 선택 (더 쉽게 구현)
npm install locomotive-scroll  # 대안 smooth scroll
npm install swiper            # 슬라이드 라이브러리
npm install splide            # 또 다른 슬라이드
```

---

## 🎬 비슷한 효과의 레퍼런스 사이트

1. **Carles Faus** - https://www.carlesfaus.com/en ⭐ (지금 보고 계신 거)
2. **Studio JQ** - https://studiojq.co.uk/
3. **Vincent Van Duysen** - https://www.vincentvanduysen.com/
4. **Joshua Vides** - https://www.joshuavides.com/
5. **Locomotive** - https://locomotive.ca/en

---

## 💡 빠른 시작 템플릿

완전 처음부터 시작하려면:

### 파일 구조

```
my-gallery/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   └── main.js
├── images/
│   ├── project1.webp
│   ├── project2.webp
│   └── ...
└── package.json
```

### package.json

```json
{
  "name": "infinite-gallery",
  "dependencies": {
    "gsap": "^3.12.0",
    "@studio-freight/lenis": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

---

## 🎯 최종 체크리스트

구현 후 확인:

- [ ] 배경 텍스트가 스크롤해도 고정되어 있는가?
- [ ] 이미지가 부드럽게 페이드인 되는가?
- [ ] 스크롤 끝에 도달하면 다시 처음부터 시작되는가?
- [ ] 모바일에서도 잘 작동하는가?
- [ ] Lighthouse 성능 점수 80+ 인가?
- [ ] Reduced-motion 설정 사용자도 문제 없이 보는가?
- [ ] 이미지 alt 태그 모두 있는가?

---

**작성일**: 2026년 4월  
**참고**: https://www.carlesfaus.com/en  
**용도**: AI 코딩 어시스턴트용 프롬프트 (Cursor, Claude Code, ChatGPT 등)
