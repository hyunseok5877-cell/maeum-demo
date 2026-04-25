"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IS_DEMO,
  getDemoUser,
  isInWishlist,
  toggleWishlist as demoToggleWish,
  createBooking as demoCreateBooking,
} from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type Props = {
  slug: string;
  title: string;
  finalPrice: number;
  minPax?: number;
  maxPax?: number;
};

type SharingMode = "private" | "friends_only" | "open";
type OpenGroup = {
  id: number;
  pax_taken: number;
  capacity: number;
  remaining: number;
  members: {
    display_name: string;
    gender: string;
    age_range: string;
    occupation: string;
    verified: boolean;
  }[];
};
type Availability = {
  capacity: number;
  private_multiplier: number;
  open_groups: OpenGroup[];
};

const PRIVATE_MULTIPLIER = 2.5;
const SHARING_OPTIONS: { value: SharingMode; label: string; hint: string }[] = [
  {
    value: "open",
    label: "오픈 합석",
    hint: "같은 회차의 다른 멤버와 자연스럽게 연결돼요. (정원 내 추가 합류 가능)",
  },
  {
    value: "friends_only",
    label: "지인만 동반",
    hint: "본인 일행만으로 회차를 채웁니다. 외부 합류는 받지 않아요.",
  },
  {
    value: "private",
    label: "단독 이용 (전세)",
    hint: "회차 자체를 통째로 잠가 단독 운영. 가격 2.5배 프리미엄이 붙습니다.",
  },
];

const GENDER_LABEL: Record<string, string> = {
  male: "남",
  female: "여",
  other: "기타",
  na: "비공개",
};
const AGE_LABEL: Record<string, string> = {
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s": "50대",
  "60plus": "60대+",
  na: "비공개",
};

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLongDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
}

export function ExperienceActions({
  slug,
  title,
  finalPrice,
  minPax = 1,
  maxPax = 8,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 검색바에서 넘어온 값 (?date / ?adults+teens+kids)
  const searchDate = searchParams.get("date") || "";
  const searchPax =
    Number(searchParams.get("adults") || 0) +
    Number(searchParams.get("teens") || 0) +
    Number(searchParams.get("kids") || 0);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  // 예약 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState<string>(searchDate || todayPlus(14));
  const [pax, setPax] = useState<number>(
    Math.max(minPax, Math.min(maxPax, searchPax || minPax))
  );
  const [sharingMode, setSharingMode] = useState<SharingMode>("open");
  const [confirmed, setConfirmed] = useState(false);
  const [bookBusy, setBookBusy] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);

  // 인증 + 위시 초기 상태
  useEffect(() => {
    if (IS_DEMO) {
      setAuthed(!!getDemoUser());
      setInWishlist(isInWishlist(slug));
      return;
    }
    let alive = true;
    fetch(`${API_BASE}/auth/me/`, { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        setAuthed(!!d);
        if (d) {
          fetch(`${API_BASE}/curation/wishlist/check/${slug}/`, {
            credentials: "include",
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => alive && j && setInWishlist(!!j.in_wishlist));
        }
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  // 모달 열릴 때 ESC + body scroll lock
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const total = useMemo(() => {
    const base = finalPrice * pax;
    return sharingMode === "private" ? Math.round(base * PRIVATE_MULTIPLIER) : base;
  }, [finalPrice, pax, sharingMode]);
  const minDate = todayPlus(1);

  // 모달 열려있고 날짜 바뀔 때마다 매칭 가능성 조회
  useEffect(() => {
    if (!modalOpen || !date) return;
    if (IS_DEMO) {
      setAvailability({
        capacity: maxPax,
        private_multiplier: PRIVATE_MULTIPLIER,
        open_groups: [],
      });
      return;
    }
    let alive = true;
    fetch(
      `${API_BASE}/bookings/availability/?experience_slug=${encodeURIComponent(slug)}&date=${date}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setAvailability(j));
    return () => {
      alive = false;
    };
  }, [modalOpen, date, slug, maxPax]);

  async function toggleWishlist() {
    if (authed === false) {
      if (confirm("위시리스트는 로그인 후 이용하실 수 있습니다. 로그인하시겠어요?")) {
        router.push("/login");
      }
      return;
    }
    setWishBusy(true);
    try {
      if (IS_DEMO) {
        const next = demoToggleWish(slug);
        setInWishlist(next);
        return;
      }
      const method = inWishlist ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE}/curation/wishlist/toggle/`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ experience_slug: slug }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      setInWishlist(!!j.in_wishlist);
    } catch (e) {
      alert("위시리스트 처리 실패: " + String(e));
    } finally {
      setWishBusy(false);
    }
  }

  function openBookingModal() {
    if (authed === false) {
      if (confirm("예약은 로그인 후 가능합니다. 로그인하시겠어요?")) {
        router.push("/login");
      }
      return;
    }
    // 모달 열 때마다 confirm 체크박스 리셋 (사용자가 매번 명시적으로 확인하도록)
    setConfirmed(false);
    setModalOpen(true);
  }

  async function submitBooking() {
    if (!confirmed) return;
    setBookBusy(true);
    try {
      let j: {
        id: number;
        booking_number: string;
        sharing_mode: string;
        forced_private: boolean;
        total_amount: number;
      };
      if (IS_DEMO) {
        const b = demoCreateBooking({
          experience_slug: slug,
          experience_title: title,
          cover_image: "",
          region_name: "",
          region_code: "",
          scheduled_at: `${date}T10:00:00+09:00`,
          pax_count: pax,
          sharing_mode: sharingMode,
          unit_price: finalPrice,
          capacity: maxPax,
        });
        j = {
          id: b.id,
          booking_number: b.booking_number,
          sharing_mode: b.sharing_mode,
          forced_private: pax > maxPax,
          total_amount: b.total_amount,
        };
      } else {
        const res = await fetch(`${API_BASE}/bookings/demo/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            experience_slug: slug,
            pax_count: pax,
            scheduled_at: `${date}T10:00:00+09:00`,
            sharing_mode: sharingMode,
          }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        j = await res.json();
      }
      setModalOpen(false);
      const modeLabel =
        j.sharing_mode === "open"
          ? "오픈 합석"
          : j.sharing_mode === "friends_only"
          ? "지인만 동반"
          : "단독 이용";
      const forced = j.forced_private && sharingMode !== "private"
        ? "\n(정원 초과로 단독 이용으로 자동 전환됨)"
        : "";
      alert(
        `예약 완료\n\n` +
          `예약번호: ${j.booking_number}\n` +
          `일정: ${formatLongDate(date)}\n` +
          `인원: ${pax}명 · ${modeLabel}\n` +
          `금액: ${Number(j.total_amount).toLocaleString("ko-KR")}원${forced}\n\n` +
          `채팅방이 자동 개설되었습니다. 마이페이지 > 예약 내역에서 확인하세요.`
      );
      router.push(IS_DEMO ? `/bookings/demo/chat?b=${j.id}` : `/bookings/${j.id}/chat`);
    } catch (e) {
      alert("예약 생성 실패: " + String(e));
    } finally {
      setBookBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={openBookingModal}
          className="block w-full h-[52px] bg-ink text-ink-inverse font-medium flex items-center justify-center hover:bg-black transition"
        >
          예약하기 (데모)
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={wishBusy}
            aria-pressed={inWishlist}
            className={`flex-1 h-[44px] border flex items-center justify-center gap-2 text-[14px] transition ${
              inWishlist
                ? "border-brass bg-[color:var(--color-brass-soft)] text-ink"
                : "border-line text-ink-muted hover:border-ink hover:text-ink"
            } disabled:opacity-50`}
          >
            <span aria-hidden style={{ color: inWishlist ? "var(--color-brass)" : "inherit" }}>
              {inWishlist ? "♥" : "♡"}
            </span>
            <span>{inWishlist ? "위시리스트에 담김" : "위시리스트 담기"}</span>
          </button>
          <a
            href="/request-curation"
            className="flex-1 h-[44px] border border-line text-ink-muted hover:border-ink hover:text-ink transition flex items-center justify-center text-[14px]"
          >
            큐레이터 문의
          </a>
        </div>
      </div>

      {/* 예약 확정 모달 — 비행기 예약 사고 방지: 날짜·인원·금액을 큰 글씨로 재표시 + 이중 확인 */}
      {modalOpen && (
        <div
          className="legal-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="예약 확정"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="legal-modal" style={{ maxWidth: 560 }}>
            <div className="legal-modal__head">
              <h2 className="legal-modal__title">예약 정보 최종 확인</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="닫기"
                className="legal-modal__close"
              >
                ×
              </button>
            </div>
            <div className="legal-modal__body" style={{ padding: 28 }}>
              <p className="caption text-brass mb-2">— Confirmation</p>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  letterSpacing: "-0.01em",
                  color: "var(--color-ink)",
                  margin: "4px 0 24px",
                  fontWeight: 500,
                }}
              >
                {title}
              </h3>

              {/* 큰 날짜 디스플레이 — 사고 방지의 핵심 */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "2px solid var(--color-ink)",
                  padding: "20px 24px",
                  marginBottom: 16,
                }}
              >
                <p className="caption text-ink-muted" style={{ marginBottom: 6 }}>
                  예약 일정
                </p>
                <p
                  style={{
                    fontSize: 26,
                    lineHeight: 1.2,
                    color: "var(--color-ink)",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {formatLongDate(date)}
                </p>
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setConfirmed(false); // 변경 시 재확인 강제
                  }}
                  className="mt-3 w-full px-3 py-2 border border-line text-[14px]"
                  aria-label="예약 일정 변경"
                />
                <p className="caption text-ink-muted mt-2">
                  변경하시면 아래 확인을 다시 체크해 주세요.
                </p>
              </div>

              {/* 합석/단독 모드 선택 */}
              <div style={{ marginBottom: 16 }}>
                <p className="caption text-ink-muted" style={{ marginBottom: 8 }}>
                  자리 오픈 방식
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SHARING_OPTIONS.map((opt) => {
                    const active = sharingMode === opt.value;
                    return (
                      <label
                        key={opt.value}
                        style={{
                          display: "block",
                          padding: "12px 14px",
                          background: active ? "rgba(138, 116, 69, 0.10)" : "#FFFFFF",
                          border: `1px solid ${
                            active ? "var(--color-brass)" : "var(--color-line)"
                          }`,
                          cursor: "pointer",
                          transition: "all 200ms var(--ease-cinema)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <input
                            type="radio"
                            name="sharing-mode"
                            value={opt.value}
                            checked={active}
                            onChange={() => {
                              setSharingMode(opt.value);
                              setConfirmed(false);
                            }}
                            style={{ accentColor: "var(--color-ink)" }}
                          />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                            {opt.label}
                            {opt.value === "private" && (
                              <span style={{ marginLeft: 8, color: "var(--color-brass)", fontSize: 12 }}>
                                ×{PRIVATE_MULTIPLIER}
                              </span>
                            )}
                          </span>
                        </div>
                        <p style={{ marginTop: 6, marginLeft: 26, fontSize: 12, color: "var(--color-ink-muted)", lineHeight: 1.5 }}>
                          {opt.hint}
                        </p>
                      </label>
                    );
                  })}
                </div>

                {/* 합석 미리보기 */}
                {sharingMode === "open" && availability && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "12px 14px",
                      background: "var(--color-muted-bg)",
                      border: "1px solid var(--color-line)",
                      fontSize: 13,
                      color: "var(--color-ink)",
                    }}
                  >
                    {availability.open_groups.length === 0 ? (
                      <span style={{ color: "var(--color-ink-muted)" }}>
                        이 날짜에 합석 가능한 그룹이 아직 없습니다. 첫 멤버가 됩니다.
                      </span>
                    ) : (
                      <>
                        <p className="caption text-ink-muted" style={{ marginBottom: 6 }}>
                          현재 신청 중 (익명)
                        </p>
                        {availability.open_groups.map((g) => (
                          <div key={g.id} style={{ marginBottom: 8 }}>
                            <p style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                              {g.pax_taken}/{g.capacity}명 · 잔여 {g.remaining}명
                            </p>
                            <ul style={{ marginTop: 4, paddingLeft: 0, listStyle: "none" }}>
                              {g.members.map((m, i) => (
                                <li key={i} style={{ fontSize: 13, lineHeight: 1.7 }}>
                                  · {GENDER_LABEL[m.gender] ?? m.gender} ·{" "}
                                  {AGE_LABEL[m.age_range] ?? m.age_range}
                                  {m.occupation && ` · ${m.occupation}`}
                                  {m.verified && (
                                    <span style={{ marginLeft: 6, color: "var(--color-success)", fontSize: 11 }}>
                                      ✓ 검증
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 인원 + 금액 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--color-line)",
                    padding: "14px 16px",
                  }}
                >
                  <p className="caption text-ink-muted">인원</p>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPax((p) => Math.max(minPax, p - 1));
                        setConfirmed(false);
                      }}
                      disabled={pax <= minPax}
                      className="w-8 h-8 border border-line text-ink disabled:opacity-30"
                      aria-label="인원 감소"
                    >
                      −
                    </button>
                    <span style={{ fontSize: 22, fontWeight: 600 }}>{pax}명</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPax((p) => Math.min(maxPax, p + 1));
                        setConfirmed(false);
                      }}
                      disabled={pax >= maxPax}
                      className="w-8 h-8 border border-line text-ink disabled:opacity-30"
                      aria-label="인원 증가"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--color-line)",
                    padding: "14px 16px",
                  }}
                >
                  <p className="caption text-ink-muted">결제 금액</p>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      marginTop: 8,
                    }}
                  >
                    ₩{total.toLocaleString("ko-KR")}
                  </p>
                  <p className="caption text-ink-muted mt-1">
                    {finalPrice.toLocaleString("ko-KR")}원 × {pax}
                    {sharingMode === "private" && ` × ${PRIVATE_MULTIPLIER} (단독)`}
                  </p>
                </div>
              </div>

              {/* 이중 확인 체크박스 */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  background: confirmed ? "rgba(138, 116, 69, 0.10)" : "#FFFFFF",
                  border: `1px solid ${
                    confirmed ? "var(--color-brass)" : "var(--color-line)"
                  }`,
                  cursor: "pointer",
                  transition: "all 200ms var(--ease-cinema)",
                }}
              >
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    accentColor: "var(--color-ink)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-ink)" }}>
                  위 일정 <strong>{formatLongDate(date)}</strong> · {pax}명 ·{" "}
                  <strong>{total.toLocaleString("ko-KR")}원</strong> 으로 예약 진행에 동의합니다.
                </span>
              </label>

              <p className="caption text-ink-muted mt-4">
                실제 결제는 발생하지 않는 데모 예약입니다. 일정 변경·취소는 마이페이지 &gt; 예약
                내역에서 가능합니다.
              </p>
            </div>
            <div className="legal-modal__foot" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-6 h-[44px] border border-line text-ink hover:bg-ink hover:text-ink-inverse transition text-[13px] tracking-[0.18em]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitBooking}
                disabled={!confirmed || bookBusy}
                className="legal-modal__ok"
                style={{ opacity: confirmed && !bookBusy ? 1 : 0.4, cursor: confirmed ? "pointer" : "not-allowed" }}
              >
                {bookBusy ? "예약 처리 중…" : "예약 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
