import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type Language, LanguageContext } from "./language";

// 고른 언어는 localStorage에 둔다. → 새로고침하거나 탭을 새로 열어도 유지된다.
const STORAGE_KEY = "language";

function loadLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ko";
  } catch {
    return "ko";
  }
}

// 모든 언어 토글(로그인 헤더, 지도 헤더, 마이페이지)이 이 값 하나를 같이 본다.
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(loadLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // 저장이 막힌 환경에서는 새로고침하면 한국어로 돌아간다.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
