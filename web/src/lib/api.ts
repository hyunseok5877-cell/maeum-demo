const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

export interface RegionSummary {
  id: number;
  code: string;
  name_ko: string;
  name_en: string;
  lat: string | null;
  lng: string | null;
  country: { code: string; name_ko: string; name_en: string };
}

export interface CategorySummary {
  id: number;
  code: string;
  name_ko: string;
  name_en: string;
  icon: string;
}

export interface MediaItem {
  id: number;
  type: "image" | "video" | "document";
  src: string;
  display_order: number;
  alt_text: string;
  is_cover: boolean;
}

export interface OptionItem {
  id: number;
  name: string;
  description: string;
  additional_price: string;
  max_quantity: number;
}

export interface TagItem {
  id: number;
  code: string;
  name_ko: string;
}

export interface VendorLite {
  id: number;
  name: string;
}

export interface ExperienceCard {
  id: number;
  slug: string;
  title_ko: string;
  title_en?: string;
  subtitle_ko: string;
  description_ko: string;
  region: RegionSummary;
  category: CategorySummary;
  cover_image: string | null;
  base_price: string;
  discount_percentage: number;
  final_price: number;
  discount_amount: number;
  currency: string;
  duration_minutes: number;
  min_pax: number;
  max_pax: number;
  available_from: string | null;
  available_to: string | null;
  is_featured: boolean;
  rating_avg: string;
  rating_count: number;
}

export interface ExperienceDetail extends ExperienceCard {
  content_html: string;
  description_en: string;
  cancellation_policy: string;
  advance_booking_days: number;
  media: MediaItem[];
  options: OptionItem[];
  tags: TagItem[];
  vendor: VendorLite | null;
  seo_meta_title: string;
  seo_meta_description: string;
  published_at: string | null;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 60 },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function getFeaturedExperiences(): Promise<ExperienceCard[]> {
  try {
    const data = await fetchJson<{ results: ExperienceCard[] }>("/experiences/featured/");
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getAllExperiences(): Promise<ExperienceCard[]> {
  try {
    const data = await fetchJson<{ count: number; results: ExperienceCard[] }>(
      "/experiences/?ordering=-is_featured,-published_at"
    );
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getExperienceBySlug(slug: string): Promise<ExperienceDetail | null> {
  try {
    return await fetchJson<ExperienceDetail>(`/experiences/${slug}/`);
  } catch {
    return null;
  }
}

export function formatKRW(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("ko-KR").format(Math.round(n));
}

export function formatDuration(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}
