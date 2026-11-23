import searchIcon from "../../../assets/map/search.svg";
import { useT } from "../../../contexts/language";

const size = (px: number) => `min(${px / 16}rem, ${px}px)`;

// 지금 보이는 지도 영역으로 다시 검색하는 주황색 버튼 (map 화면 전용)
// TODO: 기능은 아직 없음 (나중에 MapPage의 searchArea와 연결)
export default function SearchAreaButton() {
  const t = useT();
  return (
    <button
      type="button"
      className="flex h-[min(2.125rem,34px)] items-center gap-[min(0.375rem,6px)] rounded-[min(1.25rem,20px)] bg-[#E07A5F] pr-[min(1.125rem,18px)] pl-[min(0.875rem,14px)] whitespace-nowrap text-[min(0.84375rem,13.5px)] font-semibold leading-[min(1.16rem,18.563px)] text-white"
    >
      <img src={searchIcon} alt="" style={{ width: size(18), height: size(18) }} />
      {t("이 위치에서 검색", "Search this area")}
    </button>
  );
}
