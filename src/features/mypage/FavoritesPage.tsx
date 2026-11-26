import { useCallback, useEffect, useRef, useState } from "react";
import { getFavorites } from "../../api/mypage/favorites";
import bookmark from "../../assets/mypage/bookmark.svg";
import { useT } from "../../contexts/language";
import { useMyLocation } from "../map/components/useMyLocation";
import ListPageLayout from "./components/ListPageLayout";
import PlaceCard from "./components/PlaceCard";

// 한 번에 불러오는 개수. 맨 아래까지 내리면 다음 페이지를 이어 붙인다.
const PAGE_SIZE = 20;

// 마이페이지 즐겨찾기 "전체 보기" 화면 (/mypage/favorites)
export default function FavoritesPage() {
  const t = useT();
  const myLocation = useMyLocation();
  const [placeIds, setPlaceIds] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<"loading" | "done" | "failed">("loading");
  const loadingRef = useRef(false);
  const nextPageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await getFavorites(nextPageRef.current, PAGE_SIZE);
      nextPageRef.current += 1;
      // 페이지 사이에 새로 저장·삭제되면 같은 장소가 두 번 올 수 있어서 겹치는 건 뺀다.
      setPlaceIds((prev) => [...prev, ...result.placeIds.filter((id) => !prev.includes(id))]);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setStatus("done");
    } catch (e) {
      console.error(e);
      // 실패하면 더 부르지 않는다. (화면을 다시 열면 처음부터 다시 시도)
      setStatus("failed");
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // 첫 페이지
  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  // 목록 맨 아래 기준점이 화면에 보이면 다음 페이지를 부른다.
  // placeIds가 늘어난 뒤에도 기준점이 여전히 보이면 이어서 부르도록 다시 관찰한다.
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, status, loadMore, placeIds]);

  const emptyText = {
    loading: "",
    done: t("즐겨찾기한 장소가 없습니다.", "No favorite places yet."),
    failed: t("즐겨찾기를 불러오지 못했어요.", "Couldn't load your favorites."),
  }[status];

  return (
    <ListPageLayout
      icon={bookmark}
      title={t("즐겨찾기", "Favorites")}
      sub={t("Favorites", "즐겨찾기")}
      description={t(
        "저장하거나 즐겨찾기한 장소와 가이드 모음이에요.",
        "Places and guides you've saved or added to favorites.",
      )}
      count={total}
      emptyText={emptyText}
    >
      {placeIds.map((placeId) => (
        <PlaceCard key={placeId} placeId={placeId} myLocation={myLocation} />
      ))}
      {status === "failed" && (
        <p className="py-[min(0.75rem,12px)] text-center text-[min(0.75rem,12px)] text-[rgba(43,33,24,0.45)]">
          {t("더 불러오지 못했어요.", "Couldn't load more.")}
        </p>
      )}
      {/* 다음 페이지를 부르는 기준점 */}
      {hasMore && status === "done" && <div ref={sentinelRef} className="h-px" />}
    </ListPageLayout>
  );
}
