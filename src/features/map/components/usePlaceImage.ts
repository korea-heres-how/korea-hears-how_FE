import { useEffect, useRef, useState } from "react";
import { getPlaceThumbnail } from "../../../api/map/images";

// 카드가 화면에 들어왔을 때만 그 장소 사진을 불러온다. (사진 API는 장소마다 요청 1번이라 한꺼번에 부르지 않는다)
// 반환한 ref를 카드 바깥 요소에 달면, 그 요소가 보일 때 imageUrl이 채워진다. 사진이 없거나 실패하면 undefined(회색 칸).
export function usePlaceImage<T extends HTMLElement>(placeId: string) {
  const ref = useRef<T>(null);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        getPlaceThumbnail(placeId)
          .then((image) => {
            if (!cancelled && image) setImageUrl(image.url);
          })
          .catch((e) => console.warn(e));
      },
      // 옆으로 넘기기 직전 카드도 미리 받아둔다.
      { rootMargin: "100px" },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [placeId]);

  return { ref, imageUrl };
}
