import { useState } from "react";
import type { PlaceDetail } from "../../../api/places";
import PhraseCard from "../../../components/PhraseCard";
import { useT } from "../../../contexts/language";

type Mode = "hear" | "say";

// 관광지 상세 "현장 한국어" 탭: 들을 수 있는 말 / 내가 할 말 전환 + 공통 표현 카드.
// 전환 버튼 아이콘은 반대색 파일이 아직 없어서 빼 두었다.
export default function PhrasesTab({ detail }: { detail: PlaceDetail }) {
  const t = useT();
  const [mode, setMode] = useState<Mode>("say");
  const phrases = mode === "say" ? detail.phrasesSay : detail.phrasesHear;

  return (
    <div>
      <div className="flex gap-[min(0.25rem,4px)] rounded-[min(0.5rem,8px)] bg-[rgba(43,33,24,0.05)] p-[min(0.25rem,4px)]">
        <ModeButton
          label={t("들을 수 있는 말", "You might hear")}
          sub={t("You might hear", "들을 수 있는 말")}
          active={mode === "hear"}
          onClick={() => setMode("hear")}
        />
        <ModeButton
          label={t("내가 할 말", "What to say back")}
          sub={t("What to say back", "내가 할 말")}
          active={mode === "say"}
          onClick={() => setMode("say")}
        />
      </div>

      <p className="px-[min(0.125rem,2px)] pt-[min(0.75rem,12px)] text-[min(0.75rem,12px)] leading-[min(1.03125rem,16.5px)] text-[rgba(43,33,24,0.5)]">
        {t(
          "그대로 읽거나 화면에 보여주면 통해요. 말이 어려우면 Show to staff 를 눌러 크게 보여주세요.",
          "Read it out or just show the screen. If speaking is hard, tap Show to staff to show it in large text.",
        )}
      </p>

      <div className="flex flex-col gap-[min(0.5rem,8px)] pt-[min(0.75rem,12px)]">
        {phrases.map((phrase) => (
          <PhraseCard key={phrase.id} phrase={phrase} />
        ))}
      </div>
    </div>
  );
}

function ModeButton({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-[min(2.46875rem,39.5px)] flex-1 flex-col items-center justify-center rounded-[min(0.375rem,6px)] ${
        active ? "bg-[#E07A5F]" : ""
      }`}
    >
      <span
        className={`text-[min(0.78125rem,12.5px)] leading-[min(0.9765625rem,15.625px)] font-medium ${
          active ? "text-[#F1E6D2]" : "text-[rgba(43,33,24,0.55)]"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[min(0.59375rem,9.5px)] leading-[min(0.7421875rem,11.875px)] font-medium ${
          active ? "text-[rgba(241,230,210,0.7)]" : "text-[rgba(43,33,24,0.35)]"
        }`}
      >
        {sub}
      </span>
    </button>
  );
}
