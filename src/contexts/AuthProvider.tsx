import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { login as loginApi } from "../api/auth/login";
import { logoutApi } from "../api/auth/logout";
import type { LoginResult } from "../api/auth/types";
import { setAccessToken, setUnauthorizedHandler } from "../api/client";
import { AuthContext } from "./auth";
import { clearSavedPhrases, setSavedPhrasesOwner } from "./savedPhrases";

// 로그인 정보는 sessionStorage에 둔다.
// → 새로고침해도 유지되고, 탭을 닫았다가 새로 열면 지워져서 스플래시 다음에 다시 로그인 화면이 나온다.
const STORAGE_KEY = "auth";

function loadUser(): LoginResult | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    // 예전(mock) 형식으로 저장된 값이면 무시한다.
    if (!parsed?.accessToken) return null;
    setAccessToken(parsed.accessToken);
    setSavedPhrasesOwner(parsed.email);
    return parsed;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResult | null>(loadUser);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password);
    setAccessToken(result.accessToken);
    setSavedPhrasesOwner(result.email);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // 저장이 막힌 환경(시크릿 모드 등)에서는 새로고침 전까지만 로그인이 유지된다.
    }
    setUser(result);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    // 기기에 저장해 둔 표현 보관함도 지운다. (다른 사람이 같은 기기로 로그인할 수 있어서)
    clearSavedPhrases();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // 저장이 막힌 환경이면 지울 것도 없다.
    }
    setUser(null);
  }, []);

  // 로그아웃 버튼. 서버 요청에 지금 토큰을 실은 뒤 바로 앱에서 지워서, 응답을 기다리지 않고 로그인 화면으로 간다.
  // 서버 요청이 실패해도(인터넷 끊김·이미 무효인 토큰 등) 앱에서는 로그아웃된다.
  const signOut = useCallback(() => {
    const request = logoutApi(); // 토큰은 요청을 보내는 순간 헤더에 실리므로 바로 지워도 된다.
    logout();
    request.catch((e) => console.warn("[auth] 서버 로그아웃 실패 (앱에서는 로그아웃됨)", e));
  }, [logout]);

  // 토큰이 만료돼서 401이 오면 로그아웃 → RequireAuth가 로그인 화면으로 보낸다.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout, signOut }), [user, login, logout, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
