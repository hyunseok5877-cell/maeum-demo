import { test, expect } from "@playwright/test";

test.describe("마음 (Maeum) — Smoke", () => {
  test("홈페이지 히어로·로고 렌더링", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("img[alt='마음']").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /꿈꾸던 하루/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "경험 둘러보기" })).toBeVisible();
  });

  test("히어로 서브카피에 '슈퍼카 · 요트 · 프라이빗 외승' 표시", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toContainText("슈퍼카");
    await expect(body).toContainText("요트");
    await expect(body).toContainText("외승");
  });

  test("'금지어(여행/투어/관광)' 포함 0건", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    // 금지어 검증 — 법적 리스크 불변 규칙
    expect(html).not.toMatch(/여행/);
    expect(html).not.toMatch(/투어/);
    expect(html).not.toMatch(/관광/);
  });

  test("중개자 고지가 푸터에 노출", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText("통신판매 중개자");
    await expect(page.locator("footer")).toContainText("제휴 공급사");
  });

  test("이 주의 큐레이션 섹션 존재 + 카드 최소 1개 (API 데이터 연동 확인)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "이 주의 큐레이션" })).toBeVisible();
    // 카드는 <a href="/experiences/...">로 렌더됨
    const cards = page.locator('a[href^="/experiences/"]').filter({ hasText: /./ });
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test("할인된 경험은 원가 line-through 표시", async ({ page }) => {
    await page.goto("/");
    // 시드 데이터에서 페라리 15% 할인 적용됨
    const card = page.locator('a[href*="ferrari-sunset-namsan"]');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card.locator(".line-through").first()).toBeVisible();
    await expect(card).toContainText("15% OFF");
  });

  test("백엔드 API /api/health 응답", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/health/");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.service).toBe("maeum-api");
  });

  test("백엔드 featured 경험 API가 데이터 반환", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/experiences/featured/");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);
    // 첫 번째 경험의 필수 필드 검증
    const first = data.results[0];
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("title_ko");
    expect(first).toHaveProperty("final_price");
    expect(first).toHaveProperty("discount_percentage");
  });
});
