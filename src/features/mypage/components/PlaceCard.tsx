import { useNavigate } from "react-router";
import arrow from "../../../assets/mypage/arrow-g.svg";
import { useLanguage, useT } from "../../../contexts/language";
import { useCategoryLabel } from "../../../contexts/labels";
import { type MyLocationState, myDistanceText } from "../../map/components/useMyLocation";
import Thumbnail from "./Thumbnail";
import { useFavoritePlace } from "./useFavoritePlace";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

type PlaceCardProps = {
  placeId: string;
  // 내 위치는 목록 화면에서 한 번만 받아 넘긴다. (카드마다 위치 추적을 켜지 않으려고)
  myLocation: MyLocationState;
};

// 즐겨찾기한 장소 카드 한 개. 누르면 장소 상세로 간다.
// 이름·분류·사진은 카드가 화면에 보일 때 불러오고, 그동안은 회색 칸으로 자리만 잡는다.
export default function PlaceCard({ placeId, myLocation }: PlaceCardProps) {
  const navigate = useNavigate();
  const t = useT();
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel();
  const { ref, info, imageUrl } = useFavoritePlace<HTMLButtonElement>(placeId, language);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => navigate(`/place/${encodeURIComponent(placeId)}`)}
      className="flex w-full items-center gap-[min(0.75rem,12px)] rounded-[min(0.5rem,8px)] border border-[rgba(43,33,24,0.05)] bg-white px-[min(0.8125rem,13px)] py-[min(0.6875rem,11px)] text-left"
    >
      <Thumbnail src={imageUrl} />
      <div className="min-w-0 flex-1">
        {info === undefined ? (
          // 불러오는 중: 글자 자리만 회색으로
          <>
            <span className="block h-[min(0.875rem,14px)] w-1/2 rounded-[min(0.25rem,4px)] bg-[rgba(43,33,24,0.06)]" />
            <span className="mt-[min(0.5rem,8px)] block h-[min(0.6875rem,11px)] w-1/3 rounded-[min(0.25rem,4px)] bg-[rgba(43,33,24,0.06)]" />
          </>
        ) : info === null ? (
          <p className="truncate text-[min(0.8125rem,13px)] leading-[min(1.3125rem,21px)] text-[rgba(43,33,24,0.45)]">
            {t("장소 정보를 불러오지 못했어요", "Couldn't load this place")}
          </p>
        ) : (
          <>
            {/* 큰 이름은 고른 언어, 작은 이름은 다른 언어 */}
            <p className="truncate text-[min(0.875rem,14px)] leading-[min(1.3125rem,21px)] font-semibold text-[#2B2118]">
              {language === "en" ? info.titleEn : info.title}
            </p>
            <p className="truncate text-[min(0.71875rem,11.5px)] leading-[min(1.078rem,17.25px)] text-[rgba(43,33,24,0.45)]">
              {language === "en" ? info.title : info.titleEn}
            </p>
            <p className="truncate pt-[min(0.125rem,2px)] text-[min(0.71875rem,11.5px)] leading-[min(1.078rem,17.25px)] text-[rgba(43,33,24,0.55)]">
              {/* 거리는 내 위치(GPS)가 있을 때만 */}
              {[categoryLabel(info.category), myDistanceText(myLocation, info.position, language)?.km]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </>
        )}
      </div>
      <img src={arrow} alt="" className="shrink-0" style={{ width: size(19), height: size(18) }} />
    </button>
  );
}
