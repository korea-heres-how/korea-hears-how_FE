import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { NearbyPlace } from "../../api/map/types";
import arrowOrange from "../../assets/map/arrow-orange.svg";
import AiButton from "../../components/AiButton";
import ErrorToast from "../../components/ErrorToast";
import { useLanguage, useT } from "../../contexts/language";
import { useNearbyPlaces } from "../../contexts/nearby";
import BottomSheet from "./components/BottomSheet";
import Header, { type Category } from "./components/header";
import KakaoMap from "./components/KakaoMap";
import LocationButton from "./components/LocationButton";
import NearbyListCard from "./components/NearbyListCard";
import NearbyPlaceCard from "./components/NearbyPlaceCard";
import PlaceMarker from "./components/PlaceMarker";
import SearchAreaButton from "./components/SearchAreaButton";
import { myDistanceText, useMyLocation } from "./components/useMyLocation";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 두 좌표 사이의 직선거리(m)
function distanceBetween(a: kakao.maps.LatLng, b: kakao.maps.LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.getLat() - a.getLat());
  const dLng = toRad(b.getLng() - a.getLng());
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.getLat())) * Math.cos(toRad(b.getLat())) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export default function MapPage() {
  const navigate = useNavigate();
  const t = useT();
  const { language } = useLanguage();
  const myLocation = useMyLocation();
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  // 따라가기 모드: 현재 위치 버튼을 누르면 켜지고, 지도를 끌면 꺼진다.
  const [following, setFollowing] = useState(false);

  // 조회 결과는 주변 탭과 같이 쓴다. (언어를 바꾸면 마지막 영역을 다시 조회하는 것도 여기서 한다)
  const { places, area, status, search, dismissError } = useNearbyPlaces();
  // 마커와 바텀시트 카드가 같이 쓰는 선택 상태.
  // 다시 조회해서 고른 장소가 새 결과에 없으면 선택이 풀린 것으로 본다. (카드를 눌러 지도가 옮겨진 경우처럼 새 결과에도 있으면 유지)
  const [pickedId, setSelectedId] = useState<string | null>(null);
  const selectedId = places.some((place) => place.id === pickedId) ? pickedId : null;
  // 다른 탭에 갔다 왔으면 이미 조회한 결과가 있으니 다시 조회하지 않고, 지도도 그 영역 가운데에서 시작한다.
  // (조회에 실패한 상태였다면 다시 조회한다)
  const [reused] = useState(() => area !== null && status !== "error");
  const searchedOnce = useRef(reused);
  const [initialCenter] = useState(() =>
    reused && area ? { lat: area.latitude, lng: area.longitude } : undefined,
  );
  // 헤더 카테고리 탭: 마커와 카드를 함께 거른다.
  const [category, setCategory] = useState<Category>("전체");
  const carouselRef = useRef<HTMLDivElement>(null);

  // 지도에 지금 보이는 영역으로 장소를 조회한다. (내 위치가 아니라 지도 화면 기준)
  // 서버는 "중심 + 반경"으로 찾으므로, 지도 가운데를 중심으로 화면 모서리까지 닿는 반경을 쓴다.
  const searchArea = (target: kakao.maps.Map) => {
    const center = target.getCenter();
    search({
      latitude: center.getLat(),
      longitude: center.getLng(),
      radiusM: distanceBetween(center, target.getBounds().getNorthEast()),
    });
  };

  // 앱 진입 시 한 번만 자동으로 조회한다. (지도가 내 위치를 중심으로 만들어지므로 내 위치 기준)
  // 그 뒤로는 지도를 움직여도 조회하지 않고, "이 위치에서 검색" 버튼을 눌러야 조회한다.
  const searchFirstTime = (target: kakao.maps.Map) => {
    if (searchedOnce.current) return;
    searchedOnce.current = true;
    searchArea(target);
  };

  // 카카오맵은 처음 그려질 때 idle 이벤트를 안 보내기도 해서(지도를 한 번 건드려야 옴),
  // 지도가 만들어지면 화면 배치가 끝난 다음 프레임에 바로 조회한다. idle은 혹시 몰라 그대로 둔다.
  useEffect(() => {
    if (!map) return;
    const frame = requestAnimationFrame(() => searchFirstTime(map));
    return () => cancelAnimationFrame(frame);
    // searchFirstTime은 searchedOnce로 한 번만 동작하므로 map이 생길 때만 실행하면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // 따라가기 중에는 내 위치가 바뀔 때마다 지도도 따라간다.
  useEffect(() => {
    if (!map || !following || myLocation.status === "loading") return;
    const { lat, lng } = myLocation.position;
    map.panTo(new kakao.maps.LatLng(lat, lng));
  }, [map, following, myLocation]);

  const visiblePlaces =
    category === "전체"
      ? places
      : places.filter((place) => place.category === category);
  // 선택한 장소는 카드 목록 맨 앞으로 보낸다.
  const orderedPlaces = [...visiblePlaces].sort(
    (a, b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId),
  );

  // 장소가 선택되면 맨 앞으로 온 카드가 보이게 가로 목록을 처음으로 되돌린다.
  useEffect(() => {
    carouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [selectedId]);

  const changeCategory = (next: Category) => {
    setCategory(next);
    // 선택된 장소가 걸러져서 안 보이게 되면 선택을 푼다.
    const selected = places.find((place) => place.id === selectedId);
    if (selected && next !== "전체" && selected.category !== next)
      setSelectedId(null);
  };

  // 카드를 누르면 해당 마커를 선택하고 지도를 그 장소로 옮긴다. (따라가기는 끈다)
  const selectFromCard = (place: NearbyPlace) => {
    setSelectedId(place.id);
    setFollowing(false);
    if (!place.position) return;
    const { lat, lng } = place.position;
    map?.panTo(new kakao.maps.LatLng(lat, lng));
  };

  const goToMyLocation = () => {
    setFollowing(true);
    // 이미 따라가기 중이어도 버튼을 누르면 바로 내 위치로 다시 맞춘다.
    if (map && myLocation.status !== "loading") {
      const { lat, lng } = myLocation.position;
      map.panTo(new kakao.maps.LatLng(lat, lng));
    }
  };

  return (
    // 화면 높이에서 하단 Nav(App의 main 아래 여백)만큼 뺀 높이를 헤더 + 지도가 나눠 쓴다.
    <div className="flex h-[calc(100svh-min(3.8125rem,61px)-env(safe-area-inset-bottom))] flex-col">
      {status === "error" && (
        <ErrorToast
          message={t("주변 장소를 불러오지 못했어요", "Couldn't load nearby places.")}
          onClose={dismissError}
        />
      )}
      <Header onCategoryChange={changeCategory} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <KakaoMap
          myLocation={myLocation}
          initialCenter={initialCenter}
          onCreate={setMap}
          onDragStart={() => setFollowing(false)}
          onIdle={searchFirstTime}
        >
          {/* 좌표가 없는 장소는 마커 없이 카드로만 보여준다. */}
          {visiblePlaces.map(
            (place) =>
              place.position && (
                <PlaceMarker
                  key={place.id}
                  position={place.position}
                  name={language === "en" ? place.titleEn : place.title}
                  distanceText={myDistanceText(myLocation, place.position, language)?.full}
                  selected={place.id === selectedId}
                  onClick={() => setSelectedId(place.id)}
                />
              ),
          )}
        </KakaoMap>
        {/* 현재 위치 버튼과 AI 버튼은 시트 위에 붙어서 시트와 같이 움직인다. */}
        <BottomSheet
          count={visiblePlaces.length}
          scrollResetKey={selectedId}
          action={
            <button
              type="button"
              onClick={() => navigate("/list")}
              className="flex items-center gap-[min(0.25rem,4px)] text-[min(0.78125rem,12.5px)] leading-[min(1.171875rem,18.75px)] text-[#E07A5F]"
            >
              {t("전체 보기", "View all")}
              <img
                src={arrowOrange}
                alt=""
                style={{ width: size(13), height: size(12.5) }}
              />
            </button>
          }
          expandedContent={
            <div className="flex flex-col gap-[min(0.75rem,12px)] px-[min(1rem,16px)] pb-[min(1rem,16px)]">
              {orderedPlaces.map((place) => (
                <NearbyListCard
                  key={place.id}
                  placeId={place.id}
                  title={place.title}
                  titleEn={place.titleEn}
                  category={place.category}
                  subcategory={place.subcategory}
                  status={place.status}
                  statusColor={place.statusColor}
                  tip={place.tip}
                  distanceText={myDistanceText(myLocation, place.position, language)?.km}
                  walkText={myDistanceText(myLocation, place.position, language)?.walk}
                  onClick={() => selectFromCard(place)}
                  onGuideClick={() => navigate(`/place/${place.id}`)}
                />
              ))}
            </div>
          }
          floatingCenter={<SearchAreaButton onClick={() => map && searchArea(map)} />}
          floating={
            <div className="flex flex-col items-center gap-[min(0.75rem,12px)]">
              <LocationButton onClick={goToMyLocation} />
              <AiButton />
            </div>
          }
        >
          {/* 중간 단계: 옆으로 넘겨 보는 카드 */}
          <div
            ref={carouselRef}
            className="flex snap-x gap-[min(0.625rem,10px)] overflow-x-auto scroll-px-[min(1rem,16px)] px-[min(1rem,16px)] pb-[min(0.25rem,4px)]"
          >
            {orderedPlaces.map((place) => (
              <NearbyPlaceCard
                key={place.id}
                place={place}
                distanceText={myDistanceText(myLocation, place.position, language)?.full}
                onClick={() => selectFromCard(place)}
                onGuideClick={() => navigate(`/place/${place.id}`)}
              />
            ))}
          </div>
          <p className="px-[min(1rem,16px)] pt-[min(0.5rem,8px)] text-center text-[min(0.6875rem,11px)] leading-[min(0.9453rem,15.125px)] text-[rgba(43,33,24,0.45)]">
            {t(
              <>
                카드를 누르면{" "}
                <span className="font-medium text-[rgba(43,33,24,0.7)]">
                  “여기서 어떻게 행동하는지”
                </span>{" "}
                볼 수 있어요.
              </>,
              <>
                Tap a card to see{" "}
                <span className="font-medium text-[rgba(43,33,24,0.7)]">“how to act here.”</span>
              </>,
            )}
          </p>
        </BottomSheet>
      </div>
    </div>
  );
}
