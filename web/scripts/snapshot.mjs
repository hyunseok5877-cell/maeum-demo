// Django GET 응답을 web/public/seed/ 아래 박제 (정적 데모 빌드용)
// 사용: node scripts/snapshot.mjs (Django가 localhost:8000에서 떠 있어야 함)

import { writeFile, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.API_BASE ?? "http://localhost:8000";
const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const OUT = join(ROOT, "public", "seed");
const MEDIA_OUT = join(OUT, "media");
const API_OUT = join(OUT, "api");

const BASE_PATH = process.env.BASE_PATH ?? "/maeum-demo";

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

function rewriteMedia(obj) {
  // localhost media URL → /<basePath>/seed/media/...
  const json = JSON.stringify(obj).replaceAll(
    "http://localhost:8000/media/",
    `${BASE_PATH}/seed/media/`
  );
  return JSON.parse(json);
}

async function dump(path, file) {
  const url = `${API}${path}`;
  const r = await fetch(url);
  if (!r.ok) {
    console.warn(`! ${r.status} ${path}`);
    return null;
  }
  const data = await r.json();
  const out = rewriteMedia(data);
  const outPath = join(API_OUT, file);
  await ensureDir(dirname(outPath));
  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`✓ ${path} → ${file}`);
  return out;
}

async function main() {
  await ensureDir(API_OUT);

  // 컬렉션 목록
  await dump("/api/experiences/regions/", "regions.json");
  await dump("/api/experiences/categories/", "categories.json");
  await dump("/api/experiences/countries/", "countries.json");
  await dump("/api/experiences/featured/", "featured.json");

  const all = await dump(
    "/api/experiences/?ordering=-is_featured,-published_at",
    "experiences.json"
  );

  // 각 경험 상세
  const items = all?.results ?? all ?? [];
  for (const it of items) {
    if (!it.slug) continue;
    await dump(`/api/experiences/${it.slug}/`, `experiences/${it.slug}.json`);
  }

  // 큐레이션·퀴즈 (있으면)
  await dump("/api/curation/personalities/", "personalities.json").catch(() => null);
  await dump("/api/curation/quiz/", "quiz.json").catch(() => null);
  await dump("/api/bookings/recent/", "recent_bookings.json").catch(() => null);

  // media 디렉터리 통째로 복사
  const mediaSrc = resolve(ROOT, "..", "api", "media");
  if (existsSync(mediaSrc)) {
    await ensureDir(MEDIA_OUT);
    await cp(mediaSrc, MEDIA_OUT, { recursive: true });
    console.log(`✓ media/ → public/seed/media/`);
  }

  console.log("\nSnapshot complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
