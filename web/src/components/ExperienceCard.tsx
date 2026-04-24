import Link from "next/link";
import Image from "next/image";
import { type ExperienceCard as ExperienceCardData, formatKRW } from "@/lib/api";

export function ExperienceCard({ exp }: { exp: ExperienceCardData }) {
  const hasDiscount = exp.discount_percentage > 0;
  return (
    <Link
      href={`/experiences/${exp.slug}`}
      className="group flex flex-col bg-surface border border-line hover:border-ink transition"
    >
      <div className="relative aspect-[4/5] bg-muted-bg overflow-hidden">
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
        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-ink text-ink-inverse caption px-3 py-1.5">
            {exp.discount_percentage}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex gap-2">
          <span className="caption text-ink-muted">{exp.region.name_ko}</span>
          <span className="caption text-ink-muted">·</span>
          <span className="caption text-ink-muted">{exp.category.name_ko}</span>
        </div>
        <h3
          className="font-[family-name:var(--font-serif)] text-ink"
          style={{ fontSize: "24px", lineHeight: 1.3, letterSpacing: "-0.005em" }}
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
