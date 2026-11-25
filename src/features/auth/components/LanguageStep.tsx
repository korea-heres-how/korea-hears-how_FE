import { useState } from "react";
import done from "../../../assets/auth/done.svg";
import { type Language, useLanguage, useT } from "../../../contexts/language";
import { primaryButtonClassName } from "./authStyles";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

const LANGUAGES = [
  { id: "en", badge: "EN", label: "English", sub: "English guide" },
  { id: "ko", badge: "한", label: "한국어", sub: "한국어 안내" },
] as const satisfies readonly { id: Language; badge: string; label: string; sub: string }[];

// 회원가입 마지막 단계: 언어 고르기. 앱 언어(LanguageProvider)와 같은 값이라 고르면 앱 전체가 바로 바뀐다.
// 따로 고르지 않고 넘어가면 지금 앱 언어(기본값 한국어)가 그대로 유지되고, 이 값으로 가입 요청을 보낸다.
// onNext는 가입 요청이라 실패하면 오류를 던진다. (실패 안내는 SignupPage가 위쪽 팝업으로)
export default function LanguageStep({ onNext }: { onNext: () => Promise<void> }) {
  const t = useT();
  const { language: selected, setLanguage: setSelected } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await onNext();
    } catch {
      // 실패 안내는 SignupPage가 위쪽 팝업으로 보여준다.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[min(1.125rem,18px)] border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.95)] p-[min(1.3125rem,21px)] text-center">
      <h1 className="text-[min(1.4375rem,23px)] leading-[min(1.796875rem,28.75px)] font-bold tracking-[-0.025em] text-[#2B2118]">
        {t("어떤 언어로 안내해드릴까요?", "Choose your guide language")}
      </h1>
      <p className="pt-[min(0.25rem,4px)] text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[rgba(43,33,24,0.7)]">
        {t("Choose your guide language", "어떤 언어로 안내해드릴까요?")}
      </p>

      <div role="radiogroup" aria-label={t("안내 언어", "Guide language")} className="flex flex-col gap-[min(0.75rem,12px)] pt-[min(1.25rem,20px)]">
        {LANGUAGES.map((lang) => {
          const active = lang.id === selected;
          return (
            <button
              key={lang.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(lang.id)}
              className={`flex h-[min(4.25rem,68px)] items-center gap-[min(0.75rem,12px)] rounded-[min(0.875rem,14px)] border-2 px-[min(1.125rem,18px)] text-left ${
                active
                  ? "border-[#E07A5F] bg-white shadow-[0_0_0_2px_rgba(224,122,95,0.25)]"
                  : "border-[rgba(43,33,24,0.1)] bg-[rgba(255,255,255,0.6)]"
              }`}
            >
              <span
                className={`flex size-[min(2.25rem,36px)] shrink-0 items-center justify-center rounded-full text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] font-semibold ${
                  active ? "bg-[#E07A5F] text-[#F1E6D2]" : "bg-[#F1E6D2] text-[rgba(43,33,24,0.6)]"
                }`}
              >
                {lang.badge}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`text-[min(0.9375rem,15px)] leading-[min(1.171875rem,18.75px)] ${
                    active ? "font-semibold text-[#2B2118]" : "font-medium text-[rgba(43,33,24,0.8)]"
                  }`}
                >
                  {lang.label}
                </span>
                <span className="text-[min(0.6875rem,11px)] leading-[min(0.859375rem,13.75px)] text-[rgba(43,33,24,0.55)]">
                  {lang.sub}
                </span>
              </span>
              <span
                className={`flex size-[min(1.5rem,24px)] shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? "border-[#E07A5F] bg-[#E07A5F]" : "border-[rgba(43,33,24,0.2)]"
                }`}
              >
                {active && <img src={done} alt="" style={{ width: size(15), height: size(14) }} />}
              </span>
            </button>
          );
        })}
      </div>

      <p className="pt-[min(1rem,16px)] text-[min(0.75rem,12px)] leading-[min(1.125rem,18px)] text-[rgba(43,33,24,0.7)]">
        {t("언제든 마이페이지에서 바꿀 수 있어요.", "You can change this anytime in My Page.")}
      </p>
      <div className="pt-[min(1.25rem,20px)]">
        <button type="button" onClick={handleNext} disabled={loading} className={primaryButtonClassName}>
          {t("다음", "Next")}
        </button>
      </div>
    </div>
  );
}
