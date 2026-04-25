"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IS_DEMO, getDemoUser, getWishlist, toggleWishlist } from "@/lib/demo";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";
const SEED_BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/maeum-demo") + "/seed/api";

type Item = {
  id: number;
  slug: string;
  title_ko: string;
  subtitle_ko: string;
  base_price: number;
  final_price: number;
  cover_image: string;
  region: { code: string; name_ko: string };
  category: { code: string; name_ko: string };
};

export function WishlistClient() {
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (IS_DEMO) {
      if (!getDemoUser()) {
        router.push("/login");
        return;
      }
      const slugs = getWishlist();
      if (!slugs.length) {
        setItems([]);
        return;
      }
      fetch(`${SEED_BASE}/experiences.json`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => {
          const all = d.results ?? [];
          setItems(all.filter((e: Item) => slugs.includes(e.slug)));
        });
      return;
    }
    fetch(`${API_BASE}/curation/wishlist/`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          router.push("/login");
          return null;
        }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d) => d && setItems(d.results ?? []));
  }, [router]);

  async function remove(slug: string) {
    setBusy(slug);
    try {
      if (IS_DEMO) {
        toggleWishlist(slug);
        setItems((prev) => (prev ? prev.filter((i) => i.slug !== slug) : prev));
        return;
      }
      const res = await fetch(`${API_BASE}/curation/wishlist/toggle/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ experience_slug: slug }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setItems((prev) => (prev ? prev.filter((i) => i.slug !== slug) : prev));
    } catch (e) {
      alert("삭제 실패: " + String(e));
    } finally {
      setBusy(null);
    }
  }

  if (items === null)
    return <p className="py-20 text-center text-ink-muted">불러오는 중…</p>;

  if (items.length === 0)
    return (
      <div className="p-12 border border-line rounded-[16px] text-center">
        <p className="text-ink-muted text-[14px] leading-[1.8]">
          아직 위시리스트가 비어 있습니다.
          <br />
          마음에 드는 경험에서 ♡ 버튼을 눌러 담아 보세요.
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it) => (
        <div key={it.id} className="trip-card relative">
          <Link href={`/experiences/${it.slug}`} className="block">
            <div
              className="trip-thumb"
              style={{
                backgroundImage: it.cover_image
                  ? `url(${it.cover_image})`
                  : undefined,
              }}
            >
              {it.region.name_ko && (
                <span
                  className="trip-region-pill"
                  style={{ backgroundColor: "#1A1A1A" }}
                >
                  {it.region.name_ko}
                </span>
              )}
            </div>
            <div className="trip-body">
              <div className="trip-title">{it.title_ko}</div>
              <div className="trip-meta">
                {it.category.name_ko && `${it.category.name_ko} · `}
                {it.final_price.toLocaleString("ko-KR")}원
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => remove(it.slug)}
            disabled={busy === it.slug}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 border border-line text-[16px] hover:bg-ink hover:text-ink-inverse transition disabled:opacity-50"
            aria-label="위시리스트에서 제거"
            title="위시리스트에서 제거"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
