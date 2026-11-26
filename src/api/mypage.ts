import { deleteMockAccount } from "./mocks/mypage";

// 서버가 내려줄 값들 (백엔드와 필드 확정 전)
// 즐겨찾기 → api/mypage/favorites.ts, 스캔한 안내문 → api/mypage/signs.ts (서버 연결됨)

// [임시] 서버 연결 전까지는 true. 서버가 준비되면 false로 바꾸고 mocks/mypage.ts를 지운다.
const USE_MOCK = true;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 내 정보 조회·수정·사진 변경은 api/mypage/me.ts (서버 연결됨)

// 회원 탈퇴. 서버(안): DELETE /me
export async function deleteAccount(): Promise<void> {
  if (USE_MOCK) return deleteMockAccount();

  const res = await fetch(`${BASE_URL}/me`, { method: "DELETE" });
  if (!res.ok) throw new Error(`탈퇴하지 못했어요 (${res.status})`);
}
