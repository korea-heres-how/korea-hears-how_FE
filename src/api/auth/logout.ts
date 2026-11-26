import { apiRequest } from "../client";

// POST /api/auth/logout (본문 없음)
// 지금 쓰는 토큰 하나만 서버에서 무효로 만든다. 다른 기기의 로그인은 그대로 유지된다.
// 이미 무효인 토큰이면 401. 성공해도 앱에 있는 토큰은 따로 지워야 한다. (AuthProvider의 signOut)
export async function logoutApi(): Promise<void> {
  await apiRequest("/api/auth/logout", { method: "POST" });
}
