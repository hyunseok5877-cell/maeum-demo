"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IS_DEMO, getDemoUser, getBookings } from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type Booking = {
  id: number;
  booking_number: string;
  status: string;
  scheduled_at: string | null;
  pax_count: number;
  sharing_mode?: string;
  has_chat?: boolean;
  group_pax_taken?: number;
  group_capacity?: number;
  experience_slug: string | null;
  experience_title: string;
  region_name: string;
  region_code: string;
  cover_image: string;
};

const SHARING_LABEL: Record<string, string> = {
  private: "단독 이용",
  friends_only: "지인만",
  open: "오픈 합석",
};

const STATUS_LABEL: Record<string, { ko: string; tone: string }> = {
  pending: { ko: "확정 대기", tone: "#8A7445" },
  confirmed: { ko: "확정", tone: "#1A1A1A" },
  in_progress: { ko: "진행 중", tone: "#1E3A8A" },
  completed: { ko: "완료", tone: "#166534" },
  cancelled: { ko: "취소", tone: "#9B1C1C" },
  refunded: { ko: "환불", tone: "#6B6B6B" },
};

export function BookingsClient() {
  const router = useRouter();
  const [items, setItems] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (IS_DEMO) {
      if (!getDemoUser()) {
        router.push("/login");
        return;
      }
      setItems(getBookings() as unknown as Booking[]);
      return;
    }
    fetch(`${API_BASE}/me/profile/`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          router.push("/login");
          return null;
        }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d) => d && setItems(d.recent_bookings ?? []));
  }, [router]);

  if (items === null)
    return (
      <p className="py-20 text-center text-ink-muted">예약 불러오는 중…</p>
    );

  const filtered =
    filter === "all" ? items : items.filter((b) => b.status === filter);

  if (items.length === 0)
    return (
      <div className="p-12 border border-line rounded-[16px] text-center">
        <p className="text-ink-muted text-[14px] leading-[1.8]">
          아직 예약 내역이 없습니다.
          <br />
          마음의 큐레이션을 첫 경험으로 시작해 보세요.
        </p>
        <Link
          href="/experiences"
          className="inline-flex mt-6 h-[48px] px-8 items-center bg-ink text-ink-inverse caption rounded-full"
        >
          경험 둘러보기
        </Link>
      </div>
    );

  return (
    <>
      {/* 상태 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["all", "confirmed", "in_progress", "completed", "cancelled"].map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-4 py-2 border rounded-full text-[13px] transition ${
                filter === s
                  ? "border-ink bg-ink text-ink-inverse"
                  : "border-line text-ink hover:border-ink"
              }`}
            >
              {s === "all" ? "전체" : STATUS_LABEL[s]?.ko ?? s}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((b) => {
          const status = STATUS_LABEL[b.status] ?? { ko: b.status, tone: "#1A1A1A" };
          const sharingTag = b.sharing_mode
            ? SHARING_LABEL[b.sharing_mode] ?? b.sharing_mode
            : "";
          return (
            <div key={b.id} className="trip-card flex flex-col">
              <Link
                href={
                  b.experience_slug ? `/experiences/${b.experience_slug}` : "#"
                }
                className="block"
              >
                <div
                  className="trip-thumb"
                  style={{
                    backgroundImage: b.cover_image
                      ? `url(${b.cover_image})`
                      : undefined,
                  }}
                >
                  <span
                    className="trip-region-pill"
                    style={{ backgroundColor: status.tone }}
                  >
                    {status.ko}
                  </span>
                </div>
                <div className="trip-body">
                  <div className="trip-title">
                    {b.experience_title || "(비공개 경험)"}
                  </div>
                  <div className="trip-meta">
                    {b.region_name && `${b.region_name} · `}
                    {b.scheduled_at
                      ? new Date(b.scheduled_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                    {b.pax_count > 0 && ` · ${b.pax_count}인`}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.12em] text-ink-muted">
                    <span>No. {b.booking_number}</span>
                    {sharingTag && (
                      <span
                        className="px-2 py-0.5 border border-line"
                        style={{ letterSpacing: "0.08em" }}
                      >
                        {sharingTag}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              {b.has_chat && (
                <Link
                  href={IS_DEMO ? `/bookings/demo/chat?b=${b.id}` : `/bookings/${b.id}/chat`}
                  className="mx-3 mb-3 mt-auto h-[40px] flex items-center justify-center border border-line text-[12px] tracking-[0.18em] hover:bg-ink hover:text-ink-inverse transition"
                >
                  채팅방 입장
                  {b.group_pax_taken && b.group_capacity ? (
                    <span className="ml-2 text-ink-muted">
                      ({b.group_pax_taken}/{b.group_capacity})
                    </span>
                  ) : null}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-ink-muted">
          해당 상태의 예약이 없습니다.
        </p>
      )}
    </>
  );
}
