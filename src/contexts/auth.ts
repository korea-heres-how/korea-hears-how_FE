import { createContext, useContext } from "react";
import type { LoginResult } from "../api/auth/types";

export type AuthContextValue = {
  user: LoginResult | null;
  login: (email: string, password: string) => Promise<void>;
  // 앱에서만 로그인 정보를 지운다. (토큰 만료 401, 회원 탈퇴처럼 서버 토큰이 이미 무효일 때)
  logout: () => void;
  // 로그아웃 버튼: 서버에 지금 토큰을 무효로 해 달라고 보내고 앱에서도 지운다.
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있어요.");
  return value;
}
