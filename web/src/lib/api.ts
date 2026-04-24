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

export interface ExperienceCard {
  id: number;
  slug: string;
  title_ko: string;
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

export function formatKRW(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("ko-KR").format(Math.round(n));
}
