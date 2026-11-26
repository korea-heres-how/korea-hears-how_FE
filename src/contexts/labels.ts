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
