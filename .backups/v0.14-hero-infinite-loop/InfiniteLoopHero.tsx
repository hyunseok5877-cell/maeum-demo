"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Pos = {
  top: string;
  left: string;
  w: string;
  aspect: string;
  src: string;
  label: string;
  href: string;
};

// 3개 패턴이 순환되며 무한 반복 → 같은 구도가 돌아오며 '루프'됨.
// 각 블록은 세로 150vh. 중앙에 "경험을 재설계하다." 대형 텍스트,
// 그 주변에 절대 좌표로 흩뿌려진 이미지 링크들.
// carlesfaus.com/en 의 구조를 그대로 차용.

const S = {
  lambo: "/experiences/lamborghini-seoul-urban-drive",
  ferrari: "/experiences/ferrari-sunset-namsan",
  yachtHae: "/experiences/busan-haeundae-private-yacht-sunset",
  yachtNight: "/experiences/busan-night-yacht-champagne",
  horseOreum: "/experiences/jeju-private-equestrian-oreum",
  horseBeach: "/experiences/jeju-beach-equestrian-sunset",
  kpop: "/experiences/kpop-seoul-private-studio-session",
};

const IMG = {
  supercar1:
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
  supercar2:
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
  supercar3:
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80",
  supercar4:
    "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=1400&q=80",
  yacht1:
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=1400&q=80",
  yacht2:
    "https://images.unsplash.com/photo-1500622944204-b135684e99fd?auto=format&fit=crop&w=1400&q=80",
  yacht3:
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1400&q=80",
  horse1:
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1400&q=80",
  horse2:
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80",
  kpop1:
    "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=1400&q=80",
  kpop2:
    "https://images.unsplash.com/photo-1566024287286-457247b70310?auto=format&fit=crop&w=1400&q=80",
};

// ──── 패턴 A ────
const PATTERN_A: Pos[] = [
  { top: "4%",  left: "58%", w: "22vw", aspect: "4/5",
    src: IMG.horse1, label: "제주 오름 프라이빗 외승", href: S.horseOreum },
  { top: "18%", left: "14%", w: "17vw", aspect: "3/4",
    src: IMG.yacht1, label: "부산 해운대 요트 선셋", href: S.yachtHae },
  { top: "30%", left: "78%", w: "14vw", aspect: "3/4",
    src: IMG.kpop1,  label: "K-pop 서울 스튜디오", href: S.kpop },
  { top: "58%", left: "6%",  w: "26vw", aspect: "16/10",
    src: IMG.supercar2, label: "페라리 남산 선셋", href: S.ferrari },
  { top: "72%", left: "46%", w: "20vw", aspect: "16/10",
    src: IMG.yacht2, label: "한강 야경 마리나", href: S.yachtHae },
  { top: "82%", left: "80%", w: "13vw", aspect: "3/4",
    src: IMG.horse2, label: "제주 해변 승마", href: S.horseBeach },
];

// ──── 패턴 B ────
const PATTERN_B: Pos[] = [
  { top: "6%",  left: "8%",  w: "19vw", aspect: "4/5",
    src: IMG.supercar1, label: "람보르기니 서울 도심", href: S.lambo },
  { top: "10%", left: "62%", w: "26vw", aspect: "16/10",
    src: IMG.yacht3, label: "부산 나이트 요트 샴페인", href: S.yachtNight },
  { top: "35%", left: "30%", w: "30vw", aspect: "16/10",
    src: IMG.horse1, label: "제주 오름 새벽", href: S.horseOreum },
  { top: "66%", left: "4%",  w: "15vw", aspect: "3/4",
    src: IMG.kpop2,  label: "성수 안무 원데이", href: S.kpop },
  { top: "74%", left: "66%", w: "18vw", aspect: "4/5",
    src: IMG.supercar3, label: "맥라렌 강변북로", href: S.lambo },
  { top: "88%", left: "38%", w: "22vw", aspect: "16/10",
    src: IMG.horse2, label: "제주 해변 선셋 승마", href: S.horseBeach },
];

// ──── 패턴 C ────
const PATTERN_C: Pos[] = [
  { top: "5%",  left: "36%", w: "28vw", aspect: "16/10",
    src: IMG.yacht1, label: "광안리 요트 디너", href: S.yachtNight },
  { top: "22%", left: "74%", w: "15vw", aspect: "3/4",
    src: IMG.supercar4, label: "람보르기니 경춘선", href: S.lambo },
  { top: "32%", left: "2%",  w: "21vw", aspect: "4/5",
    src: IMG.kpop1, label: "강남 녹음 스튜디오", href: S.kpop },
  { top: "58%", left: "54%", w: "25vw", aspect: "16/10",
    src: IMG.supercar2, label: "페라리 남산 스피릿", href: S.ferrari },
  { top: "74%", left: "10%", w: "17vw", aspect: "3/4",
    src: IMG.horse1, label: "제주 오름 외승", href: S.horseOreum },
  { top: "84%", left: "80%", w: "14vw", aspect: "3/4",
    src: IMG.yacht2, label: "세빛섬 요트", href: S.yachtHae },
];

const PATTERNS = [PATTERN_A, PATTERN_B, PATTERN_C];

export function InfiniteLoopHero() {
  const [blocks, setBlocks] = useState(5); // 초기 5블록 (≈ 750vh)
  const [heroInView, setHeroInView] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // 무한 로드
  useEffect(() => {
    const s = sentinelRef.current;
    if (!s) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setBlocks((n) => Math.min(n + 2, 60));
          }
        });
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    io.observe(s);
    return () => io.disconnect();
  }, [blocks]);

  // 히어로 섹션이 뷰포트에 있을 때만 고정 배경 텍스트 노출
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(
      ([e]) => setHeroInView(e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-hero"
      aria-label="마음 — 경험을 재설계하다"
    >
      {/* 배경 텍스트 — position: fixed 로 뷰포트에 완전 고정. 스크롤·ancestor overflow 영향 0.
          히어로가 뷰포트 밖이면 페이드아웃. */}
      <div
        className={`sc-text-fixed ${heroInView ? "" : "is-hidden"}`}
        aria-hidden
      >
        <div className="sc-text">
          <span className="sc-text-kr">경험을 재설계하다.</span>
          <span className="sc-text-en">Imagination, Made Real.</span>
        </div>
      </div>

      {/* 스크롤되는 이미지 블록들 */}
      <div className="scroll-blocks">
        {Array.from({ length: blocks }).map((_, blockIdx) => {
          const pattern = PATTERNS[blockIdx % PATTERNS.length];
          return (
            <div
              key={blockIdx}
              className="scroll-block"
              data-block-index={blockIdx}
            >
              {pattern.map((p, i) => (
                <Link
                  key={i}
                  href={p.href}
                  className="sc-img"
                  style={{
                    top: p.top,
                    left: p.left,
                    width: p.w,
                    aspectRatio: p.aspect,
                    backgroundImage: `url('${p.src}')`,
                  }}
                  aria-label={p.label}
                >
                  <span className="sc-img-caption">{p.label}</span>
                </Link>
              ))}
            </div>
          );
        })}
        <div
          ref={sentinelRef}
          className="scroll-sentinel"
          aria-hidden
          style={{ height: 1 }}
        />
      </div>
    </section>
  );
}
