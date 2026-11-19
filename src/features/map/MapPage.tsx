import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { formatDistance, formatKm, formatWalk, getNearbyPlaces, toRequestRadius } from "../../api/map/nearby";
import type { NearbyPlace } from "../../api/map/types";
import arrowOrange from "../../assets/map/arrow-orange.svg";
import AiButton from "../../components/AiButton";
import ErrorToast from "../../components/ErrorToast";
import PlaceListCard from "../../components/PlaceListCard";
import { useLanguage, useT } from "../../contexts/language";
import BottomSheet from "./components/BottomSheet";
import Header, { type Category } from "./components/header";
import KakaoMap from "./components/KakaoMap";
import LocationButton from "./components/LocationButton";
import NearbyPlaceCard from "./components/NearbyPlaceCard";
import PlaceMarker from "./components/PlaceMarker";
import { useMyLocation } from "./components/useMyLocation";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 지도 이동이 끝나고 이만큼 기다린 뒤 다시 조회한다. (연달아 움직일 때 요청이 몰리지 않게)
const SEARCH_DELAY_MS = 400;
// 확대 수준이 같을 때, 반경의 이 비율 이상 움직여야 다시 조회한다.
const MIN_MOVE_RATIO = 0.2;

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

  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const closeToast = useCallback(() => setLoadFailed(false), []);
  // 언어를 바꾸는 등 조회가 겹치면 마지막 요청의 결과만 쓴다.
  const latestRequest = useRef(0);
  // 마커와 바텀시트 카드가 같이 쓰는 선택 상태
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchedOnce = useRef(false);
  // 마지막으로 조회한 영역 (조금만 움직였을 때 다시 조회하지 않으려고 기억한다)
  const lastSearch = useRef<{ center: kakao.maps.LatLng; radiusM: number; level: number } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);
  // 헤더 카테고리 탭: 마커와 카드를 함께 거른다.
  const [category, setCategory] = useState<Category>("전체");
  const carouselRef = useRef<HTMLDivElement>(null);

  // 지도에 지금 보이는 영역으로 장소를 조회한다. ("이 지역에서 다시 검색" 버튼도 나중에 이 함수를 쓴다)
  // 서버는 "중심 + 반경"으로 찾으므로, 지도 가운데를 중심으로 화면 모서리까지 닿는 반경을 쓴다.
  const searchArea = async (target: kakao.maps.Map) => {
    const center = target.getCenter();
    const radiusM = distanceBetween(center, target.getBounds().getNorthEast());
    // 다시 조회할지 판단할 때는 실제로 검색한 반경(최소 1km 적용)을 기준으로 한다.
    lastSearch.current = { center, radiusM: toRequestRadius(radiusM), level: target.getLevel() };
    const requestId = ++latestRequest.current;
    try {
      const result = await getNearbyPlaces({
        latitude: center.getLat(),
        longitude: center.getLng(),
        radiusM,
        // 지도 이동 후 타이머로 불릴 때도 지금 언어를 쓰도록 ref에서 읽는다.
        language: languageRef.current,
      });
      if (requestId !== latestRequest.current) return;
      setPlaces(result);
      // 카드를 눌러 지도가 옮겨진 경우처럼, 고른 장소가 새 결과에도 있으면 선택을 유지한다.
      setSelectedId((prev) => (result.some((place) => place.id === prev) ? prev : null));
    } catch (e) {
      if (requestId !== latestRequest.current) return;
      console.error(e);
      setPlaces([]);
      setLoadFailed(true);
    }
  };

  // 앱 진입 시 현재 영역을 한 번 자동으로 조회한다.
  const searchFirstTime = (target: kakao.maps.Map) => {
    if (searchedOnce.current) return;
    searchedOnce.current = true;
    searchArea(target);
  };

  // 지도 이동·확대/축소가 끝날 때마다(idle) 보이는 영역으로 다시 조회한다.
  // - 연달아 움직이면 마지막 이동이 끝나고 SEARCH_DELAY_MS 뒤에 한 번만 요청한다.
  // - 확대 수준이 같고 조금만 움직였으면(반경의 MIN_MOVE_RATIO 미만) 다시 요청하지 않는다. (따라가기 중 GPS 흔들림 등)
  const handleIdle = (target: kakao.maps.Map) => {
    if (!searchedOnce.current) return searchFirstTime(target);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const last = lastSearch.current;
      if (
        last &&
        last.level === target.getLevel() &&
        distanceBetween(last.center, target.getCenter()) < last.radiusM * MIN_MOVE_RATIO
      )
        return;
      searchArea(target);
    }, SEARCH_DELAY_MS);
  };

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  // 카카오맵은 처음 그려질 때 idle 이벤트를 안 보내기도 해서(지도를 한 번 건드려야 옴),
  // 지도가 만들어지면 화면 배치가 끝난 다음 프레임에 바로 조회한다. idle은 혹시 몰라 그대로 둔다.
  useEffect(() => {
    if (!map) return;
    const frame = requestAnimationFrame(() => searchFirstTime(map));
    return () => cancelAnimationFrame(frame);
    // searchFirstTime은 searchedOnce로 한 번만 동작하므로 map이 생길 때만 실행하면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // 언어를 바꾸면 이름 외의 문구(상태·세부 분류·예절 팁)가 그 언어로 오므로 같은 영역을 다시 조회한다.
  useEffect(() => {
    if (map && searchedOnce.current) searchArea(map);
    // 언어가 바뀔 때만 다시 조회한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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
      {loadFailed && (
        <ErrorToast
          message={t("주변 장소를 불러오지 못했어요", "Couldn't load nearby places.")}
          onClose={closeToast}
        />
      )}
      <Header onCategoryChange={changeCategory} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <KakaoMap
          myLocation={myLocation}
          onCreate={setMap}
          onDragStart={() => setFollowing(false)}
          onIdle={handleIdle}
        >
          {/* 좌표가 없는 장소는 마커 없이 카드로만 보여준다. */}
          {visiblePlaces.map(
            (place) =>
              place.position && (
                <PlaceMarker
                  key={place.id}
                  position={place.position}
                  name={language === "en" ? place.titleEn : place.title}
                  distanceText={formatDistance(place, language)}
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
                <PlaceListCard
                  key={place.id}
                  title={place.title}
                  titleEn={place.titleEn}
                  category={place.category}
                  subcategory={place.subcategory}
                  status={place.status}
                  statusColor={place.statusColor}
                  tip={place.tip}
                  distanceText={formatKm(place)}
                  walkText={formatWalk(place, language)}
                  onClick={() => selectFromCard(place)}
                  onGuideClick={() => navigate(`/place/${place.id}`)}
                />
              ))}
            </div>
          }
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
                distanceText={formatDistance(place, language)}
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
