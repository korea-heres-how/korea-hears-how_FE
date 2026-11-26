import { useEffect, useRef, useState } from "react";
import { getPlaceThumbnail } from "../../../api/map/images";
import { getPlaceDetail } from "../../../api/place/detail";
import type { PlaceDetail } from "../../../api/place/types";
import { DEFAULT_PLACE_IMAGE } from "../../../components/placeImage";
import type { Language } from "../../../contexts/language";

// 즐겨찾기 카드에 쓰는 장소 정보 (상세 API에서 필요한 것만)
export type FavoritePlaceInfo = Pick<PlaceDetail, "title" | "titleEn" | "category" | "position">;

// 마이페이지 ↔ 전체 보기를 오가도 같은 장소를 다시 요청하지 않게 장소·언어별로 기억한다.
// 실패(호출 한도 등)는 기억하지 않아서 다음에 카드가 다시 보이면 또 시도한다.
const cache = new Map<string, Promise<FavoritePlaceInfo>>();

function getInfo(placeId: string, language: Language) {
  const key = `${placeId}:${language}`;
  const saved = cache.get(key);
  if (saved) return saved;
  const request = getPlaceDetail(placeId, language).then(({ title, titleEn, category, position }) => ({
    title,
    titleEn,
    category,
    position,
  }));
  request.catch(() => cache.delete(key));
  cache.set(key, request);
  return request;
}

// 즐겨찾기 목록은 장소 ID만 주므로, 카드가 화면에 들어왔을 때 그 장소의 상세(GET /api/places/{placeId})·사진을 불러온다.
// 반환한 ref를 카드 바깥 요소에 단다. info: 불러오는 중 undefined, 실패 null / imageUrl: 불러오는 중 undefined(회색 칸)
export function useFavoritePlace<T extends HTMLElement>(placeId: string, language: Language) {
  const ref = useRef<T>(null);
  const [info, setInfo] = useState<FavoritePlaceInfo | null>();
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        getInfo(placeId, language)
          .then((result) => {
            if (!cancelled) setInfo(result);
          })
          .catch((e) => {
            console.warn(e);
            if (!cancelled) setInfo(null);
          });
        // 사진은 지도 카드와 같은 캐시를 쓴다.
        getPlaceThumbnail(placeId)
          .then((image) => {
            if (!cancelled) setImageUrl(image?.url ?? DEFAULT_PLACE_IMAGE);
          })
          .catch((e) => {
            console.warn(e);
            if (!cancelled) setImageUrl(DEFAULT_PLACE_IMAGE);
          });
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [placeId, language]);

  return { ref, info, imageUrl };
}
