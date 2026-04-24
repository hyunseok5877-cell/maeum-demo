"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

interface RecentBooking {
  id: number;
  masked_id: string;
  experience_title: string;
  experience_slug: string;
  region_ko: string;
  created_at: string;
}

function relativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.max(1, Math.round((now - created) / 60000));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}일 전`;
  return `${Math.round(diffD / 7)}주 전`;
}

// 간단한 해시 → 팔레트 인덱스
function avatarTone(seed: string) {
  const tones = [
    "bg-[#1a1a1a] text-[#FAFAF8]",
    "bg-[#5C0E0E] text-[#FAFAF8]",
    "bg-[#0E1B3A] text-[#FAFAF8]",
    "bg-[#1F3A2E] text-[#FAFAF8]",
    "bg-[#8A7445] text-[#FAFAF8]",
  ];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return tones[h % tones.length];
}

export function RecentBookingsTicker() {
  const [items, setItems] = useState<RecentBooking[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("maeum_ticker_dismissed") === "1") {
      setDismissed(true);
      return;
    }
    fetch(`${API_BASE}/bookings/recent/`)
      .then((r) => r.json())
      .then((d) => setItems(d.results ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 260);
    }, 4500);
    return () => clearInterval(t);
  }, [items.length]);

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem("maeum_ticker_dismissed", "1");
    }
    setDismissed(true);
  }

  if (dismissed || items.length === 0) return null;
  const current = items[idx];
  const initial = current.masked_id.charAt(0).toUpperCase();

  return (
    <div
      className="fixed bottom-6 left-6 z-40 max-w-[380px]"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 py-3 pl-3 pr-4 bg-surface border border-line shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-[family-name:var(--font-serif)] text-[18px] ${avatarTone(current.masked_id)}`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ink leading-tight truncate">
            <span className="font-medium">{current.masked_id}</span>
            <span className="text-ink-muted">
              {current.region_ko && ` · ${current.region_ko}`}
            </span>
          </p>
          <p className="text-[13px] text-ink-muted leading-tight truncate mt-0.5">
            {current.experience_title} · {relativeTime(current.created_at)} 예약
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="text-ink-muted hover:text-ink transition text-[14px] px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
