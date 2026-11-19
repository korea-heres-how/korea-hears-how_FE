import { apiRequest } from "../client";
import type { LocalizedCard, LocalizedCardPage, NearbyPlace, NearbyQuery, ServerCategoryCode } from "./types";

const CATEGORY_FROM_CODE: Record<ServerCategoryCode, NearbyPlace["category"]> = {
  attraction: "관광지",
  culture: "문화시설",
  restaurant: "음식점",
  market: "시장",
  cafe: "카페",
};

// 서버 분류 코드 → 화면의 한국어 분류. 목록에 없는 코드(accommodation 등)는 "기타". (장소 상세도 같이 쓴다)
export const toCategory = (code: string | null): NearbyPlace["category"] =>
  (code && CATEGORY_FROM_CODE[code as ServerCategoryCode]) || "기타";

function toNearbyPlace(card: LocalizedCard): NearbyPlace {
  const ko = card.name.ko ?? card.name.en ?? "";
  const en = card.name.en ?? card.name.ko ?? "";
  return {
    id: card.place_id,
    title: ko,
    titleEn: en,
    category: toCategory(card.category.code),
    subcategory: card.category.detail_label ?? "",
    status: card.business_status.label,
    statusColor: card.business_status.color,
    tip: card.etiquette_preview ?? "",
    position: card.location ? { lat: card.location.latitude, lng: card.location.longitude } : null,
  };
}

// 한 번에 받을 수 있는 최대 개수(서버 제한 10)와, 지도에 보여줄 최대 개수
const PAGE_SIZE = 10;
// 외부 관광정보 서버 호출 한도(429 FASTAPI_RATE_LIMITED) 때문에 한 번 검색에 최대 3번만 요청한다.
const MAX_PLACES = 30;
// 서버가 받는 반경 범위 (m)
const MAX_RADIUS_M = 20000;
// 지도를 많이 확대해도 최소 이만큼은 검색한다. (화면 밖 장소는 카드를 누르면 지도가 그쪽으로 이동)
export const MIN_RADIUS_M = 1000;

// 실제로 서버에 보내는 반경: 최소 1km ~ 최대 20km
export const toRequestRadius = (radiusM: number) =>
  Math.min(Math.max(Math.ceil(radiusM), MIN_RADIUS_M), MAX_RADIUS_M);

// GET /api/places/nearby?latitude&longitude&radius_m&language&page&page_size
function fetchPage(query: NearbyQuery, page: number) {
  return apiRequest<LocalizedCardPage>("/api/places/nearby", {
    query: {
      latitude: query.latitude,
      longitude: query.longitude,
      radius_m: toRequestRadius(query.radiusM),
      language: query.language,
      page,
      page_size: PAGE_SIZE,
    },
  });
}

// 반경 안의 장소를 가까운 순으로 최대 MAX_PLACES개까지 가져온다.
// 첫 페이지의 total_count를 보고 필요한 페이지만 한꺼번에 더 요청한다.
// 첫 페이지가 실패하면 오류를 던지고, 그 뒤 페이지는 실패해도(호출 한도 등) 받은 것까지만 보여준다.
export async function getNearbyPlaces(query: NearbyQuery): Promise<NearbyPlace[]> {
  const first = await fetchPage(query, 1);
  const total = Math.min(first.pagination.total_count, MAX_PLACES);
  const pageCount = Math.ceil(total / PAGE_SIZE);

  const results =
    first.pagination.has_next && pageCount > 1
      ? await Promise.allSettled(Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(query, i + 2)))
      : [];
  const rest = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  const failed = results.length - rest.length;
  if (failed > 0) console.warn(`[api] 주변 장소 ${pageCount}페이지 중 ${failed}페이지를 받지 못해 일부만 보여줘요.`);

  const cards = [first, ...rest].flatMap((page) => page.items).slice(0, MAX_PLACES);
  // 페이지 사이에 같은 장소가 겹쳐 오면 한 번만 남긴다.
  const seen = new Set<string>();
  return cards.filter((card) => !seen.has(card.place_id) && seen.add(card.place_id)).map(toNearbyPlace);
}
