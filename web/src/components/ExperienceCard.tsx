import Link from "next/link";
import Image from "next/image";
import { type ExperienceCard as ExperienceCardData, formatKRW } from "@/lib/api";

// 지역별 컬러 — 색상이 한눈에 인지되도록 채도·명도 상향.
// 여전히 원색은 피하고 '에디토리얼 딥톤'으로 품위 유지.
const REGION_BG: Record<string, string> = {
  seoul: "#000000",   // 순 검정 — 서울
  busan: "#1E3A8A",   // Indigo 800, 확실한 딥 블루 — 부산
  jeju: "#166534",    // Emerald 800, 확실한 딥 그린 — 제주
  gangwon: "#3F2A1D", // Warm Umber — 강원
  gyeonggi: "#000000",
  jeonnam: "#166534",
  gyeongbuk: "#7F1D1D", // Crimson 900 — 경북
  incheon: "#1E3A8A",
};

export function ExperienceCard({ exp }: { exp: ExperienceCardData }) {
  const hasDiscount = exp.discount_percentage > 0;
  const regionBg = REGION_BG[exp.region.code] ?? "#1A1A1A";
  return (
    <Link
      href={`/experiences/${exp.slug}`}
      className="group flex flex-col bg-white border border-line hover:border-ink transition"
    >
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        {exp.cover_image ? (
          <Image
            src={exp.cover_image}
            alt={exp.title_ko}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
            <span className="caption">NO IMAGE</span>
          </div>
        )}
        {/* 좌상단: 할인 텍스트 (박스 없음, 이중 그림자로 이미지 위 가독성 확보) */}
        {hasDiscount && (
          <span
            className="absolute top-3 left-3"
            style={{
              color: "#FFFFFF",
              fontSize: "12px",
              letterSpacing: "0.14em",
              fontWeight: 700,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.45)",
            }}
          >
            {exp.discount_percentage}% OFF
          </span>
        )}
        {/* 우상단: 지역 배지 (pill) — 지역마다 딥톤 컬러. 흰 글씨 강제. */}
        <span
          className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full"
          style={{
            backgroundColor: regionBg,
            color: "#FFFFFF",
            fontSize: "12px",
            letterSpacing: "0.08em",
            fontWeight: 600,
            lineHeight: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        >
          {exp.region.name_ko}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex gap-2">
          <span className="caption text-ink-muted">{exp.category.name_ko}</span>
        </div>
        <h3
          className="font-[family-name:var(--font-display)] text-ink"
          style={{ fontSize: "22px", lineHeight: 1.25, letterSpacing: "-0.015em" }}
        >
          {exp.title_ko}
        </h3>
        {exp.subtitle_ko && (
          <p className="text-[14px] text-ink-muted leading-relaxed line-clamp-2">
            {exp.subtitle_ko}
          </p>
        )}
        <div className="mt-2 flex items-baseline gap-3">
          {hasDiscount ? (
            <>
              <span className="text-[14px] text-ink-muted line-through">
                ₩{formatKRW(exp.base_price)}
              </span>
              <span className="text-[18px] font-medium text-ink">
                ₩{formatKRW(exp.final_price)}
              </span>
            </>
          ) : (
            <span className="text-[16px] text-ink">
              from ₩{formatKRW(exp.base_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
