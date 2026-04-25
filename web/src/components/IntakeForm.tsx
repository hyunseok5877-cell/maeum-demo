"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

type OptionItem = { value: string; label: string; na?: boolean };

const AGE: OptionItem[] = [
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s", label: "50대" },
  { value: "60plus", label: "60대 이상" },
  { value: "na", label: "공개하지 않음", na: true },
];

const MARITAL: OptionItem[] = [
  { value: "single", label: "미혼" },
  { value: "married", label: "기혼" },
  { value: "partnered", label: "장기 파트너" },
  { value: "divorced", label: "이혼" },
  { value: "na", label: "공개하지 않음", na: true },
];

const INCOME: OptionItem[] = [
  { value: "lt_100m", label: "1억 미만" },
  { value: "100_300m", label: "1억 – 3억" },
  { value: "300_500m", label: "3억 – 5억" },
  { value: "500_1b", label: "5억 – 10억" },
  { value: "gte_1b", label: "10억 이상" },
  { value: "na", label: "공개하지 않음", na: true },
];

const ASSET: OptionItem[] = [
  { value: "lt_500m", label: "5억 미만" },
  { value: "500m_1b", label: "5억 – 10억" },
  { value: "1b_3b", label: "10억 – 30억" },
  { value: "3b_10b", label: "30억 – 100억" },
  { value: "gte_10b", label: "100억 이상" },
  { value: "na", label: "공개하지 않음", na: true },
];

const BUDGET: OptionItem[] = [
  { value: "lt_1m", label: "100만원 미만" },
  { value: "1m_3m", label: "100만 – 300만원" },
  { value: "3m_5m", label: "300만 – 500만원" },
  { value: "5m_10m", label: "500만 – 1,000만원" },
  { value: "gte_10m", label: "1,000만원 이상" },
  { value: "na", label: "상담 후 결정", na: true },
];

const COMPANIONS: OptionItem[] = [
  { value: "alone", label: "혼자" },
  { value: "spouse", label: "배우자" },
  { value: "partner", label: "파트너" },
  { value: "family", label: "가족" },
  { value: "colleague", label: "동료·비즈니스" },
  { value: "friend", label: "친구" },
  { value: "other", label: "기타" },
];

const CATEGORIES: OptionItem[] = [
  { value: "supercar", label: "슈퍼카" },
  { value: "yacht", label: "요트" },
  { value: "equestrian", label: "프라이빗 외승" },
  { value: "kpop", label: "K-pop 컬처" },
  { value: "sports", label: "스포츠" },
  { value: "drive", label: "드라이브" },
  { value: "food", label: "음식" },
];

const MONTHS: OptionItem[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}월`,
}));

const REFERRAL: OptionItem[] = [
  { value: "search", label: "검색" },
  { value: "sns", label: "SNS" },
  { value: "press", label: "언론·매거진" },
  { value: "friend", label: "지인 추천" },
  { value: "curator", label: "큐레이터 초청" },
  { value: "other", label: "기타" },
];

// 한국 행정구역 — 시·도 17 + 각 시·군·구
const REGIONS: { value: string; label: string; districts: string[] }[] = [
  { value: "seoul",    label: "서울특별시",   districts: ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"] },
  { value: "busan",    label: "부산광역시",   districts: ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"] },
  { value: "daegu",    label: "대구광역시",   districts: ["군위군","남구","달서구","달성군","동구","북구","서구","수성구","중구"] },
  { value: "incheon",  label: "인천광역시",   districts: ["강화군","계양구","남동구","동구","미추홀구","부평구","서구","연수구","옹진군","중구"] },
  { value: "gwangju",  label: "광주광역시",   districts: ["광산구","남구","동구","북구","서구"] },
  { value: "daejeon",  label: "대전광역시",   districts: ["대덕구","동구","서구","유성구","중구"] },
  { value: "ulsan",    label: "울산광역시",   districts: ["남구","동구","북구","울주군","중구"] },
  { value: "sejong",   label: "세종특별자치시", districts: ["세종시"] },
  { value: "gyeonggi", label: "경기도",       districts: ["가평군","고양시","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시","성남시","수원시","시흥시","안산시","안성시","안양시","양주시","양평군","여주시","연천군","오산시","용인시","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시"] },
  { value: "gangwon",  label: "강원특별자치도", districts: ["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"] },
  { value: "chungbuk", label: "충청북도",     districts: ["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시","충주시"] },
  { value: "chungnam", label: "충청남도",     districts: ["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시","청양군","태안군","홍성군"] },
  { value: "jeonbuk",  label: "전북특별자치도", districts: ["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시","정읍시","진안군"] },
  { value: "jeonnam",  label: "전라남도",     districts: ["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"] },
  { value: "gyeongbuk",label: "경상북도",     districts: ["경산시","경주시","고령군","구미시","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시"] },
  { value: "gyeongnam",label: "경상남도",     districts: ["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시","통영시","하동군","함안군","함양군","합천군"] },
  { value: "jeju",     label: "제주특별자치도", districts: ["서귀포시","제주시"] },
];

function ChipGroup({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: OptionItem[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  function toggle(v: string) {
    if (multi) {
      const cur = Array.isArray(value) ? value : [];
      onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
    } else {
      onChange(v);
    }
  }
  const selected = useMemo(
    () => (Array.isArray(value) ? new Set(value) : new Set([value])),
    [value]
  );
  return (
    <div className="field-options">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`field-chip ${o.na ? "field-chip--na" : ""} ${
            selected.has(o.value) ? "is-selected" : ""
          }`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function IntakeForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    age_range: "",
    residence_city: "",
    residence_district: "",
    occupation: "",
    company: "",
    marital_status: "",
    annual_income_range: "",
    asset_range: "",
    preferred_category_codes: [] as string[],
    budget_per_experience: "",
    preferred_months: [] as string[],
    companion_types: [] as string[],
    special_occasions: "",
    referral_sources: [] as string[],   // multi
    referral_other: "",                 // 기타 직접입력
    referral_detail: "",
    consent_privacy: false,
    consent_marketing: false,
    consent_profiling: false,
  });

  // 시·도 → 구·동 옵션 동적 매핑
  const districts = useMemo(() => {
    const r = REGIONS.find((x) => x.value === form.residence_city);
    return r ? r.districts : [];
  }, [form.residence_city]);

  // 진행률 — 채워진 항목 / 전체 필수 항목
  const required = [
    form.full_name,
    form.age_range,
    form.residence_city,
    form.marital_status,
    form.budget_per_experience,
    form.preferred_category_codes.length > 0 ? "x" : "",
    form.referral_sources.length > 0 ? "x" : "",
  ];
  const filled = required.filter(Boolean).length;
  const progress = Math.round(
    ((filled + (form.consent_privacy ? 1 : 0)) / (required.length + 1)) * 100
  );

  function set<K extends keyof typeof form>(key: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.consent_privacy) {
      setError("민감 정보 수집·처리 동의는 필수입니다.");
      return;
    }
    setSubmitting(true);
    try {
      // 백엔드 호환: referral_source 단일 필드로 직렬화 (복수 선택 → 콤마 구분 + 기타 텍스트 병합)
      const referralAll = [
        ...form.referral_sources.filter((v) => v !== "other"),
        ...(form.referral_sources.includes("other") && form.referral_other.trim()
          ? [`기타: ${form.referral_other.trim()}`]
          : form.referral_sources.includes("other")
          ? ["other"]
          : []),
      ].join(",");
      const payload = {
        ...form,
        referral_source: referralAll,
        preferred_months: form.preferred_months.map((n) => Number(n)),
      };
      const res = await fetch(`${API_BASE}/members/intake/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(
          res.status === 401
            ? "로그인이 필요합니다. 다시 로그인해 주세요."
            : txt || `저장 실패 (${res.status})`
        );
      }
      router.push("/?welcome=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 진행률 */}
      <div className="intake-progress">
        <div className="intake-progress-bar">
          <div
            className="intake-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="intake-progress-label">
          <span>프로필 완성도</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* 1. 기본 */}
      <section className="intake-section">
        <span className="intake-section-tag">01 · Identité</span>
        <h2>이름과 연령대를 알려주세요.</h2>
        <p className="lead">
          이후 큐레이터가 메시지를 드릴 때 사용하는 호칭이 됩니다.
        </p>

        <div className="field-group">
          <label className="field-label" htmlFor="full_name">
            성함
          </label>
          <input
            id="full_name"
            type="text"
            className="field-input"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="김민재"
            autoComplete="name"
          />
        </div>

        <div className="field-group">
          <label className="field-label">연령대</label>
          <ChipGroup
            options={AGE}
            value={form.age_range}
            onChange={(v) => set("age_range", v as string)}
          />
        </div>
      </section>

      {/* 2. 거주 */}
      <section className="intake-section">
        <span className="intake-section-tag">02 · Résidence</span>
        <h2>주로 머무시는 곳은 어디인가요?</h2>
        <p className="lead">
          일정 조율·픽업·공급자 연결에 활용됩니다. 상세 주소는 묻지 않습니다.
        </p>

        <div className="field-group">
          <label className="field-label" htmlFor="residence_city">
            거주 시·도
          </label>
          <select
            id="residence_city"
            className="field-input field-select"
            value={form.residence_city}
            onChange={(e) => {
              set("residence_city", e.target.value);
              set("residence_district", ""); // 시·도 변경 시 구·동 리셋
            }}
          >
            <option value="">선택해 주세요</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="residence_district">
            시·군·구
          </label>
          <select
            id="residence_district"
            className="field-input field-select"
            value={form.residence_district}
            onChange={(e) => set("residence_district", e.target.value)}
            disabled={districts.length === 0}
          >
            <option value="">
              {form.residence_city ? "선택해 주세요" : "먼저 시·도를 선택해 주세요"}
            </option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 3. 직업·가정 */}
      <section className="intake-section">
        <span className="intake-section-tag">03 · Vie privée</span>
        <h2>현재 어떤 일을 하고 계신가요?</h2>
        <p className="lead">
          직업·소속·혼인 상태는 맥락 파악을 위해 여쭙니다. 입력하지 않으셔도 괜찮습니다.
        </p>

        <div className="field-group">
          <label className="field-label" htmlFor="occupation">
            직업 · 직함 <span className="field-note">(선택)</span>
          </label>
          <input
            id="occupation"
            type="text"
            className="field-input"
            value={form.occupation}
            onChange={(e) => set("occupation", e.target.value)}
            placeholder="예: 경영자 · CFO · 전문직 · 프리랜서"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="company">
            소속 <span className="field-note">(선택)</span>
          </label>
          <input
            id="company"
            type="text"
            className="field-input"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="비공개 원하시면 비워두세요"
          />
        </div>

        <div className="field-group">
          <label className="field-label">혼인 상태</label>
          <ChipGroup
            options={MARITAL}
            value={form.marital_status}
            onChange={(v) => set("marital_status", v as string)}
          />
        </div>
      </section>

      {/* 4. 자산·소득 (민감) */}
      <section className="intake-section">
        <span className="intake-section-tag">04 · Confidentiel</span>
        <h2>경제적 배경에 대한 질문입니다.</h2>
        <p className="lead">
          프리미엄 큐레이션 특성상 예산 범위를 가늠하기 위해 여쭙습니다.
          어떤 문항이든 <em className="not-italic text-brass">&ldquo;공개하지 않음&rdquo;</em>이
          기본값과 다름없이 유효합니다.
        </p>

        <div className="field-group">
          <label className="field-label">연소득 범위</label>
          <ChipGroup
            options={INCOME}
            value={form.annual_income_range}
            onChange={(v) => set("annual_income_range", v as string)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">보유 자산 범위</label>
          <ChipGroup
            options={ASSET}
            value={form.asset_range}
            onChange={(v) => set("asset_range", v as string)}
          />
          <p className="field-note">
            부동산·금융자산 등 순자산 기준. 담당 큐레이터 외 열람 불가.
          </p>
        </div>
      </section>

      {/* 5. 선호 */}
      <section className="intake-section">
        <span className="intake-section-tag">05 · Préférences</span>
        <h2>어떤 경험을 가장 기대하시나요?</h2>
        <p className="lead">복수 선택 가능. 선택하신 분야 위주로 제안드립니다.</p>

        <div className="field-group">
          <label className="field-label">선호 카테고리 (복수 선택)</label>
          <ChipGroup
            options={CATEGORIES}
            value={form.preferred_category_codes}
            onChange={(v) => set("preferred_category_codes", v as string[])}
            multi
          />
        </div>

        <div className="field-group">
          <label className="field-label">1회 경험당 편한 예산</label>
          <ChipGroup
            options={BUDGET}
            value={form.budget_per_experience}
            onChange={(v) => set("budget_per_experience", v as string)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">선호 시기 (복수 선택)</label>
          <ChipGroup
            options={MONTHS}
            value={form.preferred_months}
            onChange={(v) => set("preferred_months", v as string[])}
            multi
          />
        </div>
      </section>

      {/* 6. 동행 */}
      <section className="intake-section">
        <span className="intake-section-tag">06 · Compagnons</span>
        <h2>누구와 함께하실 예정인가요?</h2>

        <div className="field-group">
          <label className="field-label">동행 유형 (복수 선택)</label>
          <ChipGroup
            options={COMPANIONS}
            value={form.companion_types}
            onChange={(v) => set("companion_types", v as string[])}
            multi
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="special_occasions">
            특별한 일정이나 드림 경험이 있다면 알려주세요{" "}
            <span className="field-note">(선택)</span>
          </label>
          <textarea
            id="special_occasions"
            className="field-textarea"
            value={form.special_occasions}
            onChange={(e) => set("special_occasions", e.target.value)}
            placeholder="예: 배우자 생일에 남산 전망 프라이빗 디너, 다음 해 봄 제주에서 프로포즈 등"
            rows={4}
          />
        </div>
      </section>

      {/* 7. 유입 */}
      <section className="intake-section">
        <span className="intake-section-tag">07 · Source</span>
        <h2>마음을 어떻게 알게 되셨나요?</h2>

        <div className="field-group">
          <label className="field-label">유입 경로 (복수 선택)</label>
          <ChipGroup
            options={REFERRAL}
            value={form.referral_sources}
            onChange={(v) => set("referral_sources", v as string[])}
            multi
          />
          {form.referral_sources.includes("other") && (
            <input
              type="text"
              className="field-input field-input--underline mt-2"
              value={form.referral_other}
              onChange={(e) => set("referral_other", e.target.value)}
              placeholder="직접 입력해 주세요"
              aria-label="기타 유입 경로 직접 입력"
            />
          )}
        </div>

        {form.referral_sources.includes("friend") && (
          <div className="field-group">
            <label className="field-label" htmlFor="referral_detail">
              추천인 (닉네임)
            </label>
            <input
              id="referral_detail"
              type="text"
              className="field-input field-input--small"
              value={form.referral_detail}
              onChange={(e) => set("referral_detail", e.target.value)}
              placeholder="예: maeum_curator"
            />
          </div>
        )}
      </section>

      {/* 8. 동의 */}
      <section className="intake-section">
        <span className="intake-section-tag">08 · Consentement</span>
        <h2>개인정보 처리에 동의해 주세요.</h2>

        <div className="field-group">
          <div className="consent-row">
            <input
              id="c_privacy"
              type="checkbox"
              checked={form.consent_privacy}
              onChange={(e) => set("consent_privacy", e.target.checked)}
            />
            <label htmlFor="c_privacy">
              <span className="required">[필수]</span>
              민감 정보(연령·자산·거주지 등) 수집 및 담당 큐레이터 열람에
              동의합니다. 서비스 탈회 시 즉시 삭제됩니다.
            </label>
          </div>
          <div className="consent-row">
            <input
              id="c_market"
              type="checkbox"
              checked={form.consent_marketing}
              onChange={(e) => set("consent_marketing", e.target.checked)}
            />
            <label htmlFor="c_market">
              [선택] 시즌 시그니처·비공개 초청장을 이메일로 받겠습니다.
            </label>
          </div>
          <div className="consent-row">
            <input
              id="c_prof"
              type="checkbox"
              checked={form.consent_profiling}
              onChange={(e) => set("consent_profiling", e.target.checked)}
            />
            <label htmlFor="c_prof">
              [선택] 답변 내용을 토대로 큐레이션 추천 알고리즘 학습에
              활용하는 것에 동의합니다.
            </label>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-[14px] text-[color:var(--color-error)] mb-4">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !form.consent_privacy}
        className="intake-submit"
      >
        {submitting ? "제출 중…" : "프로필 완성하기 →"}
      </button>
    </form>
  );
}
