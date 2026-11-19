import { apiRequest } from "../client";
import type { ImagePage, PlaceImage } from "./types";

// 한 번 받은 사진은 장소별로 기억해서, 지도를 옮겨 같은 장소가 다시 나와도 요청하지 않는다.
// 같은 장소를 동시에 여러 카드가 요청해도 한 번만 보내도록 Promise째로 둔다.
const cache = new Map<string, Promise<PlaceImage | null>>();

// GET /api/places/{placeId}/images?page=1&page_size=1
// 카드에는 사진 한 장만 쓰므로 첫 장만 받는다. 사진이 없으면(빈 목록도 정상 응답) null.
export function getPlaceThumbnail(placeId: string): Promise<PlaceImage | null> {
  const saved = cache.get(placeId);
  if (saved) return saved;

  const request = apiRequest<ImagePage>(`/api/places/${encodeURIComponent(placeId)}/images`, {
    query: { page: 1, page_size: 1 },
  }).then((data) => (data.items[0] ? { url: data.items[0].url } : null));

  // 실패(호출 한도 등)는 기억하지 않아서, 다음에 카드가 다시 보이면 또 시도한다.
  request.catch(() => cache.delete(placeId));
  cache.set(placeId, request);
  return request;
}
