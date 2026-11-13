import { createContext, useCallback, useContext } from "react";

// 앱 화면 언어. 기본값은 한국어.
export type Language = "ko" | "en";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage는 LanguageProvider 안에서만 쓸 수 있어요.");
  return value;
}

// 지금 언어에 맞는 문구를 고른다. t("다음", "Next")
export function useT() {
  const { language } = useLanguage();
  return useCallback(
    <K, E>(ko: K, en: E): K | E => (language === "ko" ? ko : en),
    [language],
  );
}
