import type { Language } from "../../contexts/language";
import { apiRequest } from "../client";
import { toCategory } from "../map/nearby";
import type { PlaceDetail, PlaceScreenResponse } from "./types";

// GET /api/places/{placeId}?language
// 거리는 프론트에서 내 위치로 직접 계산하므로 latitude/longitude는 보내지 않는다.
export async function getPlaceDetail(placeId: string, language: Language): Promise<PlaceDetail> {
  const data = await apiRequest<PlaceScreenResponse>(`/api/places/${encodeURIComponent(placeId)}`, {
    query: { language },
  });
  const { header, basic_info: info } = data;
  return {
    id: header.place_id,
    title: header.name.ko ?? header.name.en ?? "",
    titleEn: header.name.en ?? header.name.ko ?? "",
    category: toCategory(header.category.code),
    subcategory: header.category.detail_label ?? "",
    status: header.business_status.label,
    statusColor: header.business_status.color,
    position: header.location ? { lat: header.location.latitude, lng: header.location.longitude } : null,
    overview: data.overview,
    etiquette: header.etiquette_preview,
    // 정보가 없으면 서버가 "정보 확인 필요"처럼 그 언어 문구를 text에 넣어 주므로 그대로 쓴다.
    info: {
      location: info.address.text,
      hours: info.opening_hours.text,
      closed: info.closed_days.text,
      admission: info.admission.text,
      parking: info.parking.text,
    },
  };
}
