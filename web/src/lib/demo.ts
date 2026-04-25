// Demo 모드 (정적 export 배포) — 모든 동적 동작을 localStorage로 mock.
// SSR 안전: typeof window 가드.

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const KEY_USER = "maeum_demo_user";
const KEY_WISH = "maeum_demo_wishlist";
const KEY_BOOKINGS = "maeum_demo_bookings";
const KEY_CHATS = "maeum_demo_chats";

export type DemoUser = {
  id: number;
  email: string;
  nickname: string;
  display_name: string;
  avatar_url: string | null;
  verified_at: string | null;
};

export type DemoBooking = {
  id: number;
  booking_number: string;
  status: string;
  scheduled_at: string;
  pax_count: number;
  sharing_mode: "private" | "friends_only" | "open";
  session_group_id: number;
  group_pax_taken: number;
  group_capacity: number;
  total_amount: number;
  has_chat: boolean;
  experience_slug: string;
  experience_title: string;
  region_name: string;
  region_code: string;
  cover_image: string;
};

export type DemoChatMessage = {
  id: number;
  kind: "user" | "system";
  body: string;
  display_name: string;
  is_me: boolean;
  created_at: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ---- 인증 ----
export function getDemoUser(): DemoUser | null {
  return read<DemoUser | null>(KEY_USER, null);
}

export function loginDemo(email = "demo@maeum.kr", nickname = ""): DemoUser {
  const existing = getDemoUser();
  const user: DemoUser =
    existing ?? {
      id: Date.now(),
      email,
      nickname: nickname || "데모유저",
      display_name: nickname || "데모유저",
      avatar_url: null,
      verified_at: new Date().toISOString(),
    };
  if (nickname) {
    user.nickname = nickname;
    user.display_name = nickname;
  }
  write(KEY_USER, user);
  return user;
}

export function logoutDemo() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_USER);
}

// ---- 위시리스트 ----
export function getWishlist(): string[] {
  return read<string[]>(KEY_WISH, []);
}

export function isInWishlist(slug: string) {
  return getWishlist().includes(slug);
}

export function toggleWishlist(slug: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(KEY_WISH, list);
    return false;
  }
  list.push(slug);
  write(KEY_WISH, list);
  return true;
}

// ---- 예약 ----
export function getBookings(): DemoBooking[] {
  return read<DemoBooking[]>(KEY_BOOKINGS, []);
}

export function createBooking(input: {
  experience_slug: string;
  experience_title: string;
  cover_image: string;
  region_name: string;
  region_code: string;
  scheduled_at: string;
  pax_count: number;
  sharing_mode: "private" | "friends_only" | "open";
  unit_price: number;
  capacity: number;
}): DemoBooking {
  const list = getBookings();
  const id = Date.now();
  const yymmdd = new Date()
    .toISOString()
    .slice(2, 10)
    .replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const bookingNumber = `MAEUM-${yymmdd}-${suffix}`;
  const isForcedPrivate = input.pax_count > input.capacity;
  const effectiveMode = isForcedPrivate ? "private" : input.sharing_mode;
  const multiplier = effectiveMode === "private" ? 2.5 : 1;
  const total = Math.round(input.unit_price * input.pax_count * multiplier);

  const booking: DemoBooking = {
    id,
    booking_number: bookingNumber,
    status: "confirmed",
    scheduled_at: input.scheduled_at,
    pax_count: input.pax_count,
    sharing_mode: effectiveMode,
    session_group_id: id,
    group_pax_taken: input.pax_count,
    group_capacity: Math.max(input.capacity, input.pax_count),
    total_amount: total,
    has_chat: true,
    experience_slug: input.experience_slug,
    experience_title: input.experience_title,
    region_name: input.region_name,
    region_code: input.region_code,
    cover_image: input.cover_image,
  };
  list.unshift(booking);
  write(KEY_BOOKINGS, list);

  // 채팅방 자동 시드
  const chats = read<Record<string, DemoChatMessage[]>>(KEY_CHATS, {});
  chats[String(id)] = [
    {
      id: 1,
      kind: "system",
      body: "마음 큐레이터가 모더레이터로 함께합니다. 편하게 인사 나누세요.",
      display_name: "system",
      is_me: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      kind: "system",
      body:
        effectiveMode === "open"
          ? "오픈 합석으로 진행돼요. 다른 멤버가 합류할 수 있습니다."
          : effectiveMode === "friends_only"
          ? "지인만 동반 모드로 진행돼요."
          : "단독 이용으로 회차가 잠겼습니다.",
      display_name: "system",
      is_me: false,
      created_at: new Date().toISOString(),
    },
  ];
  write(KEY_CHATS, chats);
  return booking;
}

export function getBooking(id: number): DemoBooking | null {
  return getBookings().find((b) => b.id === id) ?? null;
}

// ---- 채팅 ----
function readChats(): Record<string, DemoChatMessage[]> {
  return read<Record<string, DemoChatMessage[]>>(KEY_CHATS, {});
}

export function getChatMessages(bookingId: number): DemoChatMessage[] {
  return readChats()[String(bookingId)] ?? [];
}

export function postChatMessage(bookingId: number, body: string): DemoChatMessage {
  const chats = readChats();
  const list = chats[String(bookingId)] ?? [];
  const me = getDemoUser();
  const msg: DemoChatMessage = {
    id: list.length ? list[list.length - 1].id + 1 : 1,
    kind: "user",
    body,
    display_name: me?.nickname || "나",
    is_me: true,
    created_at: new Date().toISOString(),
  };
  list.push(msg);
  chats[String(bookingId)] = list;
  write(KEY_CHATS, chats);
  return msg;
}
