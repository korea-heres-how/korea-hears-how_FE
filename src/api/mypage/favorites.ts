import { apiRequest } from "../client";
import type { FavoritePage, FavoritePageResponse } from "./types";

// 서버가 한 번에 주는 최대 개수
const MAX_PAGE_SIZE = 50;

// GET /api/users/me/favorites?page&page_size
// 최근 저장순 즐겨찾기 장소 ID. page는 1부터, page_size는 1~50.
export async function getFavorites(page: number, pageSize: number): Promise<FavoritePage> {
  const data = await apiRequest<FavoritePageResponse>("/api/users/me/favorites", {
    query: { page, page_size: pageSize },
  });
  return {
    placeIds: data.items.map((item) => item.placeId),
    total: data.totalElements,
    hasMore: data.page < data.totalPages,
  };
}

// 이 장소가 내 즐겨찾기에 있는지. 서버에 따로 확인하는 API가 없어서 목록을 50개씩 넘겨 보며 찾는다.
export async function isFavorite(placeId: string): Promise<boolean> {
  for (let page = 1; ; page++) {
    const result = await getFavorites(page, MAX_PAGE_SIZE);
    if (result.placeIds.includes(placeId)) return true;
    if (!result.hasMore) return false;
  }
}

// POST /api/favorites/{placeId}
// 즐겨찾기 추가. 이미 있어도 성공(저장 시각은 처음 그대로).
export async function addFavorite(placeId: string): Promise<void> {
  await apiRequest(`/api/favorites/${encodeURIComponent(placeId)}`, { method: "POST" });
}

// DELETE /api/favorites/{placeId}
// 즐겨찾기 삭제. 이미 없어도 성공.
export async function removeFavorite(placeId: string): Promise<void> {
  await apiRequest(`/api/favorites/${encodeURIComponent(placeId)}`, { method: "DELETE" });
}
