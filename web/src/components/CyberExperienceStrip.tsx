"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ExperienceCard as ExpType } from "@/lib/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * carlesfaus.com/projects 패턴의 사이버·게이밍 스트립.
 * /experiences 페이지 검색바 바로 아래 섹션.
 *
 * - 세로 페이지 스크롤 → 섹션 pin + 가로 스트립 translateX (GSAP ScrollTrigger)
 * - 상단: 국가 코드 레일 (active 이동)
 * - 하단: 게이밍 프로그레스 바 + [n/total] 카운터 + AI 타이핑 좌표
 */

type Props = { items: ExpType[] };

type Spot = {
  key: string;
  label: string;
  country: string;
  city: string;
  lat: string;
  lng: string;
};

// 레일에 표시할 8개 도시 (순서 = 표시 순서)
const CITIES: Spot[] = [
  { key: "seoul",     label: "서울", country: "[대한민국]", city: "[서울]",   lat: "[북위 37°33'01\"]", lng: "[동경 126°58'41\"]" },
  { key: "jeju",      label: "제주", country: "[대한민국]", city: "[제주]",   lat: "[북위 33°29'58\"]", lng: "[동경 126°31'48\"]" },
  { key: "busan",     label: "부산", country: "[대한민국]", city: "[부산]",   lat: "[북위 35°10'47\"]", lng: "[동경 129°04'32\"]" },
  { key: "tongyeong", label: "통영", country: "[대한민국]", city: "[통영]",   lat: "[북위 34°51'15\"]", lng: "[동경 128°25'59\"]" },
  { key: "daejeon",   label: "대전", country: "[대한민국]", city: "[대전]",   lat: "[북위 36°21'02\"]", lng: "[동경 127°23'04\"]" },
  { key: "daegu",     label: "대구", country: "[대한민국]", city: "[대구]",   lat: "[북위 35°52'17\"]", lng: "[동경 128°36'04\"]" },
  { key: "gangwon",   label: "강원", country: "[대한민국]", city: "[강원]",   lat: "[북위 37°52'12\"]", lng: "[동경 127°43'33\"]" },
  { key: "gwangju",   label: "광주", country: "[대한민국]", city: "[광주]",   lat: "[북위 35°09'37\"]", lng: "[동경 126°51'05\"]" },
];

const FALLBACK: Spot = {
  key: "_",
  label: "—",
  country: "[대한민국]",
  city: "[대한민국]",
  lat: "[북위 37°00'00\"]",
  lng: "[동경 127°30'00\"]",
};

// source.unsplash.com은 deprecated → 카테고리별 안정적인 이미지로 폴백
const CATEGORY_IMG: Record<string, string> = {
  supercar:
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
  yacht:
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=1400&q=80",
  equestrian:
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1400&q=80",
  kpop:
    "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=1400&q=80",
};

const SLUG_IMG: Record<string, string> = {
  "lamborghini-seoul-urban-drive":
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
  "ferrari-sunset-namsan":
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
  "busan-haeundae-private-yacht-sunset":
    "https://images.unsplash.com/photo-1500622944204-b135684e99fd?auto=format&fit=crop&w=1400&q=80",
  "busan-night-yacht-champagne":
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1400&q=80",
  "jeju-private-equestrian-oreum":
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80",
  "jeju-beach-equestrian-sunset":
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1400&q=80",
  "kpop-seoul-private-studio-session":
    "https://images.unsplash.com/photo-1566024287286-457247b70310?auto=format&fit=crop&w=1400&q=80",
};

function resolveImage(exp: ExpType): string {
  // deprecated source.unsplash.com 은 이미지가 안 뜸 → 폴백
  const raw = exp.cover_image ?? "";
  if (raw && !raw.includes("source.unsplash.com")) return raw;
  if (SLUG_IMG[exp.slug]) return SLUG_IMG[exp.slug];
  const cat = exp.category?.code ?? "";
  return CATEGORY_IMG[cat] ?? CATEGORY_IMG.supercar;
}

function useTyping(target: string, speed = 30) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    setOut("");
    const id = setInterval(() => {
      i++;
      setOut(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, speed]);
  return out;
}

function toProjectCode(exp: ExpType, index: number): string {
  const slugCode = exp.slug
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8)
    .padEnd(8, "X");
  const num = String((exp.id * 13 + 4000) % 9999).padStart(4, "0");
  return `${slugCode} #${num} · ${String(index + 1).padStart(2, "0")}`;
}

export function CyberExperienceStrip({ items }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const total = Math.max(items.length, 1);
  const active = items[activeIdx];
  const activeRegion = active?.region?.code ?? "";
  const spot = CITIES.find((c) => c.key === activeRegion) ?? FALLBACK;

  // GSAP: 세로 스크롤 → 섹션 pin + 스트립 translateX
  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let ctx: gsap.Context | null = null;
    let st: ScrollTrigger | null = null;

    const setup = () => {
      ctx?.revert();
      const moveX = track.scrollWidth - window.innerWidth + 48; // 여유 패딩
      if (moveX <= 0) return;

      ctx = gsap.context(() => {
        const tween = gsap.to(track, {
          x: () => -moveX,
          ease: "none",
        });
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top+=72",     // 헤더 높이만큼 아래에서 pin
          end: () => `+=${moveX}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          animation: tween,
          onUpdate: (self) => {
            // ScrollTrigger.progress는 보통 0~1이지만 명시 클램핑 (resize·scrub overshoot 방어)
            const raw = Math.max(0, Math.min(1, self.progress));
            // 카드 N번이 fill N/total에 정확히 매핑되도록 round 사용
            const idx = total > 1
              ? Math.min(total - 1, Math.max(0, Math.round(raw * (total - 1))))
              : 0;
            // 게이지 길이 = (idx + 1) / total
            // 01/07 = 1/7 ≈ 14.3%, 07/07 = 7/7 = 100% — 카운터와 정확히 일치
            setProgress((idx + 1) / total);
            setActiveIdx(idx);
          },
        });
        stRef.current = st;
      }, section);
    };

    setup();
    const onResize = () => {
      ScrollTrigger.getAll().forEach((s) => s.kill());
      ctx?.revert();
      setup();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      st?.kill();
      ctx?.revert();
    };
  }, [items.length, total]);

  const typedCountry = useTyping(spot.country, 36);
  const typedCity = useTyping(spot.city, 36);
  const typedLat = useTyping(spot.lat, 20);
  const typedLng = useTyping(spot.lng, 20);

  const railActive = CITIES.findIndex((c) => c.key === spot.key);

  function jumpToCity(cityKey: string) {
    const idx = items.findIndex((it) => it.region?.code === cityKey);
    if (idx < 0) return; // 해당 도시 매물 없음
    const target = total > 1 ? idx / (total - 1) : 0;
    const st = stRef.current;
    if (!st) return;
    const y = st.start + (st.end - st.start) * target;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="cyber-strip"
      aria-label="사이버 경험 스트립"
    >
      <div className="cyber-strip__viewport">
        {/* 챕터 헤더 — 섹션 타이틀 (좌: 챕터 카운터 / 중앙: 큰 헤딩) */}
        <div className="cyber-strip__header">
          <div className="cyber-strip__chapter-tag">
            <span>CHAPITRE_{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className="cyber-strip__chapter-of">
              / {String(total).padStart(2, "0")}
            </span>
          </div>
          <div className="cyber-strip__chapter-name">
            <span className="cyber-strip__chapter-city">이번달 인기 큐레이션</span>
            <span className="cyber-strip__chapter-en">
              CETTE SEMAINE · MONTHLY CURATION
            </span>
          </div>
          <div aria-hidden className="cyber-strip__chapter-spacer" />
        </div>

        {/* 도시 레일 — 클릭 시 해당 구역으로 점프 */}
        <div className="cyber-strip__rail">
          {CITIES.map((c, i) => {
            const isActive = i === railActive;
            const hasItems = items.some((it) => it.region?.code === c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => jumpToCity(c.key)}
                disabled={!hasItems}
                className={`cyber-strip__rail-cell ${isActive ? "is-active" : ""} ${
                  !hasItems ? "is-disabled" : ""
                }`}
                aria-label={`${c.label}로 이동`}
              >
                {isActive && (
                  <span aria-hidden className="cyber-strip__caret">▼</span>
                )}
                <span>[{c.label}]</span>
              </button>
            );
          })}
        </div>

        {/* 가로 스트립 (GSAP translateX 대상) */}
        <div className="cyber-strip__stage">
          <div className="cyber-strip__track" ref={trackRef}>
            {items.map((exp, i) => {
              const isActive = i === activeIdx;
              const img = resolveImage(exp);
              return (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp.slug}`}
                  className={`cyber-strip__card ${isActive ? "is-active" : ""}`}
                >
                  <div className="cyber-strip__code">
                    <span className="cyber-strip__arrow">▶</span>
                    {toProjectCode(exp, i)}
                  </div>
                  <div
                    className="cyber-strip__img"
                    style={{ backgroundImage: `url("${img}")` }}
                  />
                  <div className="cyber-strip__title">
                    <span className="cyber-strip__title-text">{exp.title_ko}</span>
                    <span className="cyber-strip__sub">
                      _{String(exp.id).padStart(3, "0")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 하단 프로그레스 + 좌표 */}
        <div className="cyber-strip__footer">
          <div className="cyber-strip__bar">
            <span className="cyber-strip__arrows">▼▼▼</span>
            <div className="cyber-strip__track-bar">
              <div
                className="cyber-strip__fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="cyber-strip__counter">
              [{String(activeIdx + 1).padStart(2, "0")}/
              {String(total).padStart(2, "0")}]
            </span>
          </div>

          <div className="cyber-strip__coord" aria-hidden>
            <span className="cyber-strip__coord-head">▼▼▼</span>
            <span className="cyber-strip__coord-line">{typedCountry}</span>
            <span className="cyber-strip__coord-line">{typedCity}</span>
            <span className="cyber-strip__coord-coords">
              <span>{typedLat}</span>
              <span className="cyber-strip__dot">■</span>
              <span>
                {typedLng}
                <span className="cyber-caret" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
