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
    const first = data.results[0];
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("title_ko");
    expect(first).toHaveProperty("final_price");
    expect(first).toHaveProperty("discount_percentage");
  });

  test("/quiz 페이지 렌더 + 테스트 시작 버튼", async ({ page }) => {
    await page.goto("/quiz");
    await expect(page.getByRole("heading", { name: /당신이 원하는 건/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /테스트 시작/ })).toBeVisible();
  });

  test("/request-curation 3-step 폼 렌더", async ({ page }) => {
    await page.goto("/request-curation");
    await expect(page.getByRole("heading", { name: /나만의 하루를/ })).toBeVisible();
    await expect(page.getByText("1. 무엇을 원하시나요?")).toBeVisible();
  });

  test("/regions 지역 카드 렌더", async ({ page }) => {
    await page.goto("/regions");
    await expect(page.getByRole("heading", { name: /어디에서/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "서울" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "부산" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "제주" })).toBeVisible();
  });

  test("/experiences?region=seoul 필터 동작", async ({ page }) => {
    await page.goto("/experiences?region=seoul");
    // 서울 경험만 노출되어야 함 (람보르기니·페라리)
    await expect(page.locator('a[href*="ferrari-sunset-namsan"]')).toBeVisible();
    await expect(page.locator('a[href*="lamborghini-seoul-urban-drive"]')).toBeVisible();
    // 제주 경험은 노출되면 안 됨
    await expect(page.locator('a[href*="jeju-"]')).toHaveCount(0);
    // 지역 배지·해제 링크 존재
    await expect(page.getByText("SEOUL", { exact: true })).toBeVisible();
    await expect(page.getByText(/지역 해제/)).toBeVisible();
  });

  test("퀴즈 API end-to-end — 제출·결과", async ({ request }) => {
    const submit = await request.post("http://localhost:8000/api/curation/quiz/submit/", {
      data: {
        answers: {
          Q1: "luxury",
          Q2: "couple",
          Q3: "sunset",
          Q4: "b3",
          Q5: "pure_luxe",
          Q6: "verified",
        },
      },
    });
    expect(submit.status()).toBe(201);
    const { session_token, type } = await submit.json();
    expect(type).toBe("NOCTURNE_LUXE");

    const result = await request.get(
      `http://localhost:8000/api/curation/quiz/result/${session_token}/`
    );
    expect(result.status()).toBe(200);
    const data = await result.json();
    expect(data.result_type.code).toBe("NOCTURNE_LUXE");
    expect(data.recommended_experiences.length).toBeGreaterThan(0);
  });

  test("홈에 국가 섹션 + 한국 OPEN + 나머지 Coming Soon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "국가를 먼저 고르세요." })).toBeVisible();
    // 한국은 링크(OPEN)로 렌더 — /regions로 이동
    const koreaLink = page.getByRole("link", { name: "한국" });
    await expect(koreaLink).toBeVisible();
    // 나머지는 Coming Soon
    await expect(page.getByLabel("일본")).toBeVisible();
    await expect(page.getByLabel("프랑스")).toBeVisible();
    await expect(page.getByLabel("이탈리아")).toBeVisible();
    // Coming Soon 라벨 노출 개수 = active 아닌 국가 수
    const comingSoon = page.getByText("COMING SOON", { exact: true });
    await expect(comingSoon.first()).toBeVisible();
  });

  test("카탈로그 탭 — 요트 선택 시 요트 경험만 노출", async ({ page }) => {
    await page.goto("/experiences?category=yacht");
    await expect(page.locator('a[href*="haeundae-private-yacht"]')).toBeVisible();
    await expect(page.locator('a[href*="busan-night-yacht"]')).toBeVisible();
    // 슈퍼카·외승은 없어야 함
    await expect(page.locator('a[href*="lamborghini-"]')).toHaveCount(0);
    await expect(page.locator('a[href*="jeju-private-equestrian"]')).toHaveCount(0);
  });

  test("큐레이션 요청 API — 게스트 접수", async ({ request }) => {
    const res = await request.post("http://localhost:8000/api/curation/requests/", {
      data: {
        guest_name: "홍길동",
        guest_email: "test@example.com",
        pax_count: 2,
        occasion: "anniversary",
        free_text: "E2E 테스트 요청",
        source: "web_form",
      },
    });
    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.status).toBe("new");
  });
});
