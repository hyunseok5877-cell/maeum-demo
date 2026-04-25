"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryImage = {
  id: number | string;
  src: string;
  alt_text?: string;
};

type Props = {
  cover: string | null;
  images: GalleryImage[]; // 모든 이미지 (cover 별도, 1번부터 썸네일)
  title: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
};

export function ExperienceGallery({
  cover,
  images,
  title,
  hasDiscount = false,
  discountPercentage = 0,
}: Props) {
  // 사이드 썸네일 2장 (images[1], images[2]) — 기존 레이아웃 유지
  const sideThumbs = [images[1] ?? null, images[2] ?? null];
  const totalImages = (cover ? 1 : 0) + images.length;
  const visibleCount = (cover ? 1 : 0) + sideThumbs.filter(Boolean).length;
  const remaining = Math.max(0, totalImages - visibleCount);

  // 라이트박스
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // 라이트박스용 전체 이미지 리스트 (cover 먼저, 중복 제거)
  const allImages: GalleryImage[] = [];
  if (cover) {
    allImages.push({ id: "cover", src: cover, alt_text: title });
  }
  for (const img of images) {
    if (!img?.src) continue;
    if (cover && img.src === cover) continue;
    allImages.push(img);
  }

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => Math.min(allImages.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, allImages.length]);

  return (
    <>
      <section className="px-0 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:mt-8">
          {/* 메인 커버 */}
          <button
            type="button"
            onClick={() => openAt(0)}
            className="md:col-span-2 relative aspect-[9/5] bg-muted-bg overflow-hidden text-left group"
            aria-label="사진 전체 보기"
          >
            {cover ? (
              <Image
                src={cover}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-ink-muted caption">
                NO IMAGE
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-ink text-ink-inverse caption px-3 py-1.5">
                {discountPercentage}% OFF
              </span>
            )}
          </button>

          {/* 사이드 썸네일 2장 */}
          <div className="hidden md:grid gap-4">
            {sideThumbs.map((m, i) => {
              const isLastVisible = i === 1;
              const showOverlay = isLastVisible && remaining > 0;
              const lightboxIndex = (cover ? 1 : 0) + i + 1;

              return (
                <button
                  key={m?.id ?? `empty-${i}`}
                  type="button"
                  onClick={() => {
                    if (!m?.src) return;
                    openAt(showOverlay ? 0 : lightboxIndex);
                  }}
                  className="relative aspect-[16/10] bg-muted-bg overflow-hidden text-left group"
                  aria-label={showOverlay ? `사진 ${totalImages}장 전체 보기` : "사진 보기"}
                >
                  {m?.src ? (
                    <Image
                      src={m.src}
                      alt={m.alt_text || title}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink-muted caption">
                      —
                    </div>
                  )}
                  {showOverlay && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center text-ink-inverse"
                      style={{ background: "rgba(15, 15, 15, 0.62)" }}
                    >
                      <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" }}>
                        +{remaining}
                      </span>
                      <span className="caption mt-1" style={{ color: "rgba(250,250,248,0.8)" }}>
                        사진 더보기
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 모바일: 사진이 1장 초과면 전체보기 버튼 */}
        {totalImages > 1 && (
          <div className="md:hidden px-6 mt-3">
            <button
              type="button"
              onClick={() => openAt(0)}
              className="w-full h-[44px] border border-line text-[13px] tracking-[0.18em] uppercase"
            >
              사진 {totalImages}장 전체보기
            </button>
          </div>
        )}
      </section>

      {/* 라이트박스 */}
      {open && allImages.length > 0 && (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`사진 ${index + 1} / ${allImages.length}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lightbox-close"
            aria-label="닫기"
          >
            ×
          </button>

          <div className="lightbox-counter">
            <span className="lightbox-counter__num">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="lightbox-counter__sep">/</span>
            <span className="lightbox-counter__total">
              {String(allImages.length).padStart(2, "0")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="lightbox-nav lightbox-nav--prev"
            aria-label="이전 사진"
          >
            ‹
          </button>

          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {allImages[index]?.src && (
              <Image
                src={allImages[index].src}
                alt={allImages[index].alt_text || title}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
                priority
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(allImages.length - 1, i + 1))}
            disabled={index === allImages.length - 1}
            className="lightbox-nav lightbox-nav--next"
            aria-label="다음 사진"
          >
            ›
          </button>

          {/* 썸네일 스트립 */}
          <div className="lightbox-strip" onClick={(e) => e.stopPropagation()}>
            {allImages.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`lightbox-strip__item ${i === index ? "is-active" : ""}`}
                aria-label={`사진 ${i + 1}로 이동`}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
