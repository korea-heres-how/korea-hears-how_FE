import type { Language } from "../../contexts/language";

// 지도 화면에서 쓰는 주변 장소 한 개 (서버 응답에서 화면에 쓰는 값만 골라 바꾼 것)
export type NearbyPlace = {
  id: string; // place_id
  title: string; // 한국어 이름 (없으면 영어 이름)
  titleEn: string; // 영어 이름 (없으면 한국어 이름)
  category: "관광지" | "문화시설" | "음식점" | "시장" | "카페" | "기타"; // 헤더 탭·라벨과 같은 한국어 값
  subcategory: string; // 세부 분류 — 요청한 언어로 온다 (없으면 "")
  status: string; // 운영 상태 문구 — 요청한 언어로 온다
  statusColor: StatusColor; // 상태 점 색
  open: boolean; // 지금 영업 중인지 (business_status.state === "open") — 주변 탭 "영업 중" 필터
  tip: string; // Know before you go (예절 미리보기, 없으면 "")
  position: { lat: number; lng: number } | null; // 좌표가 없으면 마커를 못 그리고 거리도 숨긴다
  // 거리는 서버 값(지도 가운데 기준) 대신 내 위치로 프론트에서 계산한다. (useMyLocation의 myDistanceText)
};

export type StatusColor = "green" | "red" | "gray";

// ---- 서버 응답 형태 (LocalizedCardPage) — 화면에서 쓰는 필드만 적어둔다 ----
export type ServerCategoryCode = "attraction" | "culture" | "restaurant" | "market" | "cafe";

export type LocalizedCard = {
  place_id: string;
  name: { ko: string | null; en: string | null };
  category: { code: ServerCategoryCode | null; label: string; detail_label: string | null };
  location: { latitude: number; longitude: number } | null;
  business_status: { state: "open" | "closed" | "unknown"; label: string; color: StatusColor };
  etiquette_preview: string | null;
};

export type LocalizedCardPage = {
  pagination: { page: number; page_size: number; total_count: number; has_next: boolean };
  items: LocalizedCard[];
};

// 주변 장소 조회 조건 (radiusM은 서버 범위 1~20000m로 맞춰서 보낸다)
export type NearbyQuery = {
  latitude: number;
  longitude: number;
  radiusM: number;
  language: Language;
};

// ---- 장소 사진 ----
// 카드에 띄우는 사진 한 장
export type PlaceImage = {
  url: string;
};

// 서버 응답 data (ImagePage) 중 화면에서 쓰는 필드만 적어둔다.
// source·copyright_type(출처·저작권)도 오지만 지금은 표시하지 않아서 적지 않는다.
export type ServerImage = {
  url: string;
};

export type ImagePage = {
  place_id: string;
  pagination: { page: number; page_size: number; total_count: number; has_next: boolean };
  items: ServerImage[];
};
