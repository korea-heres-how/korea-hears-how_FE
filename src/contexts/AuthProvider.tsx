import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { type LoginResult, login as loginApi } from "../api/auth/login";
import { setAccessToken, setUnauthorizedHandler } from "../api/client";
import { AuthContext } from "./auth";

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
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // 저장이 막힌 환경(시크릿 모드 등)에서는 새로고침 전까지만 로그인이 유지된다.
    }
    setUser(result);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // 저장이 막힌 환경이면 지울 것도 없다.
    }
    setUser(null);
  }, []);

  // 토큰이 만료돼서 401이 오면 로그아웃 → RequireAuth가 로그인 화면으로 보낸다.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
