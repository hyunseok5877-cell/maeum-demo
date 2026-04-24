import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getExperienceBySlug, formatKRW, formatDuration } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 60;

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
        {/* Gallery */}
        <section className="px-0 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:mt-8">
            <div className="md:col-span-2 relative aspect-[9/5] bg-muted-bg overflow-hidden">
              {cover ? (
                <Image
                  src={cover}
                  alt={exp.title_ko}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover"
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
                  {exp.discount_percentage}% OFF
                </span>
              )}
            </div>
            <div className="hidden md:grid gap-4">
              {[0, 1].map((i) => {
                const m = gallery[i + 1];
                return (
                  <div key={i} className="relative aspect-[16/10] bg-muted-bg overflow-hidden">
                    {m?.src ? (
                      <Image
                        src={m.src}
                        alt={m.alt_text || exp.title_ko}
                        fill
                        sizes="33vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-muted caption">
                        —
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

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
                <Link
                  href="/request-curation"
                  className="block w-full h-[52px] bg-ink text-ink-inverse font-medium flex items-center justify-center hover:bg-black transition"
                >
                  문의하기
                </Link>
                <p className="caption text-ink-muted mt-4 text-center">
                  담당 큐레이터가 24~48시간 내 회신합니다.
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

        {/* Final CTA */}
        <section className="px-8 md:px-16 py-[120px] border-t border-line bg-obsidian">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="font-[family-name:var(--font-serif)] text-ink-inverse mb-12"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.12, letterSpacing: "-0.01em" }}
            >
              이 경험이
              <br />
              당신의 마음에 닿기를.
            </p>
            <Link
              href="/request-curation"
              className="inline-flex h-[60px] px-12 items-center justify-center bg-ink-inverse text-ink font-medium hover:bg-white transition"
            >
              큐레이션 시작하기
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
