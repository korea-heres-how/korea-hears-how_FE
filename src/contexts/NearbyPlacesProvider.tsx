import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNearbyPlaces } from "../api/map/nearby";
import type { NearbyPlace } from "../api/map/types";
import { useLanguage } from "./language";
import { NearbyContext, type NearbyContextValue, type SearchArea } from "./nearby";

// 로그인한 화면들(RequireAuth 안)을 감싸서, 지도와 주변 탭이 같은 조회 결과를 쓰게 한다. 로그아웃하면 같이 비워진다.
export default function NearbyPlacesProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [area, setArea] = useState<SearchArea | null>(null);
  const [status, setStatus] = useState<NearbyContextValue["status"]>("idle");
  // 언어를 바꾸는 등 조회가 겹치면 마지막 요청의 결과만 쓴다.
  const latestRequest = useRef(0);
  // 늦게 불려도 지금 언어를 쓰도록 ref에서 읽는다.
  const languageRef = useRef(language);
  const areaRef = useRef(area);

  const search = useCallback(async (next: SearchArea) => {
    areaRef.current = next;
    setArea(next);
    setStatus("loading");
    const requestId = ++latestRequest.current;
    try {
      const result = await getNearbyPlaces({ ...next, language: languageRef.current });
      if (requestId !== latestRequest.current) return;
      setPlaces(result);
      setStatus("done");
    } catch (e) {
      if (requestId !== latestRequest.current) return;
      console.error(e);
      setPlaces([]);
      setStatus("error");
    }
  }, []);

  // 언어를 바꾸면 이름 외의 문구(상태·세부 분류·예절 팁)가 그 언어로 오므로 마지막으로 조회한 영역을 다시 조회한다.
  useEffect(() => {
    if (languageRef.current === language) return;
    languageRef.current = language;
    if (areaRef.current) search(areaRef.current);
  }, [language, search]);

  const dismissError = useCallback(() => setStatus((prev) => (prev === "error" ? "done" : prev)), []);

  const value = useMemo(
    () => ({ places, area, status, search, dismissError }),
    [places, area, status, search, dismissError],
  );
  return <NearbyContext.Provider value={value}>{children}</NearbyContext.Provider>;
}
