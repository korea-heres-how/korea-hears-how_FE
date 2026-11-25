import { createContext, useContext } from "react";
import type { NearbyPlace } from "../api/map/types";

// 주변 장소를 조회한 영역 (지도 가운데 + 반경)
export type SearchArea = { latitude: number; longitude: number; radiusM: number };

// 지도 화면과 주변 탭이 같이 쓰는 "마지막으로 조회한 주변 장소".
// 지도에서 조회하면 주변 탭에도 같은 장소가 보이고, 탭을 오가도 다시 조회하지 않는다.
export type NearbyContextValue = {
  places: NearbyPlace[];
  // 마지막으로 조회한 영역. 아직 한 번도 조회하지 않았으면 null
  area: SearchArea | null;
  // loading: 조회 중(이전 결과가 남아 있음) / done: 다 받음 / error: 실패
  status: "idle" | "loading" | "done" | "error";
  // 이 영역으로 다시 조회한다. 언어는 지금 앱 언어를 쓰고, 언어가 바뀌면 마지막 영역을 자동으로 다시 조회한다.
  search: (area: SearchArea) => void;
  // 실패 팝업을 닫으면 부른다.
  dismissError: () => void;
};

export const NearbyContext = createContext<NearbyContextValue | null>(null);

export function useNearbyPlaces() {
  const value = useContext(NearbyContext);
  if (!value) throw new Error("useNearbyPlaces는 NearbyPlacesProvider 안에서만 쓸 수 있어요.");
  return value;
}
