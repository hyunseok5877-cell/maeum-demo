import Link from "next/link";
import Image from "next/image";
import { type ExperienceCard as ExperienceCardData, formatKRW } from "@/lib/api";

// 지역별 컬러 — 다른 페이지(trip-card)와 동일 톤
const REGION_BG: Record<string, string> = {
  seoul: "#1A1A1A",
  busan: "#1E3A8A",
  jeju: "#166534",
  gangwon: "#3F2A1D",
  gyeonggi: "#1A1A1A",
  jeonnam: "#166534",
  gyeongbuk: "#7F1D1D",
  incheon: "#1E3A8A",
};

export function ExperienceCard({ exp }: { exp: ExperienceCardData }) {
  const hasDiscount = exp.discount_percentage > 0;
  const regionBg = REGION_BG[exp.region.code] ?? "#1A1A1A";
  return (
    <Link
      href={`/experiences/${exp.slug}`}
      className="trip-card group flex flex-col"
    >
      <div
        className="trip-thumb"
        style={{
          aspectRatio: "4/5",
          backgroundImage: exp.cover_image ? `url(${exp.cover_image})` : undefined,
        }}
      >
        {exp.cover_image ? (
          <Image
            src={exp.cover_image}
            alt={exp.title_ko}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
            <span className="caption">NO IMAGE</span>
          </div>
        )}
        {hasDiscount && (
          <span
            className="absolute top-3 left-3"
            style={{
              color: "#FFFFFF",
              fontSize: "11px",
              letterSpacing: "0.14em",
              fontWeight: 700,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.45)",
            }}
          >
            {exp.discount_percentage}% OFF
          </span>
        )}
        <span
          className="trip-region-pill"
          style={{
            left: "auto",
            right: 10,
            background: regionBg,
          }}
        >
          {exp.region.name_ko}
        </span>
      </div>
      <div className="trip-body" style={{ padding: "16px 18px 18px" }}>
        <span className="caption text-ink-muted">{exp.category.name_ko}</span>
        <h3
          className="mt-2 font-[family-name:var(--font-display)] text-ink"
          style={{ fontSize: "17px", lineHeight: 1.3, letterSpacing: "-0.01em" }}
        >
          {exp.title_ko}
        </h3>
        {exp.subtitle_ko && (
          <p className="mt-2 text-[13px] text-ink-muted leading-relaxed line-clamp-2">
            {exp.subtitle_ko}
          </p>
        )}
        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-[12px] text-ink-muted line-through">
                ₩{formatKRW(exp.base_price)}
              </span>
              <span className="text-[15px] font-medium text-ink">
                ₩{formatKRW(exp.final_price)}
              </span>
            </>
          ) : (
            <span className="text-[14px] text-ink">
              from ₩{formatKRW(exp.base_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
