"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { IS_DEMO, getDemoUser } from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

const MENU = [
  { href: "/about", label: "About" },
  { href: "/experiences", label: "Experiences" },
  { href: "/quiz", label: "Sentiment" },
  { href: "/request-curation", label: "Curation" },
];

type Me = {
  id: number;
  email: string;
  display_name: string;
  nickname: string;
  avatar_url?: string;
  needs_nickname: boolean;
  has_intake: boolean;
};

export function SiteHeader({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const pathname = usePathname() || "/";
  const linkTone = "text-ink";
  // 배경과 완전 동일: overlay/solid 구분 없이 투명. 페이지 배경(--color-bg)이 그대로 비침
  const headerBg = "bg-transparent";
  void variant;

  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (IS_DEMO) {
      const u = getDemoUser();
      setMe(
        u
          ? {
              id: u.id,
              email: u.email,
              nickname: u.nickname,
              display_name: u.display_name,
              avatar_url: u.avatar_url ?? undefined,
              needs_nickname: false,
              has_intake: true,
            }
          : null
      );
      return;
    }
    let alive = true;
    fetch(`${API_BASE}/auth/me/`, { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setMe(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  const avatarLetter = (() => {
    if (me?.nickname) return me.nickname[0];
    if (me?.display_name && !me.display_name.startsWith("Guest-"))
      return me.display_name[0];
    return me?.email?.[0] ?? "?";
  })();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-[72px] grid grid-cols-[auto_1fr_auto] items-center px-8 md:px-12 ${headerBg}`}
    >
      <Link href="/" aria-label="마음" className="flex items-center">
        <Image src="/logo.png" alt="마음" width={28} height={28} priority />
      </Link>

      <nav className="hidden md:flex items-center justify-evenly px-8">
        {MENU.map((m) => {
          const active =
            m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={active ? "page" : undefined}
              className={`group inline-flex items-center gap-[10px] text-[13px] tracking-[0.04em] transition-colors ${
                active
                  ? "text-ink"
                  : `${linkTone} opacity-90 hover:text-brass`
              }`}
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">[</span>
              <span className={active ? "font-medium" : ""}>{m.label}</span>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">]</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex items-center justify-end gap-6">
        {me ? (
          <Link
            href={me.needs_nickname ? "/welcome" : "/my"}
            className={`inline-flex items-center gap-[10px] text-[13px] tracking-[0.04em] ${linkTone} hover:text-brass transition`}
            aria-label={`${me.nickname || me.display_name || "프로필"} 페이지`}
          >
            <span className="opacity-60">[</span>
            {me.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.avatar_url}
                alt={me.nickname || "프로필"}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px]"
                style={{
                  background: "linear-gradient(135deg, #1A1A1A 0%, #3F2A1D 100%)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-display)",
                  letterSpacing: 0,
                }}
              >
                {avatarLetter}
              </span>
            )}
            <span>
              {me.nickname
                ? me.nickname
                : me.display_name && !me.display_name.startsWith("Guest-")
                ? me.display_name
                : "닉네임 설정"}
            </span>
            <span className="opacity-60">]</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={`inline-flex items-center gap-[10px] text-[13px] tracking-[0.04em] ${linkTone} hover:text-brass transition`}
          >
            <span className="opacity-60">[</span>
            <span>로그인 및 회원가입</span>
            <span className="opacity-60">]</span>
          </Link>
        )}
      </div>
    </header>
  );
}
