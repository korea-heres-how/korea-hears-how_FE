import { type ReactNode, useState } from "react";
import { CustomOverlayMap, Map, useKakaoLoader } from "react-kakao-maps-sdk";
import { useT } from "../../../contexts/language";
import type { LatLng, MyLocationState } from "./useMyLocation";

const DEFAULT_LEVEL = 2;

type KakaoMapProps = {
  myLocation: MyLocationState;
  // 처음 지도 가운데. 주면 내 위치를 기다리지 않고 바로 이 위치로 지도를 만든다. (탭을 오가며 이전 조회 영역을 다시 보여줄 때)
  initialCenter?: LatLng;
  // 지도 객체가 만들어지면 넘겨준다. (현재 위치 버튼에서 panTo로 이동할 때 사용)
  onCreate?: (map: kakao.maps.Map) => void;
  // 사용자가 지도를 끌기 시작하면 알린다. (따라가기 모드 끄기)
  onDragStart?: () => void;
  // 지도 이동/줌이 끝날 때마다 알린다. (현재 영역으로 장소 조회)
  onIdle?: (map: kakao.maps.Map) => void;
  // 장소 마커 등 지도 위에 올릴 것들
  children?: ReactNode;
};

export default function KakaoMap({
  myLocation,
  initialCenter,
  onCreate,
  onDragStart,
  onIdle,
  children,
}: KakaoMapProps) {
  const t = useT();
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
  });

  // 앱 진입 시 처음 받은 위치(또는 기본 위치)로 한 번만 지도를 옮긴다. (initialCenter가 있으면 그 위치)
  // 이후에는 위치가 바뀌어도 지도는 그대로 두고 파란 점만 움직인다. (따라가기 모드일 때는 MapPage에서 지도를 옮긴다)
  const [center, setCenter] = useState<LatLng | null>(initialCenter ?? null);
  if (center === null && myLocation.status !== "loading") {
    setCenter(myLocation.position);
  }

  if (error) {
    return <MapMessage>{t("지도를 불러오지 못했어요.", "Couldn't load the map.")}</MapMessage>;
  }
  if (loading || center === null) {
    return <MapMessage>{t("지도를 불러오는 중이에요…", "Loading the map…")}</MapMessage>;
  }

  return (
    <Map
      center={center}
      level={DEFAULT_LEVEL}
      className="size-full"
      onCreate={onCreate}
      onDragStart={onDragStart}
      onIdle={onIdle}
    >
      {children}
      {myLocation.status === "success" && (
        <CustomOverlayMap
          position={myLocation.position}
          xAnchor={0.5}
          yAnchor={0.5}
          zIndex={10}
        >
          <MyLocationDot />
        </CustomOverlayMap>
      )}
    </Map>
  );
}

function MyLocationDot() {
  const t = useT();
  return (
    <span
      className="relative flex size-[22px] items-center justify-center"
      aria-label={t("내 위치", "My location")}
    >
      <span className="absolute inset-0 rounded-full bg-[#3B82F6]/25" />
      <span className="relative size-[14px] rounded-full border-[2.5px] border-white bg-[#3B82F6] shadow-[0_1px_4px_rgba(0,0,0,0.3)]" />
    </span>
  );
}

function MapMessage({ children }: { children: string }) {
  return (
    <div className="flex size-full items-center justify-center bg-[#ECE3D2] text-[min(0.8125rem,13px)] text-[rgba(43,33,24,0.55)]">
      {children}
    </div>
  );
}
