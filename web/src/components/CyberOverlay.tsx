"use client";


import { useEffect, useRef, useState } from "react";

/**
 * carlesfaus.com/projects 패턴의 게이밍·사이버틱 오버레이.
 * - 상단: 국가 코드 레일 (scroll 진행 따라 active 이동 + 타이핑)
 * - 하단: ▼▼▼ + progress bar + [n/total] 카운터
 * - 우하단: AI 타이핑 좌표 패널 (현재 지역 자동 교체)
 *
 * 기존 InfiniteLoopHero 는 건드리지 않고 위에 fixed 레이어로 얹는다.
 */

type Spot = {
  code: string;   // 국가 코드 브래킷
  country: string; // 한글 국가명
  city: string;
  lat: string;    // "남위 32°57'27\""
  lng: string;    // "서경 60°38'22\""
};

const SPOTS: Spot[] = [
  { code: "KR",  country: "[대한민국]", city: "[서울]",    lat: "[북위 37°33'01\"]", lng: "[동경 126°58'41\"]" },
  { code: "KR2", country: "[대한민국]", city: "[부산]",    lat: "[북위 35°10'47\"]", lng: "[동경 129°04'32\"]" },
  { code: "KR3", country: "[대한민국]", city: "[제주]",    lat: "[북위 33°29'58\"]", lng: "[동경 126°31'48\"]" },
  { code: "JP",  country: "[일본]",     city: "[도쿄]",    lat: "[북위 35°41'23\"]", lng: "[동경 139°41'32\"]" },
  { code: "FR",  country: "[프랑스]",   city: "[파리]",    lat: "[북위 48°51'23\"]", lng: "[동경 002°21'07\"]" },
  { code: "IT",  country: "[이탈리아]", city: "[밀라노]",  lat: "[북위 45°27'51\"]", lng: "[동경 009°11'23\"]" },
  { code: "AE",  country: "[아랍에미리트]", city: "[두바이]", lat: "[북위 25°12'16\"]", lng: "[동경 055°16'14\"]" },
  { code: "MC",  country: "[모나코]",   city: "[몬테카를로]", lat: "[북위 43°44'22\"]", lng: "[동경 007°25'24\"]" },
  { code: "CH",  country: "[스위스]",   city: "[장크트모리츠]", lat: "[북위 46°29'50\"]", lng: "[동경 009°50'09\"]" },
];

const TOTAL = 87;

function useTyping(target: string, speed = 32) {
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

export function CyberOverlay() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0 ~ 1
  const [counter, setCounter] = useState(1);
  const [coordVisible, setCoordVisible] = useState(false);
  const frame = useRef<number>(0);

  useEffect(() => {
    function onScroll() {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const p = Math.min(1, Math.max(0, y / max));
        setProgress(p);

        // 스크롤 진행도에 따라 0..TOTAL-1 카운터
        const c = Math.min(TOTAL, Math.max(1, Math.floor(p * TOTAL) + 1));
        setCounter(c);

        // active 국가 index — SPOTS 배열 순환
        const idx = Math.floor(p * SPOTS.length * 3) % SPOTS.length;
        setActiveIdx(idx);

        // 첫 스크롤 이후 좌표 패널 등장
        if (y > 120) setCoordVisible(true);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const active = SPOTS[activeIdx];
  const typedCountry = useTyping(active.country, 40);
  const typedCity = useTyping(active.city, 40);
  const typedLat = useTyping(active.lat, 22);
  const typedLng = useTyping(active.lng, 22);

  return (
    <>
      {/* ─────────────────────────────────────
          상단 국가 레일 (헤더 아래, 히어로 위)
         ───────────────────────────────────── */}
      <div
        aria-hidden
        className="cyber-rail"
        style={{ pointerEvents: "none" }}
      >
        <div className="cyber-rail__inner">
          {SPOTS.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={s.code + i}
                className={`cyber-rail__cell ${isActive ? "is-active" : ""}`}
              >
                {isActive && (
                  <span aria-hidden className="cyber-rail__caret">▼</span>
                )}
                <span className="cyber-rail__code">[{s.code}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────
          우하단 좌표 패널 (AI 타이핑)
         ───────────────────────────────────── */}
      <div
        aria-hidden
        className={`cyber-coord ${coordVisible ? "is-visible" : ""}`}
      >
        <div className="cyber-coord__head">▼ ▼ ▼</div>
        <div className="cyber-coord__line">
          {typedCountry}
          <span className="cyber-caret" />
        </div>
        <div className="cyber-coord__line">{typedCity}</div>
        <div className="cyber-coord__coords">
          <span>{typedLat}</span>
          <span className="cyber-coord__dot">■</span>
          <span>{typedLng}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────
          하단 게이밍 프로그레스 바
         ───────────────────────────────────── */}
      <div aria-hidden className="cyber-bar">
        <div className="cyber-bar__arrows">▼▼▼</div>
        <div className="cyber-bar__track">
          <div
            className="cyber-bar__fill"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="cyber-bar__cursor"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
        <div className="cyber-bar__counter">
          [{String(counter).padStart(2, "0")}/{TOTAL}]
        </div>
      </div>
    </>
  );
}
