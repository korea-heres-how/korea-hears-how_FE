import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { hasAccessToken } from "../api/client";
import { updateMe } from "../api/mypage/me";
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
  const [language, setLanguageState] = useState<Language>(loadLanguage);

  // 로그인한 상태에서 언어를 바꾸면 서버의 앱 언어도 같이 바꾼다. (로그인 전 화면에서는 화면만 바뀜)
  // 서버 저장이 실패해도 화면 언어는 그대로 바뀐 채로 둔다.
  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) return;
      setLanguageState(next);
      if (hasAccessToken()) {
        updateMe({ appLanguage: next === "en" ? "EN" : "KO" }).catch((e) => console.error(e));
      }
    },
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // 저장이 막힌 환경에서는 새로고침하면 한국어로 돌아간다.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
