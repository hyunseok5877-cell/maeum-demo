"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type Profile = {
  user: {
    id: number;
    email: string;
    display_name: string;
    nickname: string;
    avatar_url?: string;
    joined_years: number;
  };
  intake: {
    full_name: string;
    age_range: string;
    residence_city: string;
    residence_district: string;
    occupation: string;
    marital_status: string;
    preferred_categories: { code: string; name_ko: string }[];
  } | null;
  personality_type: {
    code: string;
    name_ko: string;
    name_en: string;
    description: string;
    image_url?: string;
  } | null;
  stats: {
    total_experiences: number;
    total_reviews: number;
    visited_regions: string[];
  };
  last_quiz_token?: string;
  recent_bookings: {
    id: number;
    booking_number: string;
    status: string;
    scheduled_at: string | null;
    pax_count: number;
    experience_slug: string | null;
    experience_title: string;
    region_name: string;
    region_code: string;
    cover_image: string;
  }[];
  badges: {
    code: string;
    name: string;
    description: string;
    earned: boolean;
  }[];
};

const REGION_COLOR: Record<string, string> = {
  seoul: "#000000",
  busan: "#1E3A8A",
  jeju: "#166534",
};

const BADGE_ICON: Record<string, string> = {
  first_experience: "✦",
  supercar_rider: "◉",
  ocean_voyager: "◈",
  dawn_walker: "☾",
  three_regions: "♢",
  curator_pick: "♔",
};

export function MyProfileClient() {
  const router = useRouter();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/me/profile/`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          router.push("/login");
          return null;
        }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (alive && d) setData(d);
      })
      .catch((e) => {
        if (alive) setError(String(e));
      });
    return () => {
      alive = false;
    };
  }, [router]);

  // 프로필 사진 업로드
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능하도록 reset
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("이미지는 5MB 이하만 가능합니다.");
      return;
    }
    setAvatarBusy(true);
    try {
      const fd = new FormData();
      fd.append("avatar", f);
      const res = await fetch(`${API_BASE}/auth/avatar/`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, avatar_url: j.user.avatar_url } } : prev
      );
    } catch (err) {
      alert("업로드 실패: " + String(err));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarDelete() {
    if (!confirm("프로필 사진을 삭제하시겠어요?")) return;
    setAvatarBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/avatar/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, avatar_url: "" } } : prev
      );
    } catch (err) {
      alert("삭제 실패: " + String(err));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleLogout() {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  // 뱃지 디자인 미리보기 토글 (임시 — 디자인 검토용)
  const [previewBadges, setPreviewBadges] = useState(false);

  // 최근 검색 (localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("maeum:recentSearches");
      if (raw) setRecentSearches(JSON.parse(raw).slice(0, 8));
    } catch {}
  }, []);
  function clearSearches() {
    localStorage.removeItem("maeum:recentSearches");
    setRecentSearches([]);
  }

  if (error)
    return <p className="text-ink-muted">불러오지 못했습니다. {error}</p>;
  if (!data)
    return (
      <div className="py-40 text-center text-ink-muted">
        프로필 불러오는 중…
      </div>
    );

  const firstChar =
    data.user.nickname?.[0] ??
    data.user.display_name?.[0] ??
    data.user.email[0];

  // 회원 등급 — 경험 횟수 기반 임시 매핑 (Phase 2 멤버십 도입 전까지)
  const totalExp = data.stats.total_experiences;
  const tier =
    totalExp >= 10
      ? { name: "Connaisseur", ko: "감별사", desc: "마음을 깊이 아는 회원" }
      : totalExp >= 3
      ? { name: "Initié", ko: "입문자", desc: "여러 경험을 통해 마음을 알아가는 중" }
      : totalExp >= 1
      ? { name: "Découvreur", ko: "탐험가", desc: "첫 경험을 마친 회원" }
      : { name: "Invité", ko: "초대 회원", desc: "마음에 처음 발을 들이신 회원" };
  const nextTierExp = totalExp >= 10 ? null : totalExp >= 3 ? 10 : totalExp >= 1 ? 3 : 1;

  return (
    <>
      {/* 상단 헤더 */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="caption text-brass">— Mon espace</p>
          <h1
            className="mt-4 font-[family-name:var(--font-display)] text-ink"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            나의 마음.
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="caption text-ink-muted hover:text-brass transition"
        >
          로그아웃 →
        </button>
      </div>

      {/* 프로필 카드 */}
      <div className="profile-card mb-14">
        <div className="profile-avatar profile-avatar--editable">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
            aria-label="프로필 사진 업로드"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarBusy}
            className="profile-avatar__btn"
            aria-label="프로필 사진 변경"
          >
            {data.user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.user.avatar_url}
                alt={data.user.nickname || "프로필"}
                className="profile-avatar__img"
              />
            ) : (
              <span>{firstChar}</span>
            )}
            <span className="profile-avatar__overlay">
              {avatarBusy ? "업로드 중…" : "사진 변경"}
            </span>
          </button>
          <span className="profile-verified" aria-label="인증된 회원">
            ✓
          </span>
          {data.user.avatar_url && !avatarBusy && (
            <button
              type="button"
              onClick={handleAvatarDelete}
              className="profile-avatar__delete"
              aria-label="프로필 사진 삭제"
              title="프로필 사진 삭제"
            >
              ×
            </button>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-end gap-3 mb-2">
            {data.user.nickname ? (
              <h2
                className="font-[family-name:var(--font-display)] text-ink"
                style={{ fontSize: "42px", letterSpacing: "-0.01em", lineHeight: 1 }}
              >
                {data.user.nickname}
              </h2>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <h2
                  className="font-[family-name:var(--font-display)] text-ink-muted italic"
                  style={{ fontSize: "32px", letterSpacing: "-0.01em", lineHeight: 1 }}
                >
                  닉네임을 설정해 주세요
                </h2>
                <Link
                  href="/welcome"
                  className="caption text-brass hover:underline"
                >
                  지금 설정하기 →
                </Link>
              </div>
            )}
            {data.intake?.age_range && (
              <span className="caption text-ink-muted">
                · {data.intake.age_range}
              </span>
            )}
          </div>
          <p className="text-[14px] text-ink-muted mb-6">
            {data.intake?.residence_city
              ? `${data.intake.residence_city}${
                  data.intake.residence_district
                    ? ` · ${data.intake.residence_district}`
                    : ""
                }, 한국`
              : "거주지 미입력"}
            {data.intake?.occupation && ` · ${data.intake.occupation}`}
          </p>

          <div className="profile-info-grid">
            <div>
              <div className="profile-info-label">경험 횟수</div>
              <div className="profile-info-value">
                {data.stats.total_experiences}
                <span className="profile-info-unit">회</span>
              </div>
            </div>
            <div>
              <div className="profile-info-label">후기</div>
              <div className="profile-info-value">
                {data.stats.total_reviews}
                <span className="profile-info-unit">개</span>
              </div>
            </div>
            <div>
              <div className="profile-info-label">가입</div>
              <div className="profile-info-value">
                {data.user.joined_years}
                <span className="profile-info-unit">년 전</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 등급 카드 */}
      <div className="mb-14 p-8 md:p-10 border border-line rounded-[20px] flex flex-wrap items-center justify-between gap-6 bg-white">
        <div>
          <p className="caption text-brass">— Statut</p>
          <div className="mt-3 flex items-baseline gap-3">
            <h3
              className="font-[family-name:var(--font-display)] text-ink"
              style={{ fontSize: "clamp(28px, 3.4vw, 40px)", letterSpacing: "-0.01em" }}
            >
              {tier.ko}
            </h3>
            <span className="caption text-ink-muted">{tier.name}</span>
          </div>
          <p className="mt-2 text-[14px] text-ink-muted">{tier.desc}</p>
        </div>
        <div className="text-right">
          {nextTierExp !== null ? (
            <>
              <p className="caption text-ink-muted">다음 등급까지</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-ink" style={{ fontSize: 28 }}>
                {nextTierExp - totalExp}
                <span className="text-[13px] text-ink-muted ml-1">회 경험</span>
              </p>
            </>
          ) : (
            <p className="caption text-brass">최고 등급 도달</p>
          )}
        </div>
      </div>

      {/* 성향 유형 — 좌 이미지 / 우 텍스트 */}
      {data.personality_type && (
        <div
          className="mb-14 rounded-[24px] overflow-hidden grid grid-cols-1 md:grid-cols-[42%_1fr]"
          style={{
            background:
              "linear-gradient(135deg, #0F0F0F 0%, #2B2420 100%)",
            color: "#FAFAF8",
          }}
        >
          {/* 좌측 이미지 */}
          <div
            className="relative min-h-[260px] md:min-h-[360px]"
            style={{
              backgroundImage: data.personality_type.image_url
                ? `url(${data.personality_type.image_url})`
                : "linear-gradient(135deg, #2B2420 0%, #0F0F0F 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(15,15,15,0) 0%, rgba(15,15,15,0.55) 75%, #1A1612 100%)",
              }}
              aria-hidden
            />
            <div className="absolute bottom-5 left-6">
              <p
                className="caption"
                style={{ color: "var(--color-brass)", letterSpacing: "0.22em" }}
              >
                {data.personality_type.code}
              </p>
            </div>
          </div>

          {/* 우측 텍스트 */}
          <div className="p-8 md:p-12">
            <p
              className="caption"
              style={{ color: "var(--color-brass)" }}
            >
              — Votre type
            </p>
            <h3
              className="mt-3 font-[family-name:var(--font-display)]"
              style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.15 }}
            >
              {data.personality_type.name_ko}
            </h3>
            <p className="mt-2 caption" style={{ opacity: 0.7 }}>
              {data.personality_type.name_en}
            </p>
            <p
              className="mt-6 text-[15px]"
              style={{ lineHeight: 1.75, opacity: 0.88 }}
            >
              {data.personality_type.description}
            </p>
          </div>
        </div>
      )}

      {/* 뱃지 */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="caption text-brass">— Médailles</p>
            <h3
              className="mt-3 font-[family-name:var(--font-display)] text-ink"
              style={{
                fontSize: "clamp(22px, 2.6vw, 32px)",
                letterSpacing: "-0.01em",
              }}
            >
              나의 뱃지
            </h3>
            <p className="mt-2 text-[13px] text-ink-muted">
              특정 경험을 완료할 때마다 뱃지가 수집됩니다.{" "}
              <em className="not-italic text-brass">
                (디자인 시안은 추후 업데이트)
              </em>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPreviewBadges((v) => !v)}
              className="caption text-ink-muted hover:text-brass transition"
              aria-pressed={previewBadges}
            >
              {previewBadges ? "잠금 상태로 보기" : "디자인 미리보기"}
            </button>
            <span className="caption text-ink-muted">
              {data.badges.filter((b) => b.earned).length} / {data.badges.length}
            </span>
          </div>
        </div>
        <div className="badge-grid">
          {data.badges.map((b) => {
            const shown = b.earned || previewBadges;
            return (
              <div
                key={b.code}
                className={`badge-item ${shown ? "is-earned" : "is-locked"}`}
                style={previewBadges && !b.earned ? { opacity: 0.85 } : undefined}
              >
                <div className="badge-emblem">
                  {shown ? BADGE_ICON[b.code] ?? "✦" : "🔒"}
                </div>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.description}</div>
                {previewBadges && !b.earned && (
                  <div className="caption text-ink-muted mt-2">미리보기</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 예약 내역 */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="caption text-brass">— Réservations</p>
            <h3
              className="mt-3 font-[family-name:var(--font-display)] text-ink"
              style={{
                fontSize: "clamp(22px, 2.6vw, 32px)",
                letterSpacing: "-0.01em",
              }}
            >
              예약 내역
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {data.stats.visited_regions.length > 0 && (
              <span className="caption text-ink-muted">
                방문 지역 · {data.stats.visited_regions.join(" · ")}
              </span>
            )}
            {data.recent_bookings.length > 0 && (
              <Link href="/bookings" className="caption text-brass hover:underline">
                전체 보기 →
              </Link>
            )}
          </div>
        </div>

        {data.recent_bookings.length === 0 ? (
          <div className="p-10 border border-line rounded-[16px] text-center">
            <p className="text-ink-muted text-[14px] leading-[1.8]">
              아직 기록된 경험이 없습니다.
              <br />
              첫 번째 하루를 설계해 보세요.
            </p>
            <Link
              href="/experiences"
              className="inline-flex mt-6 h-[48px] px-8 items-center bg-ink text-ink-inverse caption rounded-full hover:bg-black transition"
            >
              경험 둘러보기
            </Link>
          </div>
        ) : (
          <div className="trip-grid">
            {data.recent_bookings.map((b) => {
              const pill =
                REGION_COLOR[b.region_code] ?? "#1A1A1A";
              return (
                <Link
                  key={b.id}
                  href={
                    b.experience_slug
                      ? `/experiences/${b.experience_slug}`
                      : "#"
                  }
                  className="trip-card"
                >
                  <div
                    className="trip-thumb"
                    style={{
                      backgroundImage: b.cover_image
                        ? `url(${b.cover_image})`
                        : undefined,
                    }}
                  >
                    {b.region_name && (
                      <span
                        className="trip-region-pill"
                        style={{ backgroundColor: pill }}
                      >
                        {b.region_name}
                      </span>
                    )}
                  </div>
                  <div className="trip-body">
                    <div className="trip-title">
                      {b.experience_title || "(비공개 경험)"}
                    </div>
                    <div className="trip-meta">
                      {b.scheduled_at
                        ? new Date(b.scheduled_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : ""}
                      {b.pax_count > 0 && ` · ${b.pax_count}인`}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 선호 카테고리 */}
      {data.intake?.preferred_categories &&
        data.intake.preferred_categories.length > 0 && (
          <section className="mb-14">
            <p className="caption text-brass mb-3">— Préférences</p>
            <div className="flex flex-wrap gap-2">
              {data.intake.preferred_categories.map((c) => (
                <Link
                  key={c.code}
                  href={`/experiences?category=${c.code}`}
                  className="px-4 py-2 border border-line rounded-full text-[13px] text-ink hover:border-ink transition"
                >
                  {c.name_ko}
                </Link>
              ))}
            </div>
          </section>
        )}

      {/* 최근 검색 */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="caption text-brass">— Recherches récentes</p>
            <h3
              className="mt-3 font-[family-name:var(--font-display)] text-ink"
              style={{ fontSize: "clamp(22px, 2.6vw, 32px)", letterSpacing: "-0.01em" }}
            >
              최근 검색
            </h3>
          </div>
          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={clearSearches}
              className="caption text-ink-muted hover:text-brass transition"
            >
              모두 지우기
            </button>
          )}
        </div>
        {recentSearches.length === 0 ? (
          <p className="text-[14px] text-ink-muted">
            아직 검색 기록이 없습니다. 경험 카탈로그에서 검색하면 여기에 모입니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q, i) => (
              <Link
                key={`${q}-${i}`}
                href={`/experiences?q=${encodeURIComponent(q)}`}
                className="px-4 py-2 border border-line rounded-full text-[13px] text-ink hover:border-ink hover:text-brass transition"
              >
                {q}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 빠른 링크 / 메뉴 */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link
          href="/bookings"
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Réservations</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            예약 내역 전체
          </p>
        </Link>
        <Link
          href="/wishlist"
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Favoris</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            위시리스트
          </p>
        </Link>
        <Link
          href="/onboarding"
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Profil</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            프로필 수정
          </p>
        </Link>
        <Link
          href="/request-curation"
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Curation</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            나만의 하루 설계
          </p>
        </Link>
        <Link
          href={
            data.personality_type && data.last_quiz_token
              ? `/quiz/result/${data.last_quiz_token}`
              : "/quiz"
          }
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Sentiment</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            {data.personality_type ? "내 성향 결과" : "성향 테스트"}
          </p>
          {data.personality_type && (
            <p className="mt-1 text-[12px] text-brass tracking-[0.04em]">
              {data.personality_type.name_ko}
            </p>
          )}
        </Link>
        <Link
          href="/support"
          className="p-6 border border-line rounded-[16px] hover:border-ink transition"
        >
          <p className="caption text-ink-muted">Assistance</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[20px]">
            고객센터
          </p>
        </Link>
      </section>
    </>
  );
}
