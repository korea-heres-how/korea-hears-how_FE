import { useEffect, useState } from "react";
import { type FavoritePlace, getFavorites } from "../../api/mypage";
import bookmark from "../../assets/mypage/bookmark.svg";
import { useT } from "../../contexts/language";
import ListPageLayout from "./components/ListPageLayout";
import PlaceCard from "./components/PlaceCard";

// 마이페이지 즐겨찾기 "전체 보기" 화면 (/mypage/favorites)
export default function FavoritesPage() {
  const t = useT();
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch((e) => console.error(e));
  }, []);

  return (
    <ListPageLayout
      icon={bookmark}
      title={t("즐겨찾기", "Favorites")}
      sub={t("Favorites", "즐겨찾기")}
      description={t(
        "저장하거나 즐겨찾기한 장소와 가이드 모음이에요.",
        "Places and guides you've saved or added to favorites.",
      )}
      count={favorites.length}
      emptyText={t("즐겨찾기한 장소가 없습니다.", "No favorite places yet.")}
    >
      {favorites.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </ListPageLayout>
  );
}
