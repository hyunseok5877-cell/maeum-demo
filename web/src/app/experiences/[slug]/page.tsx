import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getExperienceBySlug, getAllExperiences, formatKRW, formatDuration } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExperienceActions } from "@/components/ExperienceActions";
import { ExperienceGallery } from "@/components/ExperienceGallery";

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getAllExperiences();
  return all.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return { title: "경험 · 마음" };
  return {
    title: `${exp.title_ko} · 마음`,
    description: exp.seo_meta_description || exp.subtitle_ko || exp.description_ko,
  };
}

export default async function ExperienceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) notFound();

  const hasDiscount = exp.discount_percentage > 0;
  const cover = exp.cover_image;
  const gallery = exp.media.filter((m) => m.type === "image");
  const videos = exp.media.filter((m) => m.type === "video");

  return (
    <>
      <SiteHeader variant="solid" />

      <main className="flex-1 pt-[72px]">
        {/* Gallery — 4+ 사진은 +N 오버레이 + 라이트박스 */}
        <ExperienceGallery
          cover={cover}
          images={gallery}
          title={exp.title_ko}
          hasDiscount={hasDiscount}
          discountPercentage={exp.discount_percentage}
        />

        {/* Title + CTA Row */}
        <section className="px-8 md:px-16 pt-16 pb-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex gap-2 mb-6">
                <span className="caption text-ink-muted">{exp.region.name_ko}</span>
                <span className="caption text-ink-muted">·</span>
                <span className="caption text-ink-muted">{exp.category.name_ko}</span>
                {exp.duration_minutes > 0 && (
                  <>
                    <span className="caption text-ink-muted">·</span>
                    <span className="caption text-ink-muted">
                      {formatDuration(exp.duration_minutes)}
                    </span>
                  </>
                )}
              </div>
              <h1
                className="font-[family-name:var(--font-serif)] text-ink"
                style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
              >
                {exp.title_ko}
              </h1>
              {exp.subtitle_ko && (
                <p className="mt-6 text-[20px] text-ink leading-[1.6]">{exp.subtitle_ko}</p>
              )}
              {exp.description_ko && (
                <p className="mt-8 text-[16px] text-ink-muted leading-[1.8] max-w-2xl">
                  {exp.description_ko}
                </p>
              )}
            </div>

            {/* Sticky price card */}
            <aside className="md:sticky md:top-[96px] md:h-fit">
              <div className="border border-line p-8 bg-surface">
                <div className="mb-6">
                  {hasDiscount ? (
                    <>
                      <p className="text-[14px] text-ink-muted line-through mb-1">
                        ₩{formatKRW(exp.base_price)}
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-[28px] font-medium text-ink">
                          ₩{formatKRW(exp.final_price)}
                        </span>
                        <span className="caption text-ink-muted">
                          {exp.discount_percentage}% OFF
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="caption text-ink-muted">FROM</span>
                      <span className="text-[28px] font-medium text-ink">
                        ₩{formatKRW(exp.base_price)}
                      </span>
                    </div>
                  )}
                </div>
                <dl className="space-y-3 text-[14px] mb-8">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">인원</dt>
                    <dd className="text-ink">
                      {exp.min_pax === exp.max_pax
                        ? `${exp.min_pax}명`
                        : `${exp.min_pax}~${exp.max_pax}명`}
                    </dd>
                  </div>
                  {exp.duration_minutes > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">소요</dt>
                      <dd className="text-ink">{formatDuration(exp.duration_minutes)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">예약 시점</dt>
                    <dd className="text-ink">최소 {exp.advance_booking_days}일 전</dd>
                  </div>
                  {exp.available_from && exp.available_to && (
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">가능일</dt>
                      <dd className="text-ink text-right">
                        {exp.available_from}
                        <br />~ {exp.available_to}
                      </dd>
                    </div>
                  )}
                  {exp.vendor && (
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">공급</dt>
                      <dd className="text-ink">{exp.vendor.name}</dd>
                    </div>
                  )}
                </dl>
                <Suspense fallback={<div className="h-[120px]" />}>
                  <ExperienceActions
                    slug={exp.slug}
                    title={exp.title_ko}
                    finalPrice={exp.final_price}
                  />
                </Suspense>
                <p className="caption text-ink-muted mt-4 text-center">
                  데모 예약은 결제 없이 즉시 확정 — 마이페이지 &gt; 예약 내역에서 확인.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Content */}
        {exp.content_html && (
          <section className="px-8 md:px-16 py-16 border-t border-line">
            <div className="max-w-3xl mx-auto">
              <p className="caption text-ink-muted mb-8">STORY</p>
              <div
                className="prose-maeum"
                dangerouslySetInnerHTML={{ __html: exp.content_html }}
              />
            </div>
          </section>
        )}

        {/* Options */}
        {exp.options.length > 0 && (
          <section className="px-8 md:px-16 py-16 border-t border-line">
            <div className="max-w-3xl mx-auto">
              <p className="caption text-ink-muted mb-8">ADD-ONS</p>
              <h2
                className="font-[family-name:var(--font-serif)] text-ink mb-10"
                style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.12 }}
              >
                옵션
              </h2>
              <ul className="divide-y divide-line">
                {exp.options.map((opt) => (
                  <li key={opt.id} className="py-6 flex justify-between items-start gap-8">
                    <div>
                      <p className="text-ink text-[18px]">{opt.name}</p>
                      {opt.description && (
                        <p className="text-ink-muted text-[14px] mt-2">{opt.description}</p>
                      )}
                    </div>
                    <p className="text-ink whitespace-nowrap">
                      + ₩{formatKRW(opt.additional_price)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Considerations */}
        {(exp.cancellation_policy || exp.min_pax || exp.max_pax) && (
          <section className="px-8 md:px-16 py-16 border-t border-line">
            <div className="max-w-3xl mx-auto">
              <p className="caption text-ink-muted mb-8">CONSIDERATIONS</p>
              <h2
                className="font-[family-name:var(--font-serif)] text-ink mb-10"
                style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.12 }}
              >
                안내
              </h2>
              <dl className="space-y-6 text-[16px]">
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="caption text-ink-muted">인원</dt>
                  <dd className="text-ink">
                    {exp.min_pax === exp.max_pax
                      ? `${exp.min_pax}명 (고정)`
                      : `${exp.min_pax}명 ~ ${exp.max_pax}명`}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="caption text-ink-muted">예약 시점</dt>
                  <dd className="text-ink">
                    최소 {exp.advance_booking_days}일 전 예약 권장
                  </dd>
                </div>
                {exp.cancellation_policy && (
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <dt className="caption text-ink-muted">취소 정책</dt>
                    <dd className="text-ink whitespace-pre-line">
                      {exp.cancellation_policy}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="px-8 md:px-16 py-16 border-t border-line">
            <div className="max-w-5xl mx-auto">
              <p className="caption text-ink-muted mb-8">MOTION</p>
              <div className="space-y-8">
                {videos.map((v) => (
                  <video
                    key={v.id}
                    src={v.src}
                    controls
                    playsInline
                    className="w-full aspect-video bg-obsidian"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Add-on CTA (2-depth) */}
        <section className="px-8 md:px-16 py-16 md:py-20 border-t border-line bg-obsidian">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <p
              className="font-[family-name:var(--font-serif)] text-ink-inverse"
              style={{ fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.35, letterSpacing: "-0.005em" }}
            >
              해당 일정에 추가하고 싶은 컨텐츠가 있을까요?
            </p>
            <Link
              href="/request-curation"
              className="inline-flex h-[48px] px-8 items-center justify-center bg-ink-inverse text-ink font-medium hover:bg-white transition whitespace-nowrap"
            >
              큐레이션 요청하기
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
