"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type RegionLite = {
  code: string;
  name_ko: string;
  country: { name_ko: string };
};

type Pane = "region" | "date" | "guests" | null;

const REGIONS: RegionLite[] = [
  { code: "seoul", name_ko: "서울", country: { name_ko: "대한민국" } },
  { code: "busan", name_ko: "부산", country: { name_ko: "대한민국" } },
  { code: "jeju", name_ko: "제주", country: { name_ko: "대한민국" } },
  { code: "gangwon", name_ko: "강원", country: { name_ko: "대한민국" } },
  { code: "gyeonggi", name_ko: "경기", country: { name_ko: "대한민국" } },
  { code: "jeonnam", name_ko: "전남", country: { name_ko: "대한민국" } },
  { code: "gyeongbuk", name_ko: "경북", country: { name_ko: "대한민국" } },
  { code: "incheon", name_ko: "인천", country: { name_ko: "대한민국" } },
];

const ACTIVE_REGIONS = new Set(["seoul", "busan", "jeju"]);

function fmtDate(d: Date) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}월 ${day}일`;
}

function buildCalendar(year: number, month: number) {
  // month: 0~11
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDow = first.getDay(); // 0(Sun)~6(Sat)
  const total = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ExperienceSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initRegion = searchParams.get("region") ?? "";
  const initAdults = Number(searchParams.get("adults") ?? "2");
  const initTeens = Number(searchParams.get("teens") ?? "0");
  const initKids = Number(searchParams.get("kids") ?? "0");
  const initDate = searchParams.get("date") ?? "";

  const [pane, setPane] = useState<Pane>(null);
  const [region, setRegion] = useState<string>(initRegion);
  const [date, setDate] = useState<string>(initDate); // "YYYY-MM-DD"
  const [adults, setAdults] = useState<number>(initAdults);
  const [teens, setTeens] = useState<number>(initTeens);
  const [kids, setKids] = useState<number>(initKids);

  const now = new Date();
  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());

  const rootRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭 시 패널 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setPane(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPane(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const regionLabel = region
    ? REGIONS.find((r) => r.code === region)?.name_ko ?? "지역 선택"
    : "어디로 가시나요?";

  const dateLabel = date
    ? fmtDate(new Date(date))
    : "일정 추가";

  const totalGuests = adults + teens + kids;
  const guestsLabel =
    totalGuests > 0
      ? `성인 ${adults}${teens ? ` · 청소년 ${teens}` : ""}${
          kids ? ` · 아동 ${kids}` : ""
        }`
      : "인원 추가";

  function submit() {
    const qs = new URLSearchParams();
    if (region) qs.set("region", region);
    if (date) qs.set("date", date);
    if (adults) qs.set("adults", String(adults));
    if (teens) qs.set("teens", String(teens));
    if (kids) qs.set("kids", String(kids));
    // 기존 카테고리 필터 보존
    const cat = searchParams.get("category");
    if (cat) qs.set("category", cat);

    // 최근 검색에 지역명 저장 (마이페이지에서 노출)
    if (region) {
      const label = REGIONS.find((r) => r.code === region)?.name_ko;
      if (label) {
        try {
          const raw = localStorage.getItem("maeum:recentSearches");
          const arr: string[] = raw ? JSON.parse(raw) : [];
          const next = [label, ...arr.filter((x) => x !== label)].slice(0, 8);
          localStorage.setItem("maeum:recentSearches", JSON.stringify(next));
        } catch {}
      }
    }

    const s = qs.toString();
    router.push(s ? `/experiences?${s}` : "/experiences");
    setPane(null);
  }

  function gotoPrevMonth() {
    if (calMonth === 0) {
      setCalYear(calYear - 1);
      setCalMonth(11);
    } else setCalMonth(calMonth - 1);
  }
  function gotoNextMonth() {
    if (calMonth === 11) {
      setCalYear(calYear + 1);
      setCalMonth(0);
    } else setCalMonth(calMonth + 1);
  }

  const cells = buildCalendar(calYear, calMonth);

  return (
    <div ref={rootRef} className="search-bar-root">
      {/* 3-button bar */}
      <div className="search-bar">
        <button
          type="button"
          className={`search-seg ${pane === "region" ? "is-open" : ""}`}
          onClick={() => setPane(pane === "region" ? null : "region")}
          aria-expanded={pane === "region"}
        >
          <span className="seg-label">지역</span>
          <span className="seg-value">{regionLabel}</span>
        </button>

        <span className="search-divider" />

        <button
          type="button"
          className={`search-seg ${pane === "date" ? "is-open" : ""}`}
          onClick={() => setPane(pane === "date" ? null : "date")}
          aria-expanded={pane === "date"}
        >
          <span className="seg-label">일정</span>
          <span className="seg-value">{dateLabel}</span>
        </button>

        <span className="search-divider" />

        <button
          type="button"
          className={`search-seg ${pane === "guests" ? "is-open" : ""}`}
          onClick={() => setPane(pane === "guests" ? null : "guests")}
          aria-expanded={pane === "guests"}
        >
          <span className="seg-label">인원</span>
          <span className="seg-value">{guestsLabel}</span>
        </button>

        <button
          type="button"
          className="search-submit"
          onClick={submit}
          aria-label="경험 검색"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>검색</span>
        </button>
      </div>

      {/* Popover panes */}
      {pane === "region" && (
        <div className="search-pane" role="dialog" aria-label="지역 선택">
          <div className="pane-header">
            <p className="caption text-ink-muted">KOREA · 지도 기반 지역</p>
          </div>
          <div className="region-grid">
            {REGIONS.map((r) => {
              const active = ACTIVE_REGIONS.has(r.code);
              const selected = region === r.code;
              return (
                <button
                  key={r.code}
                  type="button"
                  disabled={!active}
                  onClick={() => {
                    if (active) {
                      setRegion(r.code);
                      setPane("date");
                    }
                  }}
                  className={`region-card ${selected ? "is-selected" : ""} ${
                    active ? "" : "is-disabled"
                  }`}
                >
                  <span className="region-name">{r.name_ko}</span>
                  <span className="region-sub">
                    {active ? "운영 중" : "Coming Soon"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="region-mapnote">
            <span className="caption text-ink-muted">
              운영 지역만 선택 가능. 그 외 국가는 추후 순차 오픈.
            </span>
            {region && (
              <button
                type="button"
                className="pane-clear"
                onClick={() => setRegion("")}
              >
                선택 해제
              </button>
            )}
          </div>
        </div>
      )}

      {pane === "date" && (
        <div className="search-pane" role="dialog" aria-label="일정 선택">
          <div className="cal-head">
            <button
              type="button"
              onClick={gotoPrevMonth}
              className="cal-nav"
              aria-label="이전 달"
            >
              ‹
            </button>
            <span className="cal-title">
              {calYear}년 {calMonth + 1}월
            </span>
            <button
              type="button"
              onClick={gotoNextMonth}
              className="cal-nav"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
          <div className="cal-grid">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <span key={d} className="cal-dow">
                {d}
              </span>
            ))}
            {cells.map((c, i) => {
              if (c === null) return <span key={i} className="cal-cell" />;
              const iso = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
                c
              ).padStart(2, "0")}`;
              const thisDay = new Date(calYear, calMonth, c);
              const isPast =
                thisDay < new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const selected = date === iso;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    setDate(iso);
                    setPane("guests");
                  }}
                  className={`cal-cell ${selected ? "is-selected" : ""} ${
                    isPast ? "is-past" : ""
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="region-mapnote">
            {date && (
              <button
                type="button"
                className="pane-clear"
                onClick={() => setDate("")}
              >
                날짜 해제
              </button>
            )}
          </div>
        </div>
      )}

      {pane === "guests" && (
        <div className="search-pane" role="dialog" aria-label="인원 선택">
          <GuestRow
            label="성인"
            sub="만 18세 이상"
            value={adults}
            min={1}
            onChange={setAdults}
          />
          <GuestRow
            label="청소년"
            sub="만 13 – 17세"
            value={teens}
            min={0}
            onChange={setTeens}
          />
          <GuestRow
            label="아동"
            sub="만 0 – 12세"
            value={kids}
            min={0}
            onChange={setKids}
          />
          <div className="pane-footer">
            <button
              type="button"
              className="pane-clear"
              onClick={() => {
                setAdults(2);
                setTeens(0);
                setKids(0);
              }}
            >
              초기화
            </button>
            <button type="button" className="pane-submit" onClick={submit}>
              적용하고 검색
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GuestRow({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="guest-row">
      <div>
        <span className="guest-label">{label}</span>
        <span className="guest-sub">{sub}</span>
      </div>
      <div className="guest-counter">
        <button
          type="button"
          aria-label={`${label} 감소`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="guest-value">{value}</span>
        <button
          type="button"
          aria-label={`${label} 증가`}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
