import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MIN_RADIUS_M } from "../../api/map/nearby";
import distanceIcon from "../../assets/around/distance.svg";
import nameIcon from "../../assets/around/name.svg";
import searchIcon from "../../assets/around/search.svg";
import timeIcon from "../../assets/around/time.svg";
import AiButton from "../../components/AiButton";
import CategoryChips from "../../components/CategoryChips";
import ErrorToast from "../../components/ErrorToast";
import { useLanguage, useT } from "../../contexts/language";
import { useNearbyPlaces } from "../../contexts/nearby";
import NearbyListCard from "../map/components/NearbyListCard";
import { distanceM, myDistanceText, useMyLocation } from "../map/components/useMyLocation";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 분류 칩: 지도 화면 카테고리와 같다.
const FILTERS = ["전체", "관광지", "문화시설", "음식점", "시장", "카페"] as const;
type Filter = (typeof FILTERS)[number];
type Sort = "distance" | "name";

// 하단 Nav "주변" 탭 (/list). 지도에서 마지막으로 조회한 장소를 그대로 목록으로 보여준다. (지도와 같은 조회 결과를 공유)
// 지도를 거치지 않고 바로 들어왔으면 내 위치 주변(반경 1km)으로 조회한다.
// 검색어·분류·영업 중 필터를 함께 적용하고, 가까운 순(내 위치 기준) 또는 이름순으로 정렬한다.
// "여기서는? 가이드"를 누르면 관광지 상세로 간다. 카드 자체를 누르는 동작은 없다.
export default function AroundPage() {
  const navigate = useNavigate();
  const t = useT();
  const { language } = useLanguage();
  const myLocation = useMyLocation();
  const { places, area, status, search, dismissError } = useNearbyPlaces();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("전체");
  const [sort, setSort] = useState<Sort>("distance");
  const [openOnly, setOpenOnly] = useState(false);

  // 아직 한 번도 조회하지 않았으면(지도를 안 거치고 들어옴) 내 위치를 받는 대로 그 주변을 조회한다.
  useEffect(() => {
    if (area !== null || myLocation.status === "loading") return;
    const { lat, lng } = myLocation.position;
    search({ latitude: lat, longitude: lng, radiusM: MIN_RADIUS_M });
  }, [area, myLocation, search]);

  // 가까운 순 정렬용 거리(m). 위치 권한이 없으면 서버가 준 순서(조회 영역 가운데에서 가까운 순)를 그대로 쓴다.
  const distanceOf = (position: { lat: number; lng: number } | null) =>
    myLocation.status === "success" && position ? distanceM(myLocation.position, position) : Infinity;

  // 분류 칩 개수는 검색어·영업 중 필터를 적용한 뒤의 개수로 보여준다.
  const keyword = query.trim().toLowerCase();
  const searched = places.filter(
    (place) =>
      (!openOnly || place.open) &&
      (keyword === "" ||
        [place.title, place.titleEn, place.subcategory].some((text) => text.toLowerCase().includes(keyword))),
  );
  const countOf = (item: Filter) =>
    item === "전체" ? searched.length : searched.filter((place) => place.category === item).length;

  const visible = searched
    .filter((place) => filter === "전체" || place.category === filter)
    // 이름순은 지금 언어의 큰 이름 기준
    .sort((a, b) =>
      sort === "distance"
        ? distanceOf(a.position) - distanceOf(b.position)
        : language === "en"
          ? a.titleEn.localeCompare(b.titleEn, "en")
          : a.title.localeCompare(b.title, "ko"),
    );
  // 처음 조회 중이라 아직 한 장소도 없을 때는 "없어요" 대신 불러오는 중이라고 보여준다.
  const loadingFirst = places.length === 0 && (status === "loading" || area === null);

  return (
    <div className="px-[min(1rem,16px)] pt-[min(1.5rem,24px)] pb-[min(5rem,80px)]">
      {status === "error" && (
        <ErrorToast
          message={t("주변 장소를 불러오지 못했어요", "Couldn't load nearby places.")}
          onClose={dismissError}
        />
      )}
      <header className="pb-[min(1rem,16px)]">
        <h1 className="text-[min(1.625rem,26px)] leading-[min(2.03rem,32.5px)] font-bold tracking-[-0.025em] text-[#2B2118]">
          {t("주변 장소", "Nearby Places")}
        </h1>
        {/* 큰 제목은 고른 언어, 작은 부제는 다른 언어 */}
        <p className="pt-[min(0.125rem,2px)] text-[min(0.6875rem,11px)] leading-[min(0.86rem,13.75px)] text-[rgba(43,33,24,0.45)]">
          {t("Nearby Places", "주변 장소")}
        </p>
        <p className="pt-[min(0.375rem,6px)] text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] text-[rgba(43,33,24,0.6)]">
          {t(
            "지도에서 본 장소들을 목록으로 둘러보세요. 각 장소마다 행동 가이드가 함께 있어요.",
            "Browse the places from the map as a list. Each place comes with a guide on how to act there.",
          )}
        </p>
      </header>

      {/* 검색 */}
      <label className="mt-[min(0.25rem,4px)] flex items-center gap-[min(0.5rem,8px)] rounded-[min(0.875rem,14px)] border border-[rgba(43,33,24,0.1)] bg-white px-[min(0.5rem,8px)] py-[min(0.375rem,6px)]">
        <span className="flex size-[min(2.25rem,36px)] shrink-0 items-center justify-center">
          <img src={searchIcon} alt="" style={{ width: size(15), height: size(14) }} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("장소, 음식, 키워드 검색", "Search places, food, keywords")}
          aria-label={t("장소 검색", "Search places")}
          className="min-w-0 flex-1 bg-transparent text-[min(0.875rem,14px)] leading-[min(1.25rem,20px)] text-[#2B2118] outline-none placeholder:text-[rgba(43,33,24,0.4)]"
        />
      </label>

      {/* 분류 칩 */}
      <CategoryChips
        className="pt-[min(0.625rem,10px)]"
        items={FILTERS.map((item) => ({ value: item, count: countOf(item) }))}
        selected={filter}
        onSelect={setFilter}
      />

      {/* 개수 + 정렬 */}
      <div className="flex flex-col gap-[min(0.625rem,10px)] pt-[min(1rem,16px)]">
        <p className="text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] text-[rgba(43,33,24,0.6)]">
          <span className="font-medium text-[#2B2118]">{visible.length}</span>
          {t("곳 찾았어요", visible.length === 1 ? " place found" : " places found")}
        </p>
        <div className="flex gap-[min(0.125rem,2px)] self-start rounded-full border border-[rgba(43,33,24,0.1)] bg-white p-[min(0.25rem,4px)]">
          <SortButton icon={distanceIcon} label={t("가까운 순", "Nearest")} active={sort === "distance"} onClick={() => setSort("distance")} />
          <SortButton icon={nameIcon} label={t("이름순", "Name")} active={sort === "name"} onClick={() => setSort("name")} />
          {/* 정렬과 별개로 켜고 끄는 필터 */}
          <SortButton icon={timeIcon} label={t("영업 중", "Open now")} active={openOnly} onClick={() => setOpenOnly((prev) => !prev)} />
        </div>
      </div>

      {/* 장소 목록 */}
      {visible.length === 0 ? (
        <p className="py-[min(1.5rem,24px)] text-center text-[min(0.8125rem,13px)] leading-[min(1.21875rem,19.5px)] text-[rgba(43,33,24,0.35)]">
          {loadingFirst
            ? t("주변 장소를 불러오는 중이에요…", "Loading nearby places…")
            : t("찾는 장소가 없어요.", "No places found.")}
        </p>
      ) : (
        <div className="flex flex-col gap-[min(0.75rem,12px)] pt-[min(1rem,16px)]">
          {visible.map((place) => {
            // 위치 권한이 없거나 좌표가 없으면 거리를 숨긴다.
            const distance = myDistanceText(myLocation, place.position, language);
            return (
              // 사진은 카드가 화면에 보일 때 불러오고, 없으면 기본 사진 (지도 목록 카드와 같다)
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
                distanceText={distance?.km}
                walkText={distance?.walk}
                onGuideClick={() => navigate(`/place/${place.id}`)}
              />
            );
          })}
        </div>
      )}

      <p className="pt-[min(1.25rem,20px)] text-center text-[min(0.75rem,12px)] leading-[min(1.125rem,18px)] text-[rgba(43,33,24,0.45)]">
        {t(
          <>
            카드를 누르면 그 장소의 <span className="font-medium text-[rgba(43,33,24,0.7)]">행동 가이드</span>가 열려요.
          </>,
          <>
            Tap a card to open that place's <span className="font-medium text-[rgba(43,33,24,0.7)]">guide</span>.
          </>,
        )}
      </p>

      {/* 하단 Nav 위 오른쪽에 떠 있는 AI 버튼 */}
      <div className="fixed right-[min(1rem,16px)] bottom-[calc(min(3.8125rem,61px)+min(1.1875rem,19px)+env(safe-area-inset-bottom))] z-40">
        <AiButton />
      </div>
    </div>
  );
}

function SortButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-[min(2.0625rem,33px)] items-center gap-[min(0.375rem,6px)] rounded-full px-[min(0.75rem,12px)] text-[min(0.75rem,12px)] leading-[min(1.125rem,18px)] ${
        active ? "bg-[#F1E6D2] text-[#2B2118]" : "text-[rgba(43,33,24,0.55)]"
      }`}
    >
      <img src={icon} alt="" className={active ? "" : "opacity-55"} style={{ width: size(15), height: size(14) }} />
      {label}
    </button>
  );
}
