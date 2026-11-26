import { apiRequest, toServerUrl } from "../client";
import type { ScannedSignPage, SignHistoryPageResponse } from "./types";

// 서버 createdAt에는 시간대가 없어서("2026-11-26T04:11:39.377693") UTC로 보고 읽는다.
function toIso(createdAt: string) {
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(createdAt) ? createdAt : `${createdAt}Z`;
}

// GET /api/users/me/signs?page&page_size
// 내가 해석한 안내문 기록 (성공한 것만, 최근순). page는 1부터, page_size는 1~50.
export async function getScannedSigns(page: number, pageSize: number): Promise<ScannedSignPage> {
  const data = await apiRequest<SignHistoryPageResponse>("/api/users/me/signs", {
    query: { page, page_size: pageSize },
  });
  return {
    signs: data.items.map((item) => ({
      scanId: item.scanId,
      fromPhoto: item.sourceType === "IMAGE",
      title: item.title,
      scannedAt: toIso(item.createdAt),
      // 사진 해석이고 서버가 썸네일을 주면 그 사진, 아니면(텍스트 해석·썸네일 없음) 카드에서 기본 이미지
      imageUrl: item.thumbnailUrl ? toServerUrl(item.thumbnailUrl) : undefined,
    })),
    total: data.totalElements,
    hasMore: data.page < data.totalPages,
  };
}
