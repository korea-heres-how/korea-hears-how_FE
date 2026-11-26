import {
  addMockFavorite,
  deleteMockAccount,
  getMockFavorites,
  getMockScannedSigns,
  removeMockFavorite,
} from "./mocks/mypage";

// 서버가 내려줄 값들 (백엔드와 필드 확정 전)

export type FavoritePlace = {
  id: string;
  name: string; // 경복궁
  nameEn: string; // Gyeongbokgung Palace
  category: string; // 관광지, 문화시설, 음식점, 시장, 카페 …
  distanceM?: number; // 내 위치에서의 거리(m)
  imageUrl?: string; // 없으면 회색 기본 이미지
};

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

// 서버(안): GET /me/favorites
export function getFavorites(): Promise<FavoritePlace[]> {
  return USE_MOCK ? getMockFavorites() : get("/me/favorites");
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

async function send(method: "PUT" | "DELETE", path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { method });
  if (!res.ok) throw new Error(`저장하지 못했어요 (${res.status})`);
}

// 장소를 즐겨찾기에 추가한다. 서버(안): PUT /me/favorites/:placeId
export function addFavorite(placeId: string): Promise<void> {
  return USE_MOCK ? addMockFavorite(placeId) : send("PUT", `/me/favorites/${placeId}`);
}

// 즐겨찾기에서 뺀다. 서버(안): DELETE /me/favorites/:placeId
export function removeFavorite(placeId: string): Promise<void> {
  return USE_MOCK ? removeMockFavorite(placeId) : send("DELETE", `/me/favorites/${placeId}`);
}
