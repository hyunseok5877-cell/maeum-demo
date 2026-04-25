"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IS_DEMO,
  getDemoUser,
  getBooking,
  getChatMessages,
  postChatMessage,
} from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";
const POLL_MS = 4000;

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

type Member = {
  booking_id: number;
  pax: number;
  display_name: string;
  gender: string;
  age_range: string;
  occupation: string;
  verified: boolean;
  is_me: boolean;
};
type RoomDetail = {
  room_id: number;
  title: string;
  sharing_mode: string;
  sharing_label: string;
  pax_taken: number;
  capacity: number;
  experience: { slug: string; title: string };
  scheduled_date: string;
  members: Member[];
};
type Message = {
  id: number;
  kind: "user" | "system";
  body: string;
  display_name: string;
  is_me: boolean;
  created_at: string;
};

export function ChatRoomClient({ bookingId: bookingIdProp }: { bookingId: number }) {
  const router = useRouter();
  const params = useSearchParams();
  // Demo: query string ?b=<id>가 우선 (정적 export 시 [id]는 placeholder)
  const queryId = Number(params.get("b") || 0);
  const bookingId = queryId || bookingIdProp;

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastIdRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 초기 로드: 방 정보 + 메시지
  useEffect(() => {
    if (IS_DEMO) {
      const u = getDemoUser();
      if (!u) {
        router.push("/login");
        return;
      }
      const b = getBooking(bookingId);
      if (!b) {
        setError("채팅방을 찾을 수 없습니다.");
        return;
      }
      const SHARING_LBL: Record<string, string> = {
        private: "단독 이용",
        friends_only: "지인만 동반",
        open: "오픈 합석",
      };
      setRoom({
        room_id: b.session_group_id,
        title: `${b.experience_title} · ${b.scheduled_at.slice(0, 10)}`,
        sharing_mode: b.sharing_mode,
        sharing_label: SHARING_LBL[b.sharing_mode] ?? b.sharing_mode,
        pax_taken: b.group_pax_taken,
        capacity: b.group_capacity,
        experience: { slug: b.experience_slug, title: b.experience_title },
        scheduled_date: b.scheduled_at.slice(0, 10),
        members: [
          {
            booking_id: b.id,
            pax: b.pax_count,
            display_name: u.nickname || "나",
            gender: "na",
            age_range: "na",
            occupation: "",
            verified: !!u.verified_at,
            is_me: true,
          },
        ],
      });
      const msgs = getChatMessages(bookingId) as Message[];
      setMessages(msgs);
      if (msgs.length) lastIdRef.current = msgs[msgs.length - 1].id;
      return;
    }
    let alive = true;
    fetch(`${API_BASE}/bookings/${bookingId}/chat/`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          router.push("/login");
          return null;
        }
        if (r.status === 404) {
          setError("채팅방을 찾을 수 없습니다.");
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (!alive || !d) return;
        setRoom(d);
      });

    fetch(`${API_BASE}/bookings/${bookingId}/chat/messages/`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        const msgs: Message[] = d.results || [];
        setMessages(msgs);
        if (msgs.length) lastIdRef.current = msgs[msgs.length - 1].id;
      });

    return () => {
      alive = false;
    };
  }, [bookingId, router]);

  // 폴링 (demo는 비활성)
  useEffect(() => {
    if (error || IS_DEMO) return;
    const t = setInterval(async () => {
      const after = lastIdRef.current;
      const r = await fetch(
        `${API_BASE}/bookings/${bookingId}/chat/messages/?after=${after}`,
        { credentials: "include" }
      );
      if (!r.ok) return;
      const d = await r.json();
      const fresh: Message[] = d.results || [];
      if (fresh.length) {
        setMessages((prev) => [...prev, ...fresh]);
        lastIdRef.current = fresh[fresh.length - 1].id;
      }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [bookingId, error]);

  // 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      let m: Message;
      if (IS_DEMO) {
        m = postChatMessage(bookingId, body) as Message;
      } else {
        const res = await fetch(
          `${API_BASE}/bookings/${bookingId}/chat/messages/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ body }),
          }
        );
        if (!res.ok) throw new Error(`${res.status}`);
        m = await res.json();
      }
      setMessages((prev) => [...prev, m]);
      lastIdRef.current = Math.max(lastIdRef.current, m.id);
      setInput("");
    } catch (err) {
      alert("전송 실패: " + String(err));
    } finally {
      setSending(false);
    }
  }

  if (error) return <p className="text-ink-muted py-12 text-center">{error}</p>;
  if (!room) return <p className="text-ink-muted py-12 text-center">불러오는 중…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* 좌측: 채팅 */}
      <div className="border border-line bg-surface flex flex-col" style={{ height: "70vh" }}>
        <div className="px-5 py-4 border-b border-line">
          <p className="text-[16px] font-medium text-ink">{room.title}</p>
          <p className="caption text-ink-muted mt-1">
            {room.sharing_label} · {room.pax_taken}/{room.capacity}명
          </p>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m) => {
            if (m.kind === "system") {
              return (
                <div key={m.id} className="flex justify-center">
                  <span className="caption text-ink-muted px-3 py-1 bg-muted-bg">
                    {m.body}
                  </span>
                </div>
              );
            }
            return (
              <div
                key={m.id}
                className={`flex ${m.is_me ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[78%] ${m.is_me ? "items-end" : "items-start"} flex flex-col`}>
                  {!m.is_me && (
                    <span className="caption text-ink-muted mb-1">
                      {m.display_name}
                    </span>
                  )}
                  <div
                    className={`px-4 py-3 text-[14px] leading-[1.5] ${
                      m.is_me
                        ? "bg-ink text-ink-inverse"
                        : "bg-muted-bg text-ink border border-line"
                    }`}
                    style={{ borderRadius: 4, whiteSpace: "pre-wrap" }}
                  >
                    {m.body}
                  </div>
                  <span className="caption text-ink-muted mt-1" style={{ fontSize: 10 }}>
                    {new Date(m.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={send} className="border-t border-line p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
            maxLength={2000}
            className="flex-1 h-[44px] px-3 border border-line text-[14px] focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-[44px] px-5 bg-ink text-ink-inverse text-[13px] tracking-[0.18em] disabled:opacity-40"
          >
            전송
          </button>
        </form>
      </div>

      {/* 우측: 멤버 패널 */}
      <aside className="border border-line bg-surface p-5 h-fit">
        <p className="caption text-ink-muted mb-4">멤버 ({room.members.length})</p>
        <ul className="space-y-3">
          {room.members.map((m) => (
            <li key={m.booking_id} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full bg-ink text-ink-inverse flex items-center justify-center text-[13px] flex-shrink-0"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {m.display_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-ink truncate">
                  {m.display_name}
                  {m.is_me && (
                    <span className="ml-2 text-[11px] text-brass">(나)</span>
                  )}
                  {m.verified && (
                    <span className="ml-2 text-[11px] text-success">✓</span>
                  )}
                </p>
                <p className="caption text-ink-muted mt-1" style={{ fontSize: 11 }}>
                  {GENDER_LABEL[m.gender] ?? m.gender} ·{" "}
                  {AGE_LABEL[m.age_range] ?? m.age_range}
                  {m.pax > 1 && ` · ${m.pax}인`}
                </p>
                {m.occupation && (
                  <p className="caption text-ink-muted" style={{ fontSize: 11 }}>
                    {m.occupation}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-line">
          <p className="caption text-ink-muted mb-1">예약 정보</p>
          <p className="text-[13px] text-ink">{room.experience.title}</p>
          <p className="caption text-ink-muted mt-1">{room.scheduled_date}</p>
        </div>
      </aside>
    </div>
  );
}
