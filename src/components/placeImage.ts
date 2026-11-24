import defaultImg from "../assets/all/default-img.jpg";

// 서버에 장소 사진이 없거나(빈 목록) 불러오지 못했을 때 대신 보여주는 기본 사진
export const DEFAULT_PLACE_IMAGE = defaultImg;

// 사진 주소가 깨졌으면 기본 사진으로 바꾼다. (기본 사진까지 깨지면 숨겨서 회색 칸을 보여준다)
export function showDefaultOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallback) {
    img.style.display = "none";
    return;
  }
  img.dataset.fallback = "true";
  img.src = DEFAULT_PLACE_IMAGE;
}
