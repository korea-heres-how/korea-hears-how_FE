import { useCallback } from "react";
import { useLanguage } from "./language";

// 서버·필터 값은 한국어 그대로 두고, 화면에 보여줄 때만 영어로 바꾼다.
const CATEGORY_EN: Record<string, string> = {
  전체: "All",
  관광지: "Attractions",
  문화시설: "Culture",
  음식점: "Restaurants",
  시장: "Markets",
  카페: "Cafés",
  교통: "Transport",
  쇼핑: "Shopping",
  기타: "Others",
};

const FEEDBACK_REASON_EN: Record<string, string> = {
  "잘못된 정보": "Wrong information",
  "이해하기 어려움": "Hard to understand",
  "실제 장소와 다름": "Different from the actual place",
  기타: "Other",
};

// 세부 분류 (서버가 주는 한국어 값). 여기 없는 값은 한국어 그대로 보여준다.
const SUBCATEGORY_EN: Record<string, string> = {
  고궁: "Royal palace",
  사찰: "Temple",
  "전통 마을": "Traditional village",
  전통시장: "Traditional market",
  "스페셜티 커피": "Specialty coffee",
  "카페 골목": "Café street",
  한식당: "Korean restaurant",
  전망대: "Observatory",
};

// 운영 상태 한 조각 → 영어. 시간이 들어간 문구는 숫자만 뽑아서 바꾼다.
const STATUS_RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^운영 중$/, () => "Open now"],
  [/^혼잡$/, () => "Busy"],
  [/^늦게까지 운영$/, () => "Open late"],
  [/^(오전|오후) (\d{1,2})시까지 (운영|개방)$/, (m) => `Open until ${m[2]} ${m[1] === "오전" ? "AM" : "PM"}`],
  [/^(오전|오후) (\d{1,2})시 이후 정숙$/, (m) => `Quiet after ${m[2]} ${m[1] === "오전" ? "AM" : "PM"}`],
];

// 운영 상태 한 줄 ("혼잡 · 오후 10시까지 운영" → "Busy · Open until 10 PM").
// [임시] 서버가 상태를 한국어 문장으로 줘서 정해진 형태만 바꾼다. 모르는 형태가 섞여 있으면 반만 영어가 되지 않게 원문 그대로 둔다.
function translateStatus(status: string) {
  const parts = status.split(" · ").map((part) => {
    for (const [pattern, toEn] of STATUS_RULES) {
      const m = part.match(pattern);
      if (m) return toEn(m);
    }
    return null;
  });
  return parts.every((part) => part !== null) ? parts.join(" · ") : status;
}

function useLabel(table: Record<string, string>) {
  const { language } = useLanguage();
  return useCallback(
    (value: string) => (language === "en" ? (table[value] ?? value) : value),
    [language, table],
  );
}

// 분류 이름 (관광지 → Attractions)
export const useCategoryLabel = () => useLabel(CATEGORY_EN);

// "어떤 점이 아쉬웠나요?" 선택지 (잘못된 정보 → Wrong information)
export const useFeedbackReasonLabel = () => useLabel(FEEDBACK_REASON_EN);

// 세부 분류 (고궁 → Royal palace)
export const useSubcategoryLabel = () => useLabel(SUBCATEGORY_EN);

// 운영 상태 (오후 6시까지 운영 → Open until 6 PM)
export function useStatusLabel() {
  const { language } = useLanguage();
  return useCallback((status: string) => (language === "en" ? translateStatus(status) : status), [language]);
}
