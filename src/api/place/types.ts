import type { NearbyPlace, StatusColor } from "../map/types";

// 관광지 상세 화면(/place/:id)에서 쓰는 장소 정보 (서버 응답에서 화면에 쓰는 값만 골라 바꾼 것)
export type PlaceDetail = {
  id: string;
  title: string; // 한국어 이름 (없으면 영어 이름)
  titleEn: string; // 영어 이름 (없으면 한국어 이름)
  category: NearbyPlace["category"]; // 지도와 같은 한국어 분류 값
  subcategory: string; // 세부 분류 — 요청한 언어로 온다 (없으면 "")
  status: string; // 운영 상태 문구 — 요청한 언어로 온다
  statusColor: StatusColor;
  position: { lat: number; lng: number } | null; // 거리 계산·작은 지도용. 없으면 둘 다 숨긴다
  overview: string | null; // 소개글 (여러 문단일 수 있다)
  etiquette: string | null; // 카테고리별 예절 한 문장 → "이것만 기억하세요"에 쓴다
  info: {
    location: string; // 주소
    hours: string;
    closed: string;
    admission: string;
    parking: string;
  };
};

// ---- 서버 응답 형태 (LocalizedPlaceScreen) — 화면에서 쓰는 필드만 적어둔다 ----
// action_guide(행동 가이드)·korean_phrases(현장 한국어)는 서버가 아직 미제공(null)이라 적지 않는다.
type ScreenText = { text: string; status: "available" | "missing" | "unavailable" };

export type PlaceScreenResponse = {
  header: {
    place_id: string;
    name: { ko: string | null; en: string | null };
    category: { code: string | null; label: string; detail_label: string | null };
    location: { latitude: number; longitude: number } | null;
    business_status: { label: string; color: StatusColor };
    etiquette_preview: string | null;
  };
  overview: string | null;
  basic_info: {
    address: ScreenText;
    opening_hours: ScreenText;
    closed_days: ScreenText;
    admission: ScreenText;
    parking: ScreenText;
  };
};
