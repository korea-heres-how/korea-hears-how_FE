import { deleteMockAccount, getMockScannedSigns } from "./mocks/mypage";

// 서버가 내려줄 값들 (백엔드와 필드 확정 전)
// 즐겨찾기는 서버에 연결됨 → api/mypage/favorites.ts

export type ScannedSign = {
  id: string;
  title: string; // 외부 음식 반입 금지
  titleEn: string; // No outside food allowed
  description: string; // 쉬운 설명
  scannedAt: string; // 스캔한 날짜 (ISO 문자열)
  imageUrl?: string; // 없으면 회색 기본 이미지
};

// [임시] 서버 연결 전까지는 true. 서버가 준비되면 false로 바꾸고 mocks/mypage.ts를 지운다.
const USE_MOCK = true;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`불러오지 못했어요 (${res.status})`);
  return res.json();
}

// 서버(안): GET /me/scans
export function getScannedSigns(): Promise<ScannedSign[]> {
  return USE_MOCK ? getMockScannedSigns() : get("/me/scans");
}

// 내 정보 조회·수정·사진 변경은 api/mypage/me.ts (서버 연결됨)

// 회원 탈퇴. 서버(안): DELETE /me
export async function deleteAccount(): Promise<void> {
  if (USE_MOCK) return deleteMockAccount();

  const res = await fetch(`${BASE_URL}/me`, { method: "DELETE" });
  if (!res.ok) throw new Error(`탈퇴하지 못했어요 (${res.status})`);
}
