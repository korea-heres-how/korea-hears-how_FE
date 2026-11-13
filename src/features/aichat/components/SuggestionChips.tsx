import { useT } from "../../../contexts/language";

// 추천 질문. 누르면 고른 언어 문장이 그대로 질문으로 보내진다.
const SUGGESTIONS = [
  {
    ko: "지하철에서 통화해도 되나요?",
    en: "Can I talk on the phone on the subway?",
  },
  {
    ko: "여기서 신발을 벗어야 하나요?",
    en: "Do I need to take off my shoes here?",
  },
  {
    ko: "한국 식당에서 팁을 줘야 하나요?",
    en: "Should I tip at Korean restaurants?",
  },
  {
    ko: "한국 카페에서 어떻게 주문해요?",
    en: "How do I order at a Korean café?",
  },
  { ko: "쟁반은 어떻게 해야 해요?", en: "What do I do with my tray?" },
];

type SuggestionChipsProps = {
  // 누르면 그 질문이 바로 보내진다.
  onSelect: (question: string) => void;
};

// "이런 걸 물어보세요" 추천 질문 버튼 목록
export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  const t = useT();
  return (
    <div className="pt-[min(0.25rem,4px)]">
      <div className="flex items-baseline gap-[min(0.375rem,6px)] pb-[min(0.5rem,8px)]">
        <span className="text-[min(0.75rem,12px)] leading-[min(1.125rem,18px)] text-[rgba(43,33,24,0.5)]">
          {t("이런 걸 물어보세요", "Try asking")}
        </span>
        <span className="text-[min(0.625rem,10px)] leading-[min(0.9375rem,15px)] text-[rgba(43,33,24,0.35)]">
          {t("Try asking", "이런 걸 물어보세요")}
        </span>
      </div>
      <div className="flex flex-wrap gap-[min(0.5rem,8px)]">
        {SUGGESTIONS.map(({ ko, en }) => {
          const question = t(ko, en);
          return (
            <button
              key={ko}
              type="button"
              onClick={() => onSelect(question)}
              className="rounded-full border border-[rgba(43,33,24,0.08)] bg-white px-[min(0.9375rem,15px)] py-[min(0.5625rem,9px)] text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[rgba(43,33,24,0.7)]"
            >
              {question}
            </button>
          );
        })}
      </div>
    </div>
  );
}
